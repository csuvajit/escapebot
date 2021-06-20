declare module 'discord.js' {
	interface CommandInteraction {
		author: {
			id: Snowflake;
			tag: string;
		};
	}
}
