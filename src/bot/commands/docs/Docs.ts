import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import fetch from 'node-fetch';
import qs from 'querystring';

export default class DocsCommand extends Command {
	public constructor() {
		super('docs', {
			aliases: ['docs'],
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {
				content: 'Searches discord.js and discord-akairo documentation.',
				usage: '<query>',
				examples: [
					'Client',
					'TextChannel',
					'ClientUser#setActivity master',
					'CommandHandler#commandStarted akairo'
				]
			},
			args: [
				{
					id: 'query',
					type: 'lowercase',
					prompt: {
						start: '**What would you like to search?**'
					}
				},
				{
					'id': 'source',
					'type': [
						'stable', 'master',
						'rpc',
						'commando',
						['akairo-master', 'akairo']
					],
					'default': 'stable'
				},
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				}
			]
		});
	}

	public async exec(message: Message, { query, force, source }: { query: string; source: string; force: boolean }) {
		const body = await fetch(
			`https://djsdocs.sorta.moe/v2/embed?${qs.stringify({ src: source, q: query, force })}`
		).then(res => res.json()).catch(() => null);
		if (!body) return message.util!.send('**No matches found!**');

		delete body.color;
		const embed = new MessageEmbed(body);
		if (message.channel.type === 'DM' || !(message.channel as TextChannel)!.permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embeds: [embed] });
		}

		const msg = await message.util!.send({ embeds: [embed] });
		await msg.react('🗑');

		let react;
		try {
			react = await msg.awaitReactions(
				{
					filter: (reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
					max: 1, time: 30000, errors: ['time']
				}
			);
		} catch (error) {
			return msg.reactions.removeAll();
		}

		if (!message.deleted) await message.delete();
		return react.first()?.message.delete(); // 💩
	}
}
