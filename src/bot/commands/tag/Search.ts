import { Message, MessageEmbed } from 'discord.js';
import { Command } from 'discord-akairo';

export default class TagSearchCommand extends Command {
	public constructor() {
		super('tag-search', {
			category: 'tag',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			optionFlags: ['--name']
		});
	}

	public *args(msg: Message) {
		const name = yield {
			'type': 'string',
			'match': msg.hasOwnProperty('token') ? 'option' : 'content',
			'flag': ['--name'],
			'default': ''
		};

		return { name };
	}

	public async exec(message: Message, { name }: { name: string }) {
		const allTags = await this.client.tags.collection.find(
			{ guild: message.guild!.id, $text: { $search: name } }
		).toArray();

		const embed = new MessageEmbed()
			.setAuthor(message.guild!.name, message.guild!.iconURL()!)
			.setDescription([
				'**Search Result**',
				allTags.map(tag => `\`${tag.name}\``).join(', ')
			]);

		return message.util!.send({ embed });
	}
}

