import { Reminder } from '../../struct/RemindScheduler';
import { Command, Flag } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import ms from 'ms';

const REMINDER_LIMIT = 10;

export default class ReminderCommand extends Command {
	public constructor() {
		super('reminder', {
			aliases: ['remind', 'reminder'],
			category: 'util',
			clientPermissions: ['EMBED_LINKS']
		});
	}

	public *args() {
		const method = yield {
			type: [['reminder-add', 'add'], ['reminder-delete', 'delete', 'del', 'cancel'], ['reminder-list', 'list', 'ls']],
			otherwise: (msg: Message) => this.handler.runCommand(msg, this.handler.modules.get('reminder-add')!, '')
		};

		return Flag.continue(method);
	}

	public async exec(message: Message, { duration, reason, dm }: { duration: number; reason: string; dm: boolean }) {
		const Reminders = await this.client.db.collection<Reminder>('reminders').countDocuments({ user: message.author.id });
		if (Reminders > REMINDER_LIMIT) {
			return message.util!.send('You already have too many reminders!');
		}

		await this.client.remindScheduler.create({
			user: message.author.id,
			channel: message.channel.id,
			reason: Util.cleanContent(reason, message),
			reference: message.url,
			triggersAt: new Date(Date.now() + duration),
			dm: message.channel.type === 'dm' || dm,
			createdAt: new Date()
		});

		return message.util!.send(`I'll remind you in ${ms(duration, { 'long': true })}`);
	}
}
