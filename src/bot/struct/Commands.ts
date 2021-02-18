import { ApplicationCommandOptionType } from 'discord-api-types/v8';

export const TOGGLE = {
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

export const CONFIG = {
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

export const TAG = {
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

export const OTHERS = [
	{
		name: 'ping',
		description: 'Health check? Pong!'
	}
];
