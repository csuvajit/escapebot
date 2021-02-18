import { MessageEmbed, Message, Channel } from 'discord.js';
import { Listener } from 'discord-akairo';
import { SETTINGS } from '../../util/Constants';

export default class MessageDeleteListener extends Listener {
	public constructor() {
		super('messageDelete', {
			emitter: 'client',
			event: 'messageDelete',
			category: 'client'
		});
	}

	public exec(message: Message) {
		if (message.partial || message.author.bot) return; // eslint-disable-line
		if (!message.content) return;
		const webhookID = this.client.settings.get<string>(message.guild!, SETTINGS.WEBHOOK_LOG);
		if (webhookID) {
			const webhook = this.client.webhooks.get(webhookID);
			if (!webhook) return;

			const attachment = message.attachments.first();
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.setDescription(message.content.substring(0, 2048))
				.setTimestamp(new Date());
			if (attachment) embed.addField('Attachment', attachment.url);

			return webhook.send(`${(message.channel as Channel).toString()} (Message Delete)`, {
				embeds: [embed],
				username: this.client.user!.username,
				avatarURL: this.client.user!.displayAvatarURL()
			});
		}
	}
}
