import { Command, Argument } from 'discord-akairo';
import { Message, User, TextChannel, Webhook } from 'discord.js';

export default class PurgeCommand extends Command {
	public constructor() {
		super('purge', {
			aliases: ['purge', 'clear'],
			category: 'mod',
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: ['MANAGE_GUILD'],
			cooldown: 5000,
			args: [
				{
					'id': 'end',
					'default': 0,
					'type': Argument.range('integer', 0, 100, true)
				},
				{
					id: 'user',
					type: Argument.union('user', async (msg, id) => {
						const webhooks = await msg.guild?.fetchWebhooks();
						return webhooks?.get(id) ?? null;
					}),
					prompt: {
						retry: 'Specify a valid User ID!',
						optional: true
					}
				},
				{
					'id': 'start',
					'match': 'option',
					'flag': ['--start', '-s'],
					'type': 'number',
					'default': 0
				}
			],
			description: {
				content: 'Clears messages upto 100.',
				usage: '<number> [@user]',
				examples: ['10', '10 @Suvajit']
			}
		});
	}

	public async exec(message: Message, { user, start, end }: { user?: User | Webhook; start: number; end: number }) {
		const messages = await message.channel.messages.fetch({ limit: 100 });
		return (message.channel as TextChannel).bulkDelete(messages.filter(msg => user ? msg.author.id === user.id : true).toJSON().slice(start, end), true);
	}
}
