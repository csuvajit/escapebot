import { Command, Flag } from 'discord-akairo';
import { ApplicationCommandOptionType } from 'discord-api-types/v8';

const interaction = {
	name: 'tag',
	description: 'Create custom commands like... just try it ok?',
	options: [
		{
			name: 'add',
			description: 'Create a new tag',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.STRING,
					description: 'Name of the tag',
					required: true
				},
				{
					name: 'content',
					description: 'Content of the tag',
					type: ApplicationCommandOptionType.STRING,
					required: true
				},
				{
					name: 'pin',
					description: 'Want me to pin it?',
					type: ApplicationCommandOptionType.BOOLEAN,
					required: false
				}
			]
		},
		{
			name: 'list',
			description: 'List all tags of a user or guild',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: 'user',
					description: 'Tags of the user?',
					type: ApplicationCommandOptionType.USER,
					required: false
				}
			]
		},
		{
			name: 'show',
			description: 'Find tags by name... heh!',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.STRING,
					description: 'Name of the tag?',
					required: true
				}
			]
		},
		{
			name: 'search',
			description: 'Search tags by name... heh!',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.STRING,
					description: 'Name of the tag?',
					required: true
				}
			]
		},
		{
			name: 'delete',
			description: 'Delete tags by name... heh!',
			type: ApplicationCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: 'name',
					type: ApplicationCommandOptionType.STRING,
					description: 'Name of the tag?',
					required: true
				}
			]
		}
	]
};

export default class TagCommand extends Command {
	public constructor() {
		super('tag', {
			aliases: ['tag'],
			category: 'tag',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {
				content: [
					`${interaction.description}`
				],
				usage: '<method> <...arguments>',
				examples: []
			}
		});
	}

	public *args() {
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
