import { Command } from 'discord-akairo';
import { utc } from 'moment';
import { MessageEmbed, GuildEmoji, Message } from 'discord.js';
import { find, Emoji } from 'node-emoji';

const EMOJI_REGEX = /<(?:a)?:(?:\w{2,32}):(\d{17,19})>?/;

export default class EmojiCommand extends Command {
	public constructor() {
		super('emoji', {
			aliases: ['emoji', 'emoji-info'],
			category: 'util',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Get information about an emoji.',
				usage: '<emoji>',
				examples: ['🤔', 'thinking_face', '264701195573133315']
			},
			args: [
				{
					id: 'emoji',
					match: 'content',
					type: (message, name) => {
						const matched = EMOJI_REGEX.exec(name)?.[1];
						if (matched) return message.guild!.emojis.cache.get(matched);
						const emoji = find(name);
						if (emoji) return emoji; // eslint-disable-line
						return message.guild!.emojis.cache.find(e => e.name!.toLowerCase() === name);
					},
					prompt: {
						start: 'What emoji would you like information about?',
						retry: 'Please provide a valid emoji!'
					}
				}
			]
		});
	}

	public async exec(message: Message, { emoji }: { emoji: GuildEmoji | Emoji }) {
		const embed = new MessageEmbed();

		if (emoji instanceof GuildEmoji) {
			const user = await emoji.fetchAuthor().catch(() => null);
			embed.setThumbnail(emoji.url)
				.addField('Emoji', emoji.toString())
				.addField('Name', `${emoji.name!}`)
				.addField('ID', emoji.id)
				.addField('Raw', `\`<${emoji.animated ? '' : ':'}${emoji.identifier}>\``)
				.addField('Creator', user!.tag)
				.addField('Creation Date', utc(emoji.createdAt).format('MMMM D, YYYY, kk:mm:ss'))
				.addField('Emoji URL', emoji.url);
		} else {
			embed.addField('Emoji', emoji.emoji)
				.addField('Name', emoji.key)
				.addField('Raw', `\\${emoji.emoji}`);
		}

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
