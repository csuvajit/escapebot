import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import { Collections, Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ event: 'guildMemberUpdate' })
export class GuildMemberUpdate extends Listener {
    public async run(oldMember: GuildMember, newMember: GuildMember) {
        this.updateRoleState(newMember);
        if (oldMember.pending && !newMember.pending) {
            this.performRoleState(newMember);
        }
    }

    private async updateRoleState(newMember: GuildMember) {
        const roleState = this.container.settings.get<string>(newMember.guild, Settings.ROLE_STATE);
        if (roleState) {
            await newMember.guild.members.fetch(newMember.id);
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
