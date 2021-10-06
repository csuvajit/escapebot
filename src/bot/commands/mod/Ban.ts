import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			channel: 'guild',
			typing: true,
			description: {
				content: 'Bans a user from the guild.',
				usage: '<user> [reason] [--days]',
				examples: ['@Suvajit DM ads --days 7']
			}
		});
	}

	public *args(): unknown {
		const user = yield {
			type: 'user'
		};

		const reason = yield {
			match: 'rest',
			type: 'string'
		};

		const days = yield {
			match: 'option',
			type: 'number',
			flag: ['--days', '-d']
		};

		return { user, reason, days };
	}

	public exec(message: Message, args: any) {
		console.log(args);
	}
}
