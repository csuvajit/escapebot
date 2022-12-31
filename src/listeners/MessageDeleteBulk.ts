import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Channel, Collection, Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import { Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'messageDeleteBulk' })
export class MessageDeleteBulk extends Listener {
    public async run(messages: Collection<string, Message>) {
        const webhookId = this.container.settings.get<string>(messages.first()!.guild!, Settings.WEBHOOK_LOG);
        const webhook = this.container.webhooks.get(webhookId);
        if (!webhook) return null;

        const output = messages
            .filter((msg) => !msg.partial)
            .reduce((out, msg) => {
                const attachment = msg.attachments.first();
                out += `[${moment.utc(msg.createdTimestamp).format('YYYY/MM/DD hh:mm:ss')}] ${msg.author.tag} (${msg.author.id}): ${
                    msg.cleanContent ? msg.cleanContent.replace(/\n/g, '\r\n') : ''
                }${attachment ? `\r\n${attachment.url}` : ''}\r\n`;
                return out;
            }, '');
        const embed = new MessageEmbed()
            .setAuthor({
                name: `${messages.first()!.author.tag} (${messages.first()!.author.id})`,
                iconURL: messages.first()!.author.displayAvatarURL()
            })
            .addFields({
				name: 'Logs',
				value: 'See attachment file for full logs.'
			})
            .setTimestamp(new Date());

        return webhook.send({
            embeds: [embed],
            username: this.container.client.user!.username,
            avatarURL: this.container.client.user!.displayAvatarURL(),
            files: [{ attachment: Buffer.from(output, 'utf8'), name: 'logs.txt' }],
            content: `${(messages.first()!.channel as Channel).toString()} (Bulk Message Delete)`
        });
    }
}
