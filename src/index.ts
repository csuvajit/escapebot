import './lib/setup';
import { container, LogLevel, SapphireClient } from '@sapphire/framework';
import { MongoClient } from 'mongodb';
import Settings from './struct/SettingsProvider';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { execSync } from 'child_process';

if (process.env.SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		serverName: 'escape_bot',
		environment: process.env.NODE_ENV ?? 'development',
		release: execSync('git rev-parse HEAD').toString().trim(),
		integrations: [
			new RewriteFrames({
				iteratee(frame) {
					if (frame.filename) {
						const filename = frame.filename.replace(process.cwd(), '');
						frame.filename = filename.replace(/\\/g, '/');
					}
					return frame;
				}
			}),
			new Sentry.Integrations.Http({ tracing: true, breadcrumbs: true })
		]
	});
}

class Client extends SapphireClient {
    public constructor() {
        super({
            defaultPrefix: '!',
            caseInsensitiveCommands: true,
            logger: {
                level: LogLevel.Debug
            },
            shards: 'auto',
            intents: [
                'GUILDS',
                'GUILD_MEMBERS',
                'GUILD_PRESENCES',
                'GUILD_BANS',
				'MESSAGE_CONTENT',
                'GUILD_MESSAGES'
            ],
            partials: ['CHANNEL', 'MESSAGE'],
            loadMessageCommandListeners: true
        });
    }

    public async init() {
        const db = new MongoClient(process.env.MONGODB_URI!);
        await db.connect();
        container.db = db.db('escape');
        client.logger.info('Connected to MongoDB');

        container.settings = new Settings(container.db);
		await container.settings.init();

        container.webhooks = new Map();

        return this.login(process.env.DISCORD_TOKEN);
    }
}

const client = new Client();

(async () => {
    try {
        client.logger.info('Connecting to Discord');
        await client.init();
        client.logger.info('Connected to Discord');
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
})();
