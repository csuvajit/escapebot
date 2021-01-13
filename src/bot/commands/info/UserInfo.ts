import { Command, Argument } from 'discord-akairo';
import { Message, User } from 'discord.js';
import moment from 'moment';

interface Devices {
	[key: string]: string;
}

const DEVICES: Devices = { desktop: '🖥️', mobile: '📱', web: '🌐' };

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
			.setDescription(['**ID**', `${user.id}`]);
		if (member) {
			embed.addField('Nickname', member.nickname ?? 'None')
				.addField('Joined', moment.utc(member.joinedAt).format('MMMM D, YYYY, kk:mm:ss'));
		}
		embed.addField('Created', moment.utc(user.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
			.addField('Status', user.presence.status.toUpperCase());

		const devices = Object.keys(user.presence.clientStatus ?? {})
			.map(key => (DEVICES[key]));

		if (devices.length) embed.addField('Device', `${devices.join(' ')}\u200b`);

		const activities = user.presence.activities.filter(val => val.type !== 'CUSTOM_STATUS');
		if (activities.length) embed.addField('Presence', activities.join(', '));

		const customStatus = user.presence.activities.find(val => val.type === 'CUSTOM_STATUS');
		if (customStatus) embed.addField('Custom Status', `${customStatus.emoji?.toString() ?? ''} ${customStatus.state ?? ''}\u200b`);

		return message.util!.send({ embed });
	}
}
