import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { COLLECTION, SETTINGS } from '../../util/Constants';

export default class GuildMemberRoleStateListener extends Listener {
	public constructor() {
		super('guildMemberRoleState', {
			event: 'guildMemberUpdate',
			emitter: 'client',
			category: 'client'
		});
	}

	public async exec(oldMember: GuildMember, newMember: GuildMember) {
		const roleState = this.client.settings.get<string>(newMember.guild, SETTINGS.ROLE_STATE, 0);
		if (roleState) {
			await newMember.guild.members.fetch(newMember.id);
			if (newMember.roles.cache.size) {
				const roles = newMember.roles.cache.filter(role => role.id !== newMember.guild.id && !role.managed)
					.map(role => role.id);

				const db = this.client.db.collection(COLLECTION.ROLE_STATES);
				if (roles.length) {
					await db.updateOne({ guild: newMember.guild.id, user: newMember.id }, { $set: { roles } });
				} else {
					await db.deleteOne({ guild: newMember.guild.id, user: newMember.id });
				}
			}
		}
	}
}
