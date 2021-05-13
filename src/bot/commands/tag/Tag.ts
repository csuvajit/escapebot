import { Command, Flag } from 'discord-akairo';

export default class TagCommand extends Command {
	public constructor() {
		super('tag', {
			aliases: ['tag'],
			category: 'tag',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {
				content: [
					'Create custom commands like... just try it ok?'
				],
				usage: '<method> <...arguments>',
				examples: []
			}
		});
	}

	public *args(): unknown {
		const sub = yield {
			type: [
				['tag-add', 'add'],
				['tag-show', 'show'],
				['tag-list', 'list'],
				['tag-delete', 'delete', 'del'],
				['tag-search', 'search']
			],
			otherwise: 'tag_command_failed'
		};

		return Flag.continue(sub);
	}
}
