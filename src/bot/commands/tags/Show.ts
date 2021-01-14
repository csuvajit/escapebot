import { Command, Flag } from 'discord-akairo';
import { Tag } from '../../struct/TagHandler';
import { Util, Message } from 'discord.js';

export default class TagShowCommand extends Command {
	public constructor() {
		super('tag-show', {
			category: 'docs',
			channel: 'guild',
			description: {
				content: 'Shows a tag.',
				usage: '<name>'
			},
			args: [
				{
					id: 'tag',
					match: 'content',
					type: async (msg, name) => {
						name = Util.cleanContent(name.toLowerCase(), msg);
						const tag = await this.client.tags.find(name, msg.guild!.id);
						if (!tag) return Flag.cancel();
						return tag;
					},
					prompt: {
						start: 'What tag would you like to see?'
					}
				}
			]
		});
	}

	public async exec(message: Message, { tag }: { tag: Tag | null }) {
		if (!tag) return;
		await this.client.tags.uses(tag._id!);
		return message.util!.send(`${tag.content}`);
	}
}
