import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { Command } from 'discord-akairo';
import fetch from 'node-fetch';
import 'moment-duration-format';
import moment from 'moment';

export default class NPMCommand extends Command {
	public constructor() {
		super('npm', {
			aliases: ['npm', 'npm-package'],
			category: 'docs',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {
				content: 'Responds with information on an NPM package.',
				usage: '<query>',
				examples: ['discord.js', 'discord-akairo', 'node-fetch']
			},
			args: [
				{
					id: 'pkg',
					prompt: {
						start: 'What would you like to search for?'
					},
					match: 'content',
					type: (msg, pkg) => pkg ? encodeURIComponent(pkg.toLocaleLowerCase().replace(/ +/g, '-')) : null
				}
			]
		});
	}

	public async exec(message: Message, { pkg }: { pkg: string }) {
		const res = await fetch(`https://registry.npmjs.com/${pkg}`);
		if (res.status === 404) {
			return message.util!.send('**No matches found!**');
		}

		const body = await res.json();
		if (!body.time || body.time.unpublished) {
			return message.util!.send('**Commander of this package decided to unpublish it!**');
		}

		const version = body.versions[body['dist-tags'].latest];
		const maintainers = body.maintainers.slice(0, 10).map((user: any) => user.name).join(', ');
		const dependencies = version.dependencies ? Object.keys(version.dependencies).slice(0, 10) : [];
		const embed = new MessageEmbed()
			.setAuthor('NPM', 'https://i.imgur.com/ErKf5Y0.png', 'https://www.npmjs.com/')
			.setTitle(body.name)
			.setURL(`https://www.npmjs.com/package/${pkg}`)
			.setDescription(body.description || 'No description.')
			.addField('Version', body['dist-tags'].latest, true)
			.addField('License', body.license || 'None', true)
			.addField('Author', body.author ? body.author.name : '???', true);
		if (body.homepage) embed.addField('Source', `[Home Page](${body.homepage as string})`, true);
		embed.addField('Creation Date', moment.utc(body.time.created).format('D MMMM YYYY kk:mm'), true)
			.addField('Modification Date', moment.utc(body.time.modified).format('D MMMM YYYY kk:mm'), true)
			.addField('Main File', version.main || 'index.js', true)
			.addField('Dependencies', dependencies.length ? dependencies.join(', ') : 'None', true)
			.addField('Maintainers', maintainers, true);

		if (message.channel.type === 'dm' || !(message.channel as TextChannel)!.permissionsFor(message.guild!.me!)!.has(['ADD_REACTIONS', 'MANAGE_MESSAGES'], false)) {
			return message.util!.send({ embeds: [embed] });
		}

		const msg = await message.util!.send({ embeds: [embed] });
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
