import { Listener } from 'discord-akairo';
import { SETTINGS } from '../../util/Constants';

export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			event: 'ready',
			category: 'client',
			emitter: 'client'
		});
	}

	public async exec() {
		this.client.logger.info(`Ready ${this.client.user!.tag}`, { label: 'READY' });

		for (const guild of this.client.guilds.cache.values()) {
			const id = this.client.settings.get<string>(guild, SETTINGS.WEBHOOK_LOG, undefined);
			if (!id) continue;
			const webhook = (await guild.fetchWebhooks()).get(id);
			if (!webhook) continue;
			this.client.webhooks.set(webhook.id, webhook);
		}
	}
}
