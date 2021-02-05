import { Message, MessageEmbed, User } from 'discord.js';
import { Command } from 'discord-akairo';

export default class TagListCommand extends Command {
	public constructor() {
		super('tag-list', {
			aliases: ['tags'],
			category: 'tag',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			optionFlags: ['--user']
		});
	}

	public *args(msg: Message) {
		const user = yield {
			'type': 'user',
			'match': msg.hasOwnProperty('token') ? 'option' : 'phrase',
			'flag': ['--user'],
			'default': (message: Message) => message.author
		};

		return { user };
	}

	public async exec(message: Message, { user }: { user?: User }) {
		const allTags = await this.client.tags.collection.find({ guild: message.guild!.id }).toArray();

		const embed = new MessageEmbed()
			.setAuthor(message.guild!.name, message.guild!.iconURL()!)
			.setDescription([
				'**Pinned Tags**',
				allTags.filter(tag => tag.hoisted)
					.map(tag => `\`${tag.name}\``)
					.sort()
					.join(', ')
			]);

		const userTags = allTags.filter(tag => !tag.hoisted && tag.user === user?.id);
		if (userTags.length && user) {
			embed.addField(
				'\u200b',
				[
					`**${user.username}\'s Tags**`,
					userTags.map(tag => `\`${tag.name}\``)
						.sort()
						.join(', ')
				]
			);
		}

		return message.util!.send({ embed });
	}
}
