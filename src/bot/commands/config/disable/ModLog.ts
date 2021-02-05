import { SETTINGS } from '../../../util/Constants';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ConfigDisableModLogCommand extends Command {
	public constructor() {
		super('config-disable-modlog', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {}
		});
	}

	public exec(message: Message) {
		this.client.settings.delete(message.guild!, SETTINGS.MOD_LOG);
		return message.util!.send(`**Moderation channel disabled.**`);
	}
}
