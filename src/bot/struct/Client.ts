import { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } from 'discord-akairo';
import SettingsProvider from './SettingsProvider';
import RemindScheduler from './RemindScheduler';
import { Connection } from './Database';
import TagsProvider from './TagsProvider';
import Logger from '../util/Logger';
import { Db } from 'mongodb';
import path from 'path';

declare module 'discord-akairo' {
	interface AkairoClient {
		db: Db;
		logger: Logger;
		tags: TagsProvider;
		settings: SettingsProvider;
		commandHandler: CommandHandler;
		remindScheduler: RemindScheduler;
	}
}

export default class Client extends AkairoClient {
	public db!: Db;

	public tags!: TagsProvider;

	public settings!: SettingsProvider;

	public logger: Logger = new Logger();

	public remindScheduler!: RemindScheduler;

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: path.join(__dirname, '..', 'commands'),
		prefix: message => this.settings.get(message.guild!, 'prefix', '?'),
		aliasReplacement: /-/g,
		allowMention: true,
		fetchMembers: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		commandUtilSweepInterval: 9e5,
		handleEdits: true,
		defaultCooldown: 3000
	});

	public listenerHandler = new ListenerHandler(this, {
		directory: path.join(__dirname, '..', 'listener')
	});

	public inhibitorHandler = new InhibitorHandler(this, {
		directory: path.join(__dirname, '..', 'inhibitor')
	});

	public constructor() {
		super({ ownerID: process.env.OWNER! }, {
			allowedMentions: { repliedUser: false }
		});
	}

	private async init() {
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler
		});

		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
		this.inhibitorHandler.loadAll();

		this.once('ready', () => this.run());

		await Connection.connect();
		this.db = Connection.db('escape');
		await Connection.createIndex(this.db);

		this.settings = new SettingsProvider(this.db);
		await this.settings.init();

		this.tags = new TagsProvider(this);
		this.remindScheduler = new RemindScheduler(this);
	}

	private async run() {
		await this.remindScheduler.init();
	}

	public async start(token: string) {
		await this.init();
		return this.login(token);
	}
}
