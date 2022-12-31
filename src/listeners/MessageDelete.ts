import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Channel, Message, MessageEmbed } from 'discord.js';
import { Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'messageDelete' })
export class MessageDelete extends Listener {
    public async run(message: Message) {
        if (message.partial) return null; // eslint-disable-line
        if (message.author.bot) return null;
        if (!message.content) return null;

        const webhookId = this.container.settings.get<string>(message.guild!, Settings.WEBHOOK_LOG);
        if (!webhookId) return null;

        const webhook = this.container.webhooks.get(webhookId);
        if (!webhook) return null;

        const attachment = message.attachments.first();
        const embed = new MessageEmbed()
            .setAuthor({ name: `${message.author.tag} (${message.author.id})`, iconURL: message.author.displayAvatarURL() })
            .setDescription(message.content.substring(0, 2048))
            .setTimestamp(new Date());
        if (attachment) embed.addFields([{ name: 'Attachment', value: attachment.url }]);

        return webhook.send({
            embeds: [embed],
            username: this.container.client.user!.username,
            avatarURL: this.container.client.user!.displayAvatarURL(),
            content: `${(message.channel as Channel).toString()} (Message Delete)`
        });
    }
}
