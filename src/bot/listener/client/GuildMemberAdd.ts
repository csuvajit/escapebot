import { GuildMember, TextChannel, Snowflake } from 'discord.js';
import { COLLECTION, SETTINGS } from '../../util/Constants';
import { Listener } from 'discord-akairo';

export default class GuildMemberAddListener extends Listener {
	public constructor() {
		super('guildMemberAdd', {
			event: 'guildMemberAdd',
			emitter: 'client',
			category: 'client'
		});
	}

	public async exec(member: GuildMember) {
		const roleState = this.client.settings.get<string>(member.guild, SETTINGS.ROLE_STATE);
		if (roleState) {
			const roleStore = await this.client.db.collection(COLLECTION.ROLE_STATES)
				.findOne({ guild: member.guild.id, user: member.id });
			try {
				if (roleStore?.roles.length) await member.roles.add(roleStore.roles, 'Automatic RoleState');
			} catch { }
		}

		const userLog = this.client.settings.get<Snowflake>(member.guild, SETTINGS.USER_LOG);
		if (this.client.channels.cache.has(userLog)) {
			const embed = this.client.util.embed()
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
				.setFooter('User Joined')
				.setColor('GREEN')
				.setTimestamp();

			const channel = member.guild.channels.cache.get(userLog);
			if ((channel as TextChannel).permissionsFor(this.client.user!)?.has(['EMBED_LINKS', 'VIEW_CHANNEL', 'SEND_MESSAGES'])) {
				return (channel as TextChannel).send({ embed });
			}
		}
	}
}
