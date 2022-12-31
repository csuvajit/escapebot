import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Channel, Message, MessageEmbed, Util } from 'discord.js';
import * as diff from 'diff';
import { Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'messageUpdate' })
export class MessageUpdate extends Listener {
    public async run(oldMessage: Message, newMessage: Message) {
        if (oldMessage.partial) return null; // eslint-disable-line
        if (newMessage.author.bot) return null;

        if (Util.escapeMarkdown(oldMessage.content) === Util.escapeMarkdown(newMessage.content)) return null;

        const webhookId = this.container.settings.get<string>(newMessage.guild!, Settings.WEBHOOK_LOG);
        if (!webhookId) return null;

        const webhook = this.container.webhooks.get(webhookId);
        if (!webhook) return;

        const embed = new MessageEmbed();
        embed.setAuthor({ name: `${newMessage.author.tag} (${newMessage.author.id})`, iconURL: newMessage.author.displayAvatarURL() });
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
            const diffMessage = diff.diffWords(Util.escapeMarkdown(oldMessage.content), Util.escapeMarkdown(newMessage.content));
            for (const part of diffMessage) {
                const markdown = part.added ? '**' : part.removed ? '~~' : '';
                msg += `${markdown}${part.value}${markdown}`;
            }
            embed.setDescription(`${msg.substring(0, 2000)}` || '\u200b');
        }

        embed.addFields([
            {
                name: 'Message',
                value: `[Jump To](${newMessage.url})`,
                inline: true
            }
        ]);
        embed.setTimestamp(oldMessage.editedAt || newMessage.editedAt || new Date()); // eslint-disable-line

        return webhook.send({
            embeds: [embed],
            username: this.container.client.user!.username,
            avatarURL: this.container.client.user!.displayAvatarURL(),
            content: `${(newMessage.channel as Channel)!.toString()} (Message Update)`
        });
    }
}
