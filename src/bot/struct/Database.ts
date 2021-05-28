import { COLLECTION } from '../util/Constants';
import { MongoClient, Db } from 'mongodb';

class MongoDB extends MongoClient {
	public constructor() {
		super(process.env.MONGODB_URL!, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
	}

	public async connect() {
		return super.connect();
	}

	public async createIndex(db: Db) {
		return Promise.all([
			db.collection(COLLECTION.TAGS).createIndex({ name: 'text', aliases: 'text' }),
			db.collection(COLLECTION.SETTINGS).createIndex({ guild: 1 }, { unique: true }),
			db.collection(COLLECTION.DIALOGFLOWS).createIndex({ message_id: 1 }, { unique: true }),
			db.collection(COLLECTION.ROLE_STATES).createIndex({ guild: 1, user: 1 }, { unique: true }),
			db.collection(COLLECTION.TAGS).createIndex({ name: 1, aliases: 1 }, { collation: { strength: 2, locale: 'en' } })
		]);
	}
}

const Connection = new MongoDB();

export { Connection };
