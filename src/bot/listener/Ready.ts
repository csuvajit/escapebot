import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			event: 'ready',
			category: 'client',
			emitter: 'client'
		});
	}

	public exec() {
		console.log(`Ready ${this.client.user!.tag}`);
	}
}