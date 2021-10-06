import { Command, Argument } from 'discord-akairo';
import { Message, User } from 'discord.js';
import moment from 'moment';

export default class UserInfoCommand extends Command {
	public constructor() {
		super('user', {
			aliases: ['user'],
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					'id': 'user',
					'type': Argument.union('user', (_, id: string) => id ? this.client.users.fetch(id).catch(() => null) : null),
					'default': (message: Message) => message.author
				}
			]
		});
	}

	public async exec(message: Message, { user }: { user: User }) {
		const member = message.guild!.members.cache.get(user.id);
		const embed = this.client.util.embed()
			.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setDescription(['**ID**', `${user.id}`].join('\n'));
		if (member) {
			embed.addField('Nickname', member.nickname ?? 'None')
				.addField('Joined', moment.utc(member.joinedAt).format('MMMM D, YYYY, kk:mm:ss'));

			const roles = member.roles.cache.filter(role => role.id !== message.guild!.id);
			if (roles.size) {
				embed.addField(
					'Roles',
					roles.map(role => role.toString()).join(' ')
				);
			}
		}
		embed.addField('Created', moment.utc(user.createdAt).format('MMMM D, YYYY, kk:mm:ss'));

		// @ts-expect-error
		const activities = user.presence.activities.filter(val => val.type !== 'CUSTOM_STATUS');
		if (activities.length) embed.addField('Presence', activities.join(', '));

		// @ts-expect-error
		const customStatus = user.presence.activities.find(val => val.type === 'CUSTOM_STATUS');
		if (customStatus) embed.addField('Custom Status', `${(customStatus.emoji?.toString() ?? '') as string} ${(customStatus.state ?? '') as string}\u200b`);

		if (message.channel.type === 'DM' || !message.channel.permissionsFor(message.guild!.me!).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embeds: [embed] });
		}

		const msg = await message.util!.send({ embeds: [embed] });
		await msg.react('🗑');

		let react;
		try {
			react = await msg.awaitReactions(
				{ max: 1, time: 30000, errors: ['time'], filter: (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id }
			);
		} catch (error) {
			return msg.reactions.removeAll();
		}

		if (!message.deleted) await message.delete();
		return react.first()?.message.delete(); // 💩
	}
}
