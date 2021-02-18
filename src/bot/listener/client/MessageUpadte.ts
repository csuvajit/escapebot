import { Message, Util, MessageEmbed, Channel } from 'discord.js';
import { SETTINGS } from '../../util/Constants';
import { Listener } from 'discord-akairo';
import * as diff from 'diff';

export default class MessageReactionRemoveListener extends Listener {
	public constructor() {
		super('messageUpdate', {
			event: 'messageUpdate',
			emitter: 'client',
			category: 'client'
		});
	}

	public exec(oldMessage: Message, newMessage: Message) {
		if (newMessage.partial || oldMessage.author.bot || newMessage.author.bot) return; // eslint-disable-line
		if (Util.escapeMarkdown(oldMessage.content) === Util.escapeMarkdown(newMessage.content)) return;
		const webhookID = this.client.settings.get<string>(newMessage.guild!, SETTINGS.WEBHOOK_LOG);
		if (webhookID) {
			const webhook = this.client.webhooks.get(webhookID);
			if (!webhook) return;

			const embed = new MessageEmbed()
				.setAuthor(`${newMessage.author.tag} (${newMessage.author.id})`, newMessage.author.displayAvatarURL());
			let msg = '';
			if (/```(.*?)```/s.test(oldMessage.content) && /```(.*?)```/s.test(newMessage.content)) {
				const strippedOldMessage = /```(?:(\S+)\n)?\s*([^]+?)\s*```/.exec(oldMessage.content)![2];
				const strippedNewMessage = /```(?:(\S+)\n)?\s*([^]+?)\s*```/.exec(newMessage.content)![2];
				if (strippedOldMessage === strippedNewMessage) return;
				const diffMessage = diff.diffLines(strippedOldMessage, strippedNewMessage, { newlineIsToken: true });
				for (const part of diffMessage) {
					if (part.value === '\n') continue;
					const d = part.added ? '+ ' : part.removed ? '- ' : '';
					msg += `${d}${part.value.replace(/\n/g, '')}\n`;
				}
				const prepend = '```diff\n';
				const append = '\n```';
				embed.setDescription(`${prepend}${msg.substring(0, 2000)}${append}`);
			} else {
				const diffMessage = diff.diffWords(
					Util.escapeMarkdown(oldMessage.content),
					Util.escapeMarkdown(newMessage.content)
				);
				for (const part of diffMessage) {
					const markdown = part.added ? '**' : part.removed ? '~~' : '';
					msg += `${markdown}${part.value}${markdown}`;
				}
				embed.setDescription(`${msg.substring(0, 2000)}` || '\u200b');
			}

			embed.addField('Message', `[Jump To](${newMessage.url})`, true);
			embed.setTimestamp(oldMessage.editedAt || newMessage.editedAt || new Date()); // eslint-disable-line

			return webhook.send(`${(newMessage.channel as Channel)!.toString()} (Message Update)`, {
				embeds: [embed],
				username: this.client.user!.username,
				avatarURL: this.client.user!.displayAvatarURL()
			});
		}
	}
}
