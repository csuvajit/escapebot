import { MessageEmbed, Message, Collection, Snowflake, Channel } from 'discord.js';
import { SETTINGS } from '../../util/Constants';
import { Listener } from 'discord-akairo';
import 'moment-duration-format';
import moment from 'moment';

export default class MessageDeleteBulkListener extends Listener {
	public constructor() {
		super('messageDeleteBulk', {
			event: 'messageDeleteBulk',
			emitter: 'client',
			category: 'client'
		});
	}

	public exec(messages: Collection<Snowflake, Message>) {
		const webhookID = this.client.settings.get<string>(messages.first()!.guild!, SETTINGS.WEBHOOK_LOG);
		if (webhookID) {
			const webhook = this.client.webhooks.get(webhookID);
			if (!webhook) return;

			const output = messages.filter(msg => !msg.partial).reduce((out, msg) => {
				const attachment = msg.attachments.first();
				out += `[${moment.utc(msg.createdTimestamp).format('YYYY/MM/DD hh:mm:ss')}] ${msg.author.tag} (${msg.author.id}): ${msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''}${attachment ? `\r\n${attachment.url}` : ''}\r\n`;
				return out;
			}, '');
			const embed = new MessageEmbed()
				.setAuthor(
					`${messages.first()!.author.tag} (${messages.first()!.author.id})`,
					messages.first()!.author.displayAvatarURL()
				)
				.addField('Logs', 'See attachment file for full logs.')
				.setTimestamp(new Date());

			return webhook.send(`${(messages.first()!.channel as Channel).toString()} (Bulk Message Delete)`, {
				embeds: [embed],
				files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
				username: this.client.user!.username,
				avatarURL: this.client.user!.displayAvatarURL()
			});
		}
	}
}
