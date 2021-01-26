import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import Interaction from '../../struct/Interaction';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

const interaction = {
	name: 'ping',
	description: 'Health check',
	options: [
		{
			name: 'hide',
			description: 'Hides the output',
			type: ApplicationCommandOptionType.BOOLEAN
		}
	]
};

export default class PingCommand extends Command {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			channel: 'guild',
			typing: true,
			interaction,
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
