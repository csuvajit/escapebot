import { Message } from 'discord.js';
import { Listener } from 'discord-akairo';
// @ts-ignore
import credentials from '../../../../credentials.json';
import { SessionsClient } from '@google-cloud/dialogflow';
import * as uuid from 'uuid';

export default class MessageListener extends Listener {
	public constructor() {
		super('message', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		});
	}

	public async exec(message: Message) {
		if (!['736861685704425503', '847905466322780230'].includes(message.channel.id)) return;
		if (message.author.bot) return;
		if (!message.content) return;

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

		this.client.dialogflow.responses.set(message.id, {
			query: result.queryText!,
			intent: result.intent.displayName!,
			confidence: result.intentDetectionConfidence!
		});

		// @ts-expect-error
		return this.client.api.channels[message.channel.id].messages.post(
			{
				data: {
					content: [
						result.fulfillmentText,
						'',
						'\u200eWas it helpful?\u200e'
					].join('\n'),
					components: [
						{
							type: 1,
							components: [
								{ type: 2, style: 1, label: 'Yes', custom_id: 'ACCEPT_INTENT' },
								{ type: 2, style: 4, label: 'No', custom_id: 'REJECT_INTENT' }
							]
						}
					],
					message_reference: {
						message_id: message.id,
						guild_id: message.guild!.id,
						fail_if_not_exists: false
					},
					allowed_mentions: {
						replied_user: false
					}
				}
			}
		);
	}
}
