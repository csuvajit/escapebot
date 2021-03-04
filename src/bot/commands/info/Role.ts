import { Command } from 'discord-akairo';
import moment from 'moment';
import { Message, Role, PermissionString } from 'discord.js';

const PERMISSIONS: { [key: string]: string } = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View Audit Log',
	MANAGE_GUILD: 'Manage Server',
	MANAGE_ROLES: 'Manage Roles',
	MANAGE_CHANNELS: 'Manage Channels',
	KICK_MEMBERS: 'Kick Members',
	BAN_MEMBERS: 'Ban Members',
	CREATE_INSTANT_INVITE: 'Create Instant Invite',
	CHANGE_NICKNAME: 'Change Nickname',
	MANAGE_NICKNAMES: 'Manage Nicknames',
	MANAGE_EMOJIS: 'Manage Emojis',
	MANAGE_WEBHOOKS: 'Manage Webhooks',
	VIEW_CHANNEL: 'Read Text & See Voice Channels',
	SEND_MESSAGES: 'Send Messages',
	SEND_TTS_MESSAGES: 'Send TTS Messages',
	MANAGE_MESSAGES: 'Manage Messages',
	EMBED_LINKS: 'Embed Links',
	ATTACH_FILES: 'Attach Files',
	READ_MESSAGE_HISTORY: 'Read Message History',
	MENTION_EVERYONE: 'Mention Everyone',
	USE_EXTERNAL_EMOJIS: 'Use External Emojis',
	ADD_REACTIONS: 'Add Reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute Members',
	DEAFEN_MEMBERS: 'Deafen Members',
	MOVE_MEMBERS: 'Move Members',
	USE_VAD: 'Use Voice Activity',
	STREAM: 'Stream'
};

export default class RoleInfoCommad extends Command {
	public constructor() {
		super('roleinfo', {
			aliases: ['role', 'role-info'],
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild',
			description: {
				content: 'Get info about a role.',
				usage: '<role>',
				examples: ['', 'Admin', '444432489818357760']
			},
			args: [
				{
					'id': 'role',
					'type': 'role',
					'match': 'content',
					'default': (message: Message) => message.member!.roles.highest
				}
			]
		});
	}

	public async exec(message: Message, { role }: { role: Role }) {
		const permissions = Object.keys(PERMISSIONS).filter(permission => role.permissions.serialize()[permission as PermissionString]);
		const permission = permissions.map(permission => `\`${PERMISSIONS[permission]}\``).join(', ');

		const embed = this.client.util.embed()
			.setAuthor(`${role.name}`)
			.addField('ID', `${role.id}`)
			.addField('Color', `\`${role.hexColor.toUpperCase()}\`, \`${role.color}\``)
			.addField('Hoisted', `${role.hoist ? 'Yes' : 'No'}`)
			.addField('Mentionable', `${role.mentionable ? 'Yes' : 'No'}`)
			.addField('Creation Date', `${moment.utc(role.createdAt).format('MMMM D, YYYY, kk:mm:ss')}`)
			.addField('Permissions', `${permission || 'None'}`)
			.setThumbnail(message.guild!.iconURL()!);

		if (message.channel.type === 'dm' || !message.channel.permissionsFor(message.guild!.me!).has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embed });
		}

		const msg = await message.util!.send({ embed });
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
