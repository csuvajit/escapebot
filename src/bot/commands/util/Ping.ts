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
			}
		});
	}

	public async exec(message: Message) {
		const msg = await message.util!.send('Pinging~');
		const ping = (msg.editedTimestamp ?? msg.createdTimestamp) - (message.editedTimestamp ?? message.createdTimestamp);
		return message.util!.send({
			embed: {
				description: `**Gateway Ping~ ${Math.round(this.client.ws.ping).toString()}ms** \n**API Ping~ ${ping.toString()}ms**`
			}
		});
	}
}
