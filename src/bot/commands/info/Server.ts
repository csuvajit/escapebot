import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import moment from 'moment';

const HUMAN_LEVELS: { [key: string]: string } = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: '(╯°□°）╯︵ ┻━┻',
	VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

export default class ServerInfoCommand extends Command {
	public constructor() {
		super('server', {
			aliases: ['server'],
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public async exec(message: Message) {
		await message.guild!.members.fetch().catch(() => null);
		const embed = this.client.util.embed()
			.setThumbnail(message.guild!.iconURL({ dynamic: true })!)
			.setAuthor(message.guild!.name)
			.setDescription(['**ID**', message.guild!.id].join('\n'))
			.addField('Members', `${message.guild!.memberCount}`)
			.addField('Bots', `${message.guild!.members.cache.filter(m => m.user.bot).size}`)
			.addField('Roles', `${message.guild!.roles.cache.size}`)
			.addField('Text Channels', `${message.guild!.channels.cache.filter(ch => ch.type === 'text').size}`)
			.addField('Voice Channels', `${message.guild!.channels.cache.filter(ch => ch.type === 'voice').size}`)
			.addField('AFK', message.guild!.afkChannelID ? `<#${message.guild!.afkChannelID}> after ${message.guild!.afkTimeout / 60} min` : 'None')
			// .addField('Region', message.guild!.region.toUpperCase())
			.addField('Created', moment.utc(message.guild!.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Owner', `${(await message.guild!.fetchOwner()).user.tag} (${message.guild!.ownerID})`)
			.addField('Verification Level', HUMAN_LEVELS[message.guild!.verificationLevel]);

		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild!.me!).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embeds: [embed] });
		}

		const msg = await message.util!.send({ embeds: [embed] });
		await msg.react('🗑');

		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 30000, errors: ['time'] }
			);
		} catch (error) {
			return msg.reactions.removeAll();
		}

		if (!message.deleted) await message.delete();
		return react.first()?.message.delete(); // 💩
	}
}

