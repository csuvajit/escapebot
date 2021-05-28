import { AkairoClient, CommandHandler, ListenerHandler, InhibitorHandler, Command, Flag } from 'discord-akairo';
import { APIApplicationCommandInteractionDataOption, APIInteraction } from 'discord-api-types/v8';
import Interaction, { InteractionParser } from './Interaction';
import SettingsProvider from './SettingsProvider';
import RemindScheduler from './RemindScheduler';
import { Webhook, Intents } from 'discord.js';
import { SETTINGS } from '../util/Constants';
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
		webhooks: Map<string, Webhook>;
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

	public webhooks = new Map<string, Webhook>();

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
		super({
			intents: Intents.ALL,
			ownerID: process.env.OWNER!,
			partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
			allowedMentions: { repliedUser: false, parse: ['users'] }
		});

		this.ws.on('INTERACTION_CREATE', async (res: APIInteraction) => {
			const interaction = await new Interaction(this, res).parse(res);
			if (interaction.type === 3) return this.handleComponent(interaction, res);

			const command = this.commandHandler.findCommand(res.data!.name);
			if (!command || !res.member) return; // eslint-disable-line

			if (!interaction.channel.permissionsFor(this.user!)!.has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
				const perms = interaction.channel.permissionsFor(this.user!)!.missing(['SEND_MESSAGES', 'VIEW_CHANNEL'])
					.map(perm => {
						if (perm === 'VIEW_CHANNEL') return 'Read Messages';
						return perm.replace(/_/g, ' ').toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase());
					});

				// @ts-expect-error
				return this.api.interactions(res.id, res.token).callback.post({
					data: {
						type: 4,
						data: {
							content: `Missing **${perms.join('** and **')}** permission${perms.length > 1 ? 's' : ''}.`,
							flags: 64
						}
					}
				});
			}

			const flags = ['help', 'invite', 'stats', 'guide'].includes(command.id) ? 64 : 0;
			// @ts-expect-error
			await this.api.interactions(res.id, res.token).callback.post({ data: { type: 5, data: { flags } } });
			return this.handleInteraction(interaction, command, interaction.options);
		});
	}

	private async handleComponent(interaction: Interaction, res: APIInteraction) {
		// @ts-expect-error
		if (['ROLE_ADD', 'ROLE_REMOVE'].includes(res.data.custom_id)) return this.addRole(interaction);
		// @ts-expect-error
		if (['ACCEPT_INTENT', 'REJECT_INTENT'].includes(res.data.custom_id)) return this.handleIntents(res);
	}

	private handleIntents(res: APIInteraction) {
		// @ts-expect-error
		if (res.data.custom_id === 'ACCEPT_INTENT') {
			// @ts-expect-error
			return this.api.channels[res.channel_id].messages[res.message.id].patch({ data: { components: [] } });
		}

		// @ts-expect-error
		return this.api.channels[res.channel_id].messages[res.message.id].delete();
	}

	private async addRole(message: Interaction) {
		// @ts-expect-error
		if (!['ROLE_ADD', 'ROLE_REMOVE'].includes(message.data.custom_id)) return;
		const roleID = this.settings.get<string>(message.guild, SETTINGS.REACTION_ROLE, '807254345526804522');
		if (!message.guild.roles.cache.has(roleID)) return;

		// @ts-expect-error
		if (message.data.custom_id === 'ROLE_ADD') {
			if (!message.member.roles.cache.has(roleID)) {
				await message.member.roles.add(roleID).catch(() => null);
			}

			return message.reply(`**You have got <@&${roleID}> role!**`);
		}

		if (message.member.roles.cache.has(roleID)) {
			await message.member.roles.remove(roleID).catch(() => null);
		}

		return message.reply(`**You have got <@&${roleID}> role removed!**`);
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

	private async handleInteraction(interaction: Interaction, command: Command, content: string | APIApplicationCommandInteractionDataOption[], ignore = false): Promise<any> {
		if (!ignore) {
			// @ts-expect-error
			if (await this.commandHandler.runPostTypeInhibitors(interaction, command)) return;
		}
		const parsed = this.contentParser(command, content);
		// @ts-expect-error
		const args = await command.argumentRunner.run(interaction, parsed, command.argumentGenerator);
		if (Flag.is(args, 'cancel')) {
			return this.commandHandler.emit('commandCancelled', interaction, command);
		} else if (Flag.is(args, 'continue')) {
			const continueCommand = this.commandHandler.modules.get(args.command)!;
			return this.handleInteraction(interaction, continueCommand, args.rest, args.ignore);
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

		await Connection.connect().then(() => this.logger.info('Connected to MongoDB', { label: 'DATABASE' }));
		this.db = Connection.db('escape');
		// await Connection.createIndex(this.db);

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
