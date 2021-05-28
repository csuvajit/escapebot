import { COLLECTION } from '../util/Constants';
import { Collection } from 'mongodb';
import Client from './Client';

export default class Dialogflow {
	private readonly collection: Collection;
	public responses: Map<string, { query: string; intent: string; confidence: number }>;

	public constructor(private readonly client: Client) {
		this.responses = new Map();
		this.collection = client.db.collection(COLLECTION.DIALOGFLOWS);
	}

	public async create(res: any, accepted: boolean, admin: boolean) {
		const response = this.responses.get(res.message.message_reference.message_id);
		if (!response) {
			return this.collection.updateOne(
				{ message_id: res.message.id }, {
					$set: {
						approped: accepted && admin
					},
					$inc: {
						accepted: accepted ? 1 : 0,
						rejected: accepted ? 0 : 1
					}
				}
			);
		}

		return this.collection.updateOne(
			{ message_id: res.message.id }, {
				$set: {
					query: response.query,
					intent: response.intent,
					approped: accepted && admin,
					confidence: response.confidence
				},
				$inc: {
					accepted: accepted ? 1 : 0,
					rejected: accepted ? 0 : 1
				}
			}, { upsert: true }
		);
	}
}
