import { MessageEmbed, Message } from 'discord.js';
import { Command } from 'discord-akairo';
import fetch from 'node-fetch';
import qs from 'querystring';

interface Mdn {
	query: string;
	documents: { slug: string; title: string; excerpt: string }[];
}

export default class MDNCommand extends Command {
	public constructor() {
		super('mdn', {
			aliases: ['mdn'],
			category: 'docs',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			regex: /^(?:mdn,) (.+)/i,
			args: [
				{
					id: 'query',
					prompt: {
						start: 'What would you like to search for?'
					},
					match: 'content',
					type: (msg, query) => query ? query.replace(/#/g, '.prototype.') : null
				}
			]
		});
	}

	public async exec(message: Message, { query, match }: { query: string; match: string }) {
		if (!query && match) query = match[1];

		const param = qs.stringify({ topic: 'js', highlight: false, q: query, per_page: 50 });
		const body: Mdn = await fetch(
			`https://developer.mozilla.org/api/v1/search/en-US?${param}`
		).then(res => res.json()).catch(() => null);

		let data = body.documents.filter(en => en.slug.startsWith('Web/JavaScript'))
			.find(en => this.parseQuery(en.title) === this.parseQuery(body.query));
		if (!data) data = body.documents[0];
		if (!body.documents.length) return message.util!.send('**No matches found!**');

		const embed = new MessageEmbed()
			.setAuthor(
				'MDN',
				'https://developer.mozilla.org/android-chrome-192x192.png',
				'https://developer.mozilla.org/'
			)
			.setTitle(data.title)
			.setURL(`https://developer.mozilla.org/en-US/docs/${data.slug}`)
			.setDescription(data.excerpt);

		return message.util!.send({ embed });
	}

	private parseQuery(query: string) {
		return query.toLowerCase().replace(/.prototype./g, '.');
	}
}
