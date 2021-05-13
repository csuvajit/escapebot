import { Command, Flag } from 'discord-akairo';

export default class ToggleCommand extends Command {
	public constructor() {
		super('toggle', {
			aliases: ['toggle'],
			category: 'config',
			userPermissions: ['MANAGE_GUILD'],
			typing: true,
			description: {
				content: [
					'Toggle features on the guild',
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

	public *args(): unknown {
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
