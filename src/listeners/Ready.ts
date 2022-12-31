import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { Settings } from '../lib/constants';

@ApplyOptions<Listener.Options>({ once: true, event: 'ready' })
export class UserEvent extends Listener {
    public async run() {
        for (const guild of this.container.client.guilds.cache.values()) {
            const webhookId = this.container.settings.get<string>(guild, Settings.WEBHOOK_LOG);
            if (!webhookId) continue;
            const webhook = (await guild.fetchWebhooks()).get(webhookId);
            if (!webhook) continue;
            this.container.webhooks.set(webhook.id, webhook);
        }
    }
}
