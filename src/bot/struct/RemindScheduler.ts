import Client from './Client';
import { Collection, ObjectId } from 'mongodb';
import { TextChannel } from 'discord.js';

export interface Reminder {
	_id?: ObjectId;
	user: string;
	dm: boolean;
	channel: string;
	reference: string;
	reason: string;
	triggersAt: Date;
	createdAt: Date;
}

export default class RemindScheduler {
	protected db!: Collection<Reminder>;

	private readonly refreshRate: number;
	private readonly queued = new Map();

	public constructor(private readonly client: Client) {
		this.refreshRate = 5 * 60 * 1000;
		this.db = this.client.db.collection('reminders');
	}

	public async create(reminder: Reminder) {
		const { insertedId } = await this.db.insertOne({
			user: reminder.user,
			dm: reminder.dm,
			channel: reminder.channel,
			reference: reminder.reference,
			reason: reminder.reason,
			triggersAt: reminder.triggersAt,
			createdAt: reminder.createdAt
		});

		if (reminder.triggersAt.getTime() < Date.now() + this.refreshRate) {
			this.queue(Object.assign(reminder, { _id: insertedId }));
		}
	}

	public queue(reminder: Reminder) {
		this.queued.set(
			reminder._id!.toHexString(),
			this.client.setTimeout(() => {
				this.trigger(reminder);
			}, reminder.triggersAt.getTime() - Date.now())
		);
	}

	public cancel(reminder: Reminder) {
		const timeoutId = this.queued.get(reminder._id!.toHexString());
		if (timeoutId) this.client.clearTimeout(timeoutId);
		return this.queued.delete(reminder._id!.toHexString());
	}

	public async delete(reminder: Reminder) {
		const timeoutId = this.queued.get(reminder._id!.toHexString());
		if (timeoutId) this.client.clearTimeout(timeoutId);
		this.queued.delete(reminder._id!.toHexString());
		return this.db.deleteOne({ _id: reminder._id });
	}

	public async trigger(reminder: Reminder) {
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
				await channel.send(content);
			} else {
				const user = await this.client.users.fetch(reminder.user).catch(() => null);
				if (user) await user.send(content);
			}
		} catch (error) {
			this.client.logger.error('Reminder Failed', { label: 'REMINDER' });
		}

		await this.delete(reminder);
		return true;
	}

	public async init() {
		await this._refresh();
		this.client.setInterval(this._refresh.bind(this), this.refreshRate);
	}

	private async _refresh() {
		const reminders = await this.db.find({
			triggersAt: { $lt: new Date(Date.now() + this.refreshRate) }
		}).toArray();

		const now = new Date();
		for (const reminder of reminders) {
			if (this.queued.has(reminder._id!.toHexString())) continue;

			if (reminder.triggersAt < now) {
				this.trigger(reminder);
			} else {
				this.queue(reminder);
			}
		}
	}
}
