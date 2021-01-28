import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class TagDeleteCommand extends Command {
	public constructor() {
		super('tag-delete', {
			category: 'tag',
			channel: 'guild',
			description: {},
			optionFlags: ['--name']
		});
	}

	public *args(msg: Message) {
		const slash = this.isInteraction(msg);

		const name = yield {
			match: slash ? 'option' : 'content',
			type: 'lowercase',
			flag: '--name'
		};

		return { name };
	}

	public async exec(message: Message, { name }: { name?: string }) {
		if (!name) return this.reply(message, { content: '**You must provide a tag name idiot!**' });
		const del = await this.client.tags.collection.deleteOne({ guild: message.guild!.id, name });
		if (!del.deletedCount) return this.reply(message, { content: '**No matches found!**' });
		return this.reply(message, { content: '**Successfully deleted the tag from this guild.**' });
	}
}
