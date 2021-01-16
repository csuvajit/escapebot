import { BSONType, Collection, Db } from 'mongodb';
import { COLLECTION } from '../util/Constants';
import { Guild } from 'discord.js';

interface Settings {
	guild: string;
	settings: BSONType;
}

export default class SettingsProvider {
	protected collection: Collection<Settings>;

	public settings = new Map();

	public constructor(db: Db) {
		this.collection = db.collection(COLLECTION.SETTINGS);
	}

	public async init() {
		await this.collection.find()
			.forEach(data => this.settings.set(data.guild, data.settings));
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
		return this.collection.updateOne({ guild: id }, { $set: { settings: data } }, { upsert: true });
	}

	public async delete(guild: string | Guild, key: string) {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		const data = this.settings.get(id) || {};
		delete data[key]; // eslint-disable-line

		return this.collection.updateOne({ guild: id }, { $set: { settings: data } });
	}

	public async clear(guild: string | Guild) {
		const id = (this.constructor as typeof SettingsProvider).guildID(guild);
		this.settings.delete(id);
		return this.collection.deleteOne({ guild: id });
	}

	private static guildID(guild: string | Guild) {
		if (guild instanceof Guild) return guild.id;
		if (guild === 'global' || guild === null) return 'global'; // eslint-disable-line
		if (typeof guild === 'string' && /^\d+$/.test(guild)) return guild;
		throw new TypeError('Invalid guild specified. Must be a Guild instance, guild ID, "global", or null.');
	}
}
