import { SETTINGS } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';
import { Command } from 'discord-akairo';

export default class ConfigEnableUserLogCommand extends Command {
	public constructor() {
		super('config-enable-userlog', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {}
		});
	}

	public *args(): unknown {
		const channel = yield {
			type: 'textChannel'
		};

		return { channel };
	}

	public exec(message: Message, { channel }: { channel?: TextChannel }) {
		if (!channel) return message.util!.send('**No matches found!**');

		this.client.settings.set(message.guild!, SETTINGS.USER_LOG, channel.id);
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		return message.util!.send(`**User log channel enabled.** [${channel.toString()}]`);
	}
}
