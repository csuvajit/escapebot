import { Inhibitor } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';

export default class PermissionInhibitor extends Inhibitor {
	public constructor() {
		super('premission', {
			reason: 'permission'
		});
	}

	public exec(message: Message) {
		if (!message.guild) return false;
		return !(message.channel as TextChannel).permissionsFor(message.guild.me!)?.has('SEND_MESSAGES');
	}
}