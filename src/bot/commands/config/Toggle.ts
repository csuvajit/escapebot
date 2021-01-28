import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

const interaction = {
	name: 'toggle',
	description: 'Toggle features on the guild',
	options: [
		{
			name: 'rolestates',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			description: 'Enable or disable role states on the guild'
		},
		{
			name: 'moderation',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			description: 'Enable or disable moderation on the guild'
		},
		{
			name: 'webhooks',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			description: 'Enable or disable webhooks on the guild'
		}
	]
};

export default class ToggleCommand extends Command {
	public constructor() {
		super('toggle', {
			aliases: ['toggle'],
			category: 'config',
			typing: true,
			interaction,
			description: {
				content: [
					`${interaction.description}`,
					'',
					'**Method**',
					'• webhooks',
					'• rolestates',
					'• moderation'
				].join('\n'),
				examples: [],
				usage: '<method>'
			},
			args: [
				{
					id: 'method',
					type: ['webhooks', 'rolestates', 'moderation']
				}
			]
		});
	}

	public exec(message: Message, args: any) {
		console.log(args);
		return this.reply(message, { content: '**Slash commands refreshed.**' });
	}
}
