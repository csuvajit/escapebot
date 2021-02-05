import { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler, Command, Flag } from 'discord-akairo';
import { APIApplicationCommandInteractionDataOption } from 'discord-api-types/v8';
import Interaction, { InteractionParser } from './Interaction';
import SettingsProvider from './SettingsProvider';
import RemindScheduler from './RemindScheduler';
import MuteScheduler from './MuteScheduler';
import TagsProvider from './TagsProvider';
import CaseHandler from './CaseHandler';
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
			allowedMentions: { repliedUser: false, parse: ['users'] },
			partials: ['MESSAGE', 'CHANNEL', 'REACTION']
		});

		// @ts-expect-error
		this.ws.on('INTERACTION_CREATE', async res => {
			const command = this.commandHandler.findCommand(res.data?.name);
			if (!command) return; // eslint-disable-line
			const interaction = await new Interaction(this, res).parse(res);
			// @ts-expect-error
			await this.api.interactions(res.id, res.token).callback.post({ data: { type: 5 } });
			if (!interaction.channel.permissionsFor(this.user!)!.has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) return;
			// @ts-expect-error
			if (await this.commandHandler.runPermissionChecks(interaction, command)) return;
			return this.handleInteraction(interaction, command, interaction.options);
		});
	}

	private contentParser(command: Command, content: string | APIApplicationCommandInteractionDataOption[]) {
		if (Array.isArray(content)) {
			// @ts-expect-error
			const contentParser = new InteractionParser({ flagWords: command.contentParser.flagWords, optionFlagWords: command.contentParser.optionFlagWords });
			return contentParser.parse(content);
		}
		// @ts-expect-error
		return command.contentParser.parse(content);
	}

	private async handleInteraction(interaction: Interaction, command: Command, content: string | APIApplicationCommandInteractionDataOption[]): Promise<any> {
		const parsed = this.contentParser(command, content);
		// @ts-expect-error
		const args = await command.argumentRunner.run(interaction, parsed, command.argumentGenerator);
		if (Flag.is(args, 'cancel')) {
			console.log('command_cancelled');
			return true;
		} else if (Flag.is(args, 'continue')) {
			const continueCommand = this.commandHandler.modules.get(args.command)!;
			return this.handleInteraction(interaction, continueCommand, args.rest);
		}

		// @ts-expect-error
		return this.commandHandler.runCommand(interaction, command, args);
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
