import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import type { Message, TextChannel } from 'discord.js';

@ApplyOptions<Command.Options>({})
export class UserCommand extends Command {
    public async messageRun(message: Message, args: Args) {
		const amount = await args.pick('number', { minimum: 1, maximum: 100 });
		const user = await args.pick('user', { optional: true }).catch(() => null);
		const messages = await message.channel.messages.fetch({ limit: 100 });
		await (message.channel as TextChannel).bulkDelete(messages.filter(msg => user ? msg.author.id === user.id : true).toJSON().slice(0, amount), true);
    }
}
