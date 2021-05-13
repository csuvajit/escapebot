import { Argument, Command, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			channel: 'guild',
			quoted: false,
			typing: true,
			description: {
				content: 'Displays or changes the prefix.',
				usage: '<prefix>',
				examples: ['!', '?']
			},
			args: [
				{
					id: 'prefix',
					type: Argument.validate('string', (message, prefix) => !/\s/.test(prefix) && prefix.length <= 3)
				}
			]
		});
	}

	// @ts-expect-error
	public regex() {
		return new RegExp(`^<@!?(${this.client.user!.id})>$`, 'i');
	}

	public exec(message: Message, { prefix, match }: { prefix?: string; match: string }) {
		if (/^<@!?(\d+)>$/.test(message.content) && !message.mentions.has(this.client.user!.id)) return;

		const oldPrefix = (this.handler.prefix as PrefixSupplier)(message) as string;
		if (!prefix) {
			if (match) return message.reply(`My prefix is \`${oldPrefix}\``);
			return message.channel.send(`My prefix is \`${oldPrefix}\``);
		}

		if (prefix && !message.member!.permissions.has('MANAGE_GUILD')) {
			return message.util!.send([
				`The current prefix for this server is \`${(this.handler.prefix as PrefixSupplier)(message) as string}\``,
				'You are missing `Manage Server` to change the prefix.'
			]);
		}

		this.client.settings.set(message.guild!, 'prefix', prefix);
		return message.util!.send(`Prefix has been set to \`${prefix}\``);
	}
}
