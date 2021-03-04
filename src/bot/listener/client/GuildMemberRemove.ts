import { GuildMember, TextChannel } from 'discord.js';
import { SETTINGS } from '../../util/Constants';
import { Listener } from 'discord-akairo';

export default class GuildMemberRemoveListener extends Listener {
	public constructor() {
		super('guildMemberRemove', {
			event: 'guildMemberRemove',
			emitter: 'client',
			category: 'client'
		});
	}

	public async exec(member: GuildMember) {
		const userLog = this.client.settings.get<string>(member.guild, SETTINGS.USER_LOG);
		if (userLog && this.client.channels.cache.has(userLog)) {
			const embed = this.client.util.embed()
				.setAuthor(`${member.user.tag} (${member.user.id})`, member.user.displayAvatarURL())
				.setFooter('User Left')
				.setColor('RED')
				.setTimestamp();

			const channel = member.guild.channels.cache.get(userLog);
			if ((channel as TextChannel).permissionsFor(this.client.user!)?.has(['EMBED_LINKS', 'VIEW_CHANNEL', 'SEND_MESSAGES'])) {
				return (channel as TextChannel).send({ embed });
			}
		}
	}
}
