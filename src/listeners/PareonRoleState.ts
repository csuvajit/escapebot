import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

const PATRON_ROLE_ID = '609779531296800778';
const EARLY_SUPPORTER_ROLE_ID = '741629644322898091';

@ApplyOptions<Listener.Options>({ event: 'guildMemberUpdate' })
export class PatronRoleState extends Listener {
    public async run(oldMember: GuildMember, newMember: GuildMember) {
        if (!oldMember.roles.cache.has(PATRON_ROLE_ID) && newMember.roles.cache.has(PATRON_ROLE_ID)) {
            if (!newMember.roles.cache.has(EARLY_SUPPORTER_ROLE_ID)) {
                await newMember.roles.add(EARLY_SUPPORTER_ROLE_ID, 'Patron RoleState');
            }
        }
    }
}
