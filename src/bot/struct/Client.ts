import { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler } from 'discord-akairo';
import SettingsProvider from './SettingsProvider';
import RemindScheduler from './RemindScheduler';
import MuteScheduler from './MuteScheduler';
import TagsProvider from './TagsProvider';
import CaseHandler from './CaseHandler';
import Interaction from './Interaction';
import { Connection } from './Database';
import Logger from '../util/Logger';
import { Db } from 'mongodb';
import path from 'path';

declare module 'discord-akairo' {
	interface AkairoClient {
		db: Db;
		logger: Logger;
		tags: TagsProvider;
		cases: CaseHandler;
		mutes: MuteScheduler;
		settings: SettingsProvider;
		reminders: RemindScheduler;
		commandHandler: CommandHandler;
	}
}

export default class Client extends AkairoClient {
	public db!: Db;

	public tags!: TagsProvider;

	public cases!: CaseHandler;

	public mutes!: MuteScheduler;

	public reminders!: RemindScheduler;

	public settings!: SettingsProvider;

	public logger: Logger = new Logger();

	public commandHandler: CommandHandler = new CommandHandler(this, {
		directory: path.join(__dirname, '..', 'commands'),
		prefix: message => this.settings.get(message.guild!, 'prefix', '?'),
		aliasReplacement: /-/g,
		allowMention: true,
		fetchMembers: true,
		commandUtil: true,
		handleEdits: true,
		defaultCooldown: 3000,
		commandUtilLifetime: 3e5,
		commandUtilSweepInterval: 9e5
	});

	public listenerHandler = new ListenerHandler(this, {
		directory: path.join(__dirname, '..', 'listener')
	});

	public inhibitorHandler = new InhibitorHandler(this, {
		directory: path.join(__dirname, '..', 'inhibitor')
	});

	public constructor() {
		super({ ownerID: process.env.OWNER! }, {
			allowedMentions: { repliedUser: false, parse: ['users'] }
		});

		// @ts-expect-error
		this.ws.on('INTERACTION_CREATE', async res => {
			const command = this.commandHandler.modules.get(res.data?.name);
			if (!command) return;
			const interaction = await new Interaction(this, res).parse(this, res);
			return this.commandHandler.handleInteractionCommand(interaction, command);
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
		this.cases = new CaseHandler(this);
		this.mutes = new MuteScheduler(this);
		this.reminders = new RemindScheduler(this);
	}

	private async run() {
		await this.mutes.init();
		await this.reminders.init();
	}

	public async start(token: string) {
		await this.init();
		return this.login(token);
	}
}
