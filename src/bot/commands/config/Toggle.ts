import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { Command, Flag } from 'discord-akairo';

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
			userPermissions: ['MANAGE_GUILD'],
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
			}
		});
	}

	public *args() {
		const sub = yield {
			type: [
				['toggle-rolestate', 'rolestate', 'rolestates'],
				['toggle-webhooks', 'webhooks', 'webhook'],
				['toggle-moderation', 'moderation', 'mod']
			],
			otherwise: 'toggle_command_failed'
		};

		return Flag.continue(sub);
	}
}
