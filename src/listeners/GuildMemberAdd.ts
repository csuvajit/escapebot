import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { GuildMember, MessageEmbed } from 'discord.js';
import { Collections, Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'guildMemberAdd' })
export class GuildMemberAdd extends Listener {
    public async run(member: GuildMember) {
        this.performRoleState(member);
        this.performGuildMemberAdd(member);
    }

    private async performGuildMemberAdd(member: GuildMember) {
        const userLog = this.container.settings.get<string>(member.guild, Settings.USER_LOG);
        if (this.container.client.channels.cache.has(userLog)) {
            const embed = new MessageEmbed()
                .setAuthor({ name: `${member.user.tag} (${member.user.id})`, iconURL: member.user.displayAvatarURL() })
                .setFooter({ text: 'User Joined' })
                .setColor('GREEN')
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

    private async performRoleState(member: GuildMember) {
        const roleState = this.container.settings.get<string>(member.guild, Settings.ROLE_STATE);
        if (roleState) {
            const roleStore = await this.container.db
                .collection(Collections.ROLE_STATES)
                .findOne({ guild: member.guild.id, user: member.id });
            if (roleStore?.roles.length) await member.roles.add(roleStore.roles, 'Automatic RoleState');
        }
    }
}
