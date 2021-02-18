import * as Commands from '../../struct/Commands';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ConfigRefreshCommand extends Command {
	public constructor() {
		super('config-refresh', {
			aliases: ['refresh'],
			category: 'config',
			typing: true,
			ownerOnly: true,
			description: {}
		});
	}

	public async exec(message: Message) {
		// @ts-expect-error
		await this.client.api.applications(this.client.user!.id)
			.guilds(message.guild!.id)
			.commands.put({ data: [Commands.CONFIG, Commands.TOGGLE, Commands.TAG, ...Commands.OTHERS] });

		return message.util!.send('**Slash commands refreshed.**');
	}
}
