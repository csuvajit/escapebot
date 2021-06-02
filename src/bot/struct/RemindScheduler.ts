import { Collection, ObjectId } from 'mongodb';
import { COLLECTION } from '../util/Constants';
import { Snowflake, TextChannel } from 'discord.js';
import Client from './Client';

export interface Reminder {
	_id: ObjectId;
	user: Snowflake;
	dm: boolean;
	channel: Snowflake;
	reference: string;
	reason: string;
	duration: Date;
	createdAt: Date;
}

export default class RemindScheduler {
	protected collection!: Collection<Reminder>;

	private readonly refreshRate: number;
	private readonly queued = new Map();

	public constructor(private readonly client: Client) {
		this.refreshRate = 5 * 60 * 1000;
		this.collection = this.client.db.collection(COLLECTION.REMINDERS);
	}

	public async init() {
		await this._refresh();
		this.client.setInterval(this._refresh.bind(this), this.refreshRate);
	}

	public async create(reminder: Omit<Reminder, '_id'>) {
		const { insertedId } = await this.collection.insertOne({
			user: reminder.user,
			dm: reminder.dm,
			channel: reminder.channel,
			reference: reminder.reference,
			reason: reminder.reason,
			duration: reminder.duration,
			createdAt: reminder.createdAt
		});

		if (reminder.duration.getTime() < Date.now() + this.refreshRate) {
			this.queue(Object.assign(reminder, { _id: insertedId }));
		}
	}

	private queue(reminder: Reminder) {
		this.queued.set(
			reminder._id.toHexString(),
			this.client.setTimeout(() => {
				this.trigger(reminder);
			}, reminder.duration.getTime() - Date.now())
		);
	}

	private async delete(reminder: Reminder) {
		const timeoutId = this.queued.get(reminder._id.toHexString());
		if (timeoutId) this.client.clearTimeout(timeoutId);
		this.queued.delete(reminder._id.toHexString());
		return this.collection.deleteOne({ _id: reminder._id });
	}

	private async trigger(reminder: Reminder) {
		try {
			const content = [
				`**Here\'s a reminder for you!** ${reminder.dm ? '' : `<@${reminder.user}>`}`,
				'',
				`**Reminder:** ${reminder.reason}`,
				'',
				`**Reference:** ${reminder.reference}`
			];

			const channel = !reminder.dm && (this.client.channels.cache.get(reminder.channel) as TextChannel);
			if (channel) {
				await channel.send(content.join('\n'));
			} else {
				const user = await this.client.users.fetch(reminder.user).catch(() => null);
				if (user) await user.send(content.join('\n'));
			}
		} catch (error) {
			this.client.logger.error('Reminder Failed', { label: 'REMINDER' });
		}

		await this.delete(reminder);
		return true;
	}

	private async _refresh() {
		const reminders = await this.collection.find({
			duration: { $lt: new Date(Date.now() + this.refreshRate) }
		}).toArray();

		const now = new Date();
		for (const reminder of reminders) {
			if (this.queued.has(reminder._id.toHexString())) continue;

			if (reminder.duration < now) {
				this.trigger(reminder);
			} else {
				this.queue(reminder);
			}
		}
	}
}
