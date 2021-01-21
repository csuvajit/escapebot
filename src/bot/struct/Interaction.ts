import { APIInteraction, InteractionType, APIApplicationCommandInteractionData } from 'discord-api-types/v8';
import { TextChannel, User, Guild, GuildMember } from 'discord.js';
import Client from './Client';

export default class Interaction {
	public id: string;
	public guild: Guild;
	public author!: User;
	public token: string;
	public channel: TextChannel;
	public member!: GuildMember;
	public type: InteractionType;
	public data?: APIApplicationCommandInteractionData;

	public constructor(client: Client, data: APIInteraction) {
		this.id = data.id;

		this.data = data.data;

		this.type = data.type;

		this.token = data.token;

		this.guild = client.guilds.cache.get(data.guild_id) as Guild;

		this.channel = client.channels.cache.get(data.channel_id) as TextChannel;
	}

	public get isInteraction() {
		return Boolean(this.type === 2);
	}

	public async parse(client: Client, data: APIInteraction) {
		this.author = await client.users.fetch(data.member.user.id);
		this.member = await this.guild.members.fetch(data.member.user.id);
		return Promise.resolve(this);
	}

	public ack() {
		// @ts-expect-error
		return this.client.api.interactions(this.id, this.token).callback.post({ data: { type: 5 } });
	}

	public reply() {
		// @ts-expect-error
		return this.client.api.webhooks(this.client.user.id, this.token)
			.post({
				auth: false,
				data: {
					content: '¯\_(ツ)_/¯',
					embeds: []
				}
			});
	}
}
