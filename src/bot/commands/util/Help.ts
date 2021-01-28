import { Command, PrefixSupplier } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class HelpCommand extends Command {
	public constructor() {
		super('help', {
			aliases: ['help'],
			category: 'util',
			typing: true,
			clientPermissions: ['EMBED_LINKS'],
			args: [
				{
					id: 'command',
					type: 'commandAlias'
				}
			]
		});
	}

	public async exec(message: Message, { command }: { command?: Command }) {
		const prefix = (this.handler.prefix as PrefixSupplier)(message) as string;
		if (!command) {
			const embed = new MessageEmbed()
				.setAuthor('Command List', this.client.user!.displayAvatarURL());
			for (const category of this.handler.categories.values()) {
				embed.addField(
					category.id.replace(/\b(\w)/g, char => char.toUpperCase()),
					category.filter(cmd => cmd.aliases.length > 0).map(cmd => `\`${cmd.aliases[0]}\``).join(', ')
				);
			}

			return message.util!.send({ embed });
		}

		const embed = new MessageEmbed()
			.setTitle(`\`${prefix}${command.aliases[0]} ${command.description.usage as string || ''}\``)
			.addField('Description', command.description.content || 'No description');

		if (command.aliases.length > 1) embed.addField('Aliases', `\`${command.aliases.join('` `')}\``, true);
		if (command.description.examples?.length) {
			embed.addField(
				'Examples',
				`\`${prefix}${command.aliases[0]} ${command.description.examples.join(`\`\n\`${command.aliases[0]} `) as string}\``,
				true
			);
		}

		const paths = command.filepath.split(/\/|\\/);
		const path = paths.slice(paths.indexOf('dist') + 1).join('/').replace(/.js/g, '.ts');
		embed.addField('\u200e', `[View Source](https://github.com/csuvajit/escapebot/blob/main/src/${path})`);

		return message.util!.send({ embed });
	}
}
