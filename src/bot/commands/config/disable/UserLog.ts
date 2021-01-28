import { SETTINGS } from '../../../util/Constants';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ConfigDisableUserLogCommand extends Command {
	public constructor() {
		super('config-disable-userlog', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {}
		});
	}

	public exec(message: Message) {
		this.client.settings.delete(message.guild!, SETTINGS.USER_LOG);
		return this.send(message, { content: `**User log channel disabled.**` });
	}
}
