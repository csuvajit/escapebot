import { Command, Flag } from 'discord-akairo';
import { Message, Util } from 'discord.js';

export default class ServerInfoCommand extends Command {
	public constructor() {
		super('add', {
			aliases: ['add'],
			category: 'info',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			flags: ['--pin']
		});
	}

	public *args() {
		const name = yield {
			type: async (msg: Message, name: string) => {
				if (!name) return null;
				const tag = await this.client.tags.find(name, msg.guild!.id);
				if (tag) return Flag.fail(name);
				return name.toLowerCase();
			},
			prompt: {
				start: 'What should be the name of tag?',
				retry: (msg: Message, { failure }: { failure: { value: string } }) => `Tag with the name **${failure.value}** already exists. Try another name?`
			}
		};

		const content = yield {
			match: 'rest',
			type: 'string',
			prompt: {
				start: 'What should be the content of tag?'
			}
		};

		const hoisted = yield {
			type: (msg: Message) => msg.member!.permissions.has('MANAGE_GUILD'),
			match: 'flag',
			flag: ['--pin']
		};

		return { name, content, hoisted };
	}

	public async exec(message: Message, { name, content, hoisted }: { name: string; content: string; hoisted: boolean }) {
		await this.client.tags.create({
			name,
			guild: message.guild!.id,
			hoisted,
			aliases: [name],
			user: message.author.id,
			uses: 0,
			content: Util.cleanContent(content, message),
			createdAt: new Date(),
			updatedAt: new Date(),
			lastModified: message.author.id
		});

		return message.util!.send('Tag saved!');
	}
}

