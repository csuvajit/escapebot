import { BSONType, Collection, Db } from 'mongodb';
import { Guild } from 'discord.js';

interface Settings {
	id: string;
	settings: BSONType;
}

export default class SettingsProvider {
	protected db: Collection<Settings>;

	public settings = new Map();

	public constructor(db: Db) {
		this.db = db.collection('settings');
	}

	public async init() {
		const settings = await this.db.find().toArray();
		for (const data of settings) {
			this.settings.set(data.id, data.settings);
		}
	}

	public get<T>(guild: string | Guild, key: string, defaultValue: any): T {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		if (this.settings.has(id)) {
			const value = this.settings.get(id)[key];
			// eslint-disable-next-line
			return value == null ? defaultValue : value;
		}

		return defaultValue;
	}

	public async set(guild: string | Guild, key: string, value: any) {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		const data = this.settings.get(id) || {};
		data[key] = value;
		this.settings.set(id, data);
		return this.db.updateOne({ id }, { $set: { settings: data } }, { upsert: true });
	}

	public async delete(guild: string | Guild, key: string) {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		const data = this.settings.get(id) || {};
		delete data[key]; // eslint-disable-line

		return this.db.updateOne({ id }, { $set: { settings: data } });
	}

	public async clear(guild: string | Guild) {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		this.settings.delete(id);
		return this.db.deleteOne({ id });
	}

	private static guildID(guild: string | Guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return 'global'; // eslint-disable-line
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}
