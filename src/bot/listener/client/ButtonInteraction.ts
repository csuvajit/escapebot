import { GuildMember, Interaction, Snowflake } from 'discord.js';
import { Listener } from 'discord-akairo';
import { SETTINGS } from '../../util/Constants';

export default class MessageListener extends Listener {
	public constructor() {
		super('buttonInteraction', {
			emitter: 'client',
			event: 'interaction',
			category: 'client'
		});
	}

	public async exec(interaction: Interaction) {
		if (!interaction.isButton() || !interaction.guildId) return;
		if (!['ROLE_ADD', 'ROLE_REMOVE'].includes(interaction.customId)) return;
		const roleID = this.client.settings.get<Snowflake>(interaction.guild!, SETTINGS.REACTION_ROLE, '807254345526804522');
		if (!interaction.guild!.roles.cache.has(roleID)) return;

		const member = interaction.member as GuildMember;
		if (interaction.customId === 'ROLE_ADD') {
			if (!member.roles.cache.has(roleID)) {
				await member.roles.add(roleID).catch(() => null);
			}

			return interaction.reply({ content: `**You have got <@&${roleID}> role!**`, ephemeral: true });
		}

		if (member.roles.cache.has(roleID)) {
			await member.roles.remove(roleID).catch(() => null);
		}

		return interaction.reply({ content: `**You have got <@&${roleID}> role removed!**`, ephemeral: true });
	}
}
