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
		/* for await (const command of this.handler.modules.values()) {
			if (!command.interaction) continue;
			// ts-expect-error
			await this.client.api.applications(this.client.user!.id)
				.guilds(message.guild!.id)
				.commands.post({ data: command.interaction });
		}*/

		return message.util!.send('**Slash commands refreshed.**');
	}
}
