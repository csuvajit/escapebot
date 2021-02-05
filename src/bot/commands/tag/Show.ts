import { Command, Flag } from 'discord-akairo';
import { Tag } from '../../struct/TagsProvider';
import { Util, Message } from 'discord.js';

export default class TagShowCommand extends Command {
	public constructor() {
		super('tag-show', {
			category: 'tag',
			channel: 'guild',
			description: {},
			optionFlags: ['--name']
		});
	}

	public *args(msg: Message) {
		const tag = yield {
			match: msg.hasOwnProperty('token') ? 'option' : 'content',
			type: async (msg: Message, name: string) => {
				name = Util.cleanContent(name.toLowerCase(), msg);
				const tag = await this.client.tags.find(name, msg.guild!.id);
				if (!tag) return Flag.cancel();
				return tag;
			},
			flag: ['--name']
		};

		return { tag };
	}

	public async exec(message: Message, { tag }: { tag?: Tag }) {
		if (!tag) return;
		await this.client.tags.uses(tag._id!);
		return message.util!.send({ content: tag.content });
	}
}
