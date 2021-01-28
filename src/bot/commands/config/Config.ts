import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { Flag, Command } from 'discord-akairo';

const interaction = {
	name: 'config',
	description: 'Enable and disable features on the guild',
	options: [
		{
			name: 'set',
			description: 'Enable features on the guild',
			type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
			options: [
				{
					name: 'restrict',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					description: 'Restricted roles of the guild',
					options: [
						{
							name: 'reaction',
							description: 'Reaction restricted role',
							type: ApplicationCommandOptionType.ROLE,
							required: true
						},
						{
							name: 'emoji',
							description: 'Emoji restricted role',
							type: ApplicationCommandOptionType.ROLE,
							required: true
						},
						{
							name: 'embed',
							description: 'Embed restricted role',
							type: ApplicationCommandOptionType.ROLE,
							required: true
						}
					]
				},
				{
					name: 'modlog',
					description: 'Moderation channel of the guild',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					options: [
						{
							name: 'channel',
							description: 'Moderation channel',
							type: ApplicationCommandOptionType.CHANNEL,
							required: true
						}
					]
				},
				{
					name: 'muted',
					description: 'Mute role of the guild',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					options: [
						{
							name: 'role',
							description: 'Mute role',
							type: ApplicationCommandOptionType.ROLE,
							required: true
						}
					]
				},
				{
					name: 'userlog',
					description: 'User Log channel of the guild',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					options: [
						{
							name: 'channel',
							description: 'User Log channel',
							type: ApplicationCommandOptionType.CHANNEL,
							required: true
						}
					]
				}
			]
		},
		{
			name: 'del',
			description: 'Disable features on the guild',
			type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
			options: [
				{
					name: 'restrict',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					description: 'Restricted roles of the guild'
				},
				{
					name: 'modlog',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					description: 'Modeartion channel of the guild'
				},
				{
					name: 'muted',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					description: 'Mute role of the guild'
				},
				{
					name: 'userlog',
					type: ApplicationCommandOptionType.SUB_COMMAND,
					description: 'User Log channel of the guild'
				}
			]
		}
	]
};

export default class ConfigCommand extends Command {
	public constructor() {
		super('config', {
			aliases: ['config'],
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			userPermissions: ['MANAGE_GUILD'],
			typing: true,
			interaction,
			description: {
				content: [
					`${interaction.description}`,
					'',
					'**Methods**',
					'• set `<key> <...arguments>`',
					'• del `<key>`',
					'',
					'**Keys**',
					'• `muted <role>`',
					'• `restrict <roles>`',
					'• `modlog <channel>`',
					'• `userlog <channel>`',
					'• `webhook <channel>`'
				],
				usage: '<method> <...arguments>',
				examples: []
			}
		});
	}

	public *args() {
		const sub = yield {
			type: [
				['config-refresh', 'refresh'],
				['config-enable', 'enable', 'set'],
				['config-disable', 'disable', 'del']
			],
			otherwise: 'config_command_failed'
		};

		return Flag.continue(sub);
	}
}
