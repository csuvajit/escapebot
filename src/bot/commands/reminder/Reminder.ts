import { Command, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReminderCommand extends Command {
	public constructor() {
		super('reminder', {
			aliases: ['remind', 'reminder'],
			category: 'util',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public *args(): unknown {
		const method = yield {
			type: [['reminder-add', 'add'], ['reminder-delete', 'delete', 'del', 'cancel'], ['reminder-list', 'list', 'ls']],
			otherwise: (msg: Message) => this.handler.handleDirectCommand(
				msg, msg.util!.parsed!.content!, this.handler.modules.get('reminder-add')!, false
			)
		};

		return Flag.continue(method);
	}
}
