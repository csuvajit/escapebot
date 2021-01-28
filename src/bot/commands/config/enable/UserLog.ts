import { SETTINGS } from '../../../util/Constants';
import { Message, TextChannel } from 'discord.js';
import { Command } from 'discord-akairo';

export default class ConfigEnableUserLogCommand extends Command {
	public constructor() {
		super('config-enable-userlog', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {},
			optionFlags: ['--channel']
		});
	}

	public *args(msg: Message) {
		const slash = this.isInteraction(msg);

		const channel = yield {
			type: 'textChannel',
			match: slash ? 'option' : 'phrase',
			flag: '--channel'
		};

		return { channel };
	}

	public exec(message: Message, { channel }: { channel?: TextChannel }) {
		if (!channel) return this.send(message, { content: '**No matches found!**' });

		this.client.settings.set(message.guild!, SETTINGS.USER_LOG, channel.id);
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		return this.reply(message, { content: `**User log channel enabled.** [${channel.toString()}]` });
	}
}
