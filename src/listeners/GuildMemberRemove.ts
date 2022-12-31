import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GuildMember, MessageEmbed } from 'discord.js';
import { Collections, Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'guildMemberRemove' })
export class GuildMemberRemove extends Listener {
    public async run(member: GuildMember) {
        this.performGuildMemberRemove(member);
		this.updateRoleState(member);
    }

	private async performGuildMemberRemove(member: GuildMember) {
		const userLog = this.container.settings.get<string>(member.guild, Settings.USER_LOG);
        if (this.container.client.channels.cache.has(userLog)) {
            const embed = new MessageEmbed()
                .setAuthor({ name: `${member.user.tag} (${member.user.id})`, iconURL: member.user.displayAvatarURL() })
                .setFooter({ text: 'User Left' })
                .setColor('RED')
                .setTimestamp();

            const channel = member.guild.channels.cache.get(userLog);
            if (
                channel &&
                channel.isText() &&
                channel.permissionsFor(this.container.client.user!)?.has(['EMBED_LINKS', 'VIEW_CHANNEL', 'SEND_MESSAGES'])
            ) {
                await channel.send({ embeds: [embed] });
            }
        }
	}

	private async updateRoleState(newMember: GuildMember) {
        const roleState = this.container.settings.get<string>(newMember.guild, Settings.ROLE_STATE);
        if (roleState) {
            if (newMember.roles.cache.size) {
                const roles = newMember.roles.cache
                    .filter((role) => role.id !== newMember.guild.id && !role.managed)
                    .map((role) => role.id);

                const db = this.container.db.collection(Collections.ROLE_STATES);
                if (roles.length) {
                    await db.updateOne({ guild: newMember.guild.id, user: newMember.id }, { $set: { roles } }, { upsert: true });
                } else {
                    await db.deleteOne({ guild: newMember.guild.id, user: newMember.id });
                }
            }
        }
    }
}
