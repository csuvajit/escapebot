import Interaction from '../../struct/Interaction';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			channel: 'guild',
			typing: true,
			description: {
				content: 'Pings me!'
			},
			optionFlags: ['--user', '--reason', '--days']
		});
	}

	public *args(msg: Message) {
		const slash = this.isInteraction(msg);

		const user = yield {
			match: slash ? 'option' : 'phrase',
			type: 'user',
			flag: '--user'
		};

		const reason = yield {
			match: slash ? 'option' : 'rest',
			type: 'string',
			flag: '--reason'
		};

		const days = yield {
			match: 'option',
			type: 'number',
			flag: '--days'
		};

		return { user, reason, days };
	}

	public exec(message: Message | Interaction, args: any) {
		console.log(message, args);
	}
}
