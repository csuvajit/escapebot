import { Message, Webhook } from 'discord.js';
import { Listener } from 'discord-akairo';
// eslint-disable-next-line
const credentials = require('../../../../credentials.json');
import { SessionsClient } from '@google-cloud/dialogflow';
import * as uuid from 'uuid';

export default class MessageListener extends Listener {
	private webhook!: Webhook | null;

	public constructor() {
		super('message', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		});
	}

	private async getWebhook() {
		if (this.webhook) return this.webhook;
		this.webhook = await this.client.fetchWebhook('846776379973435454').catch(() => null);
		return this.webhook;
	}

	public async exec(message: Message) {
		if (message.channel.id !== '736861685704425503') return;
		if (message.author.bot) return;
		if (!message.content) return;

		const webhook = await this.getWebhook();
		if (!webhook) return;

		const sessionId = uuid.v4();
		const sessionClient = new SessionsClient({ credentials });
		const sessionPath = sessionClient.projectAgentSessionPath(credentials.project_id, sessionId);
		const request = {
			session: sessionPath,
			queryInput: {
				text: {
					text: message.content,
					languageCode: 'en-US'
				}
			}
		};

		const responses = await sessionClient.detectIntent(request);
		const result = responses[0].queryResult;
		if (!result?.intent) return;

		this.client.logger.debug(
			{
				intent: result.intent.displayName,
				confidence: result.intentDetectionConfidence,
				query: result.queryText, response: result.fulfillmentText
			},
			{ label: 'AI' }
		);

		if (!(result.intentDetectionConfidence! >= 0.8)) return;
		// @ts-expect-error
		return this.client.api.channels[message.channel.id].messages.post(
			{
				data: {
					content: [
						result.fulfillmentText,
						'',
						'Was it helpful?'
					].join('\n'),
					components: [
						{
							type: 1,
							components: [
								{ type: 2, style: 1, label: 'Yes', custom_id: 'ACCEPT_INTENT' },
								{ type: 2, style: 4, label: 'No', custom_id: 'REJECT_INTENT' }
							]
						}
					]
				}
			}
		);
	}
}
