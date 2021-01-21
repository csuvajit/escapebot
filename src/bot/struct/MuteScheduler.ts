import { CASES, COLLECTION, SETTINGS } from '../util/Constants';
import { Case } from './CaseHandler';
import { Collection } from 'mongodb';
import Client from './Client';

export default class MuteScheduler {
	protected collection!: Collection<Case>;

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

	public async add(mute: Case) {
		const { insertedId } = await this.client.cases.create(mute);
		if (mute.duration!.getTime() < Date.now() + this.refreshRate) {
			this.queue(Object.assign(mute, { _id: insertedId }));
		}
	}

	private queue(mute: Case) {
		this.queued.set(
			mute._id.toHexString(),
			this.client.setTimeout(() => {
				this.trigger(mute);
			}, mute.duration!.getTime() - Date.now())
		);
	}

	private cancel(mute: Case) {
		const timeoutId = this.queued.get(mute._id.toHexString());
		if (timeoutId) this.client.clearTimeout(timeoutId);
		this.queued.delete(mute._id.toHexString());
		return this.collection.updateOne({ _id: mute._id }, { $set: { processed: true } });
	}

	private async trigger(mute: Case) {
		const guild = this.client.guilds.cache.get(mute.guild);
		if (!guild) return this.cancel(mute);

		this.client.logger.info(`Unmuted ${mute.user_tag} on ${guild.name}`, { label: 'MUTES' });
		const role_id = this.client.settings.get<string>(guild, SETTINGS.MUTE_ROLE, 0);
		const member = await guild.members.fetch(mute.user_id).catch(() => null);

		await this.collection.updateOne({ _id: mute._id }, { $set: { processed: true } });
		if (member && role_id) {
			try {
				await member.roles.remove(role_id, 'Unmuted automatically based on duration.');
			} catch { }
		}

		return this.cancel(mute);
	}

	private async _refresh() {
		const mutes = await this.collection.find({
			updatedAt: { $lt: new Date(Date.now() + this.refreshRate) },
			processed: false, action: CASES.ACTION.MUTE
		}).toArray();

		const now = new Date();
		for (const mute of mutes) {
			if (this.queued.has(mute._id.toHexString())) continue;

			if (mute.duration! < now) {
				this.trigger(mute);
			} else {
				this.queue(mute);
			}
		}
	}
}
