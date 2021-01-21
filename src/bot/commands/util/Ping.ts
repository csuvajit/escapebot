import Interaction from '../../struct/Interaction';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			channel: 'guild',
			typing: true,
			description: {
				content: 'Pings me!'
			},
			args: [
				{
					id: 'hide',
					match: 'flag',
					flag: ['--hide']
				}
			]
		});
	}

	public exec(message: Message | Interaction, { hide }: { hide: boolean }) {
		return this.send(message, {
			flags: hide ? 64 : 0,
			content: `**Gateway Ping~ ${Math.round(this.client.ws.ping).toString()}ms**`
		});
	}
}
