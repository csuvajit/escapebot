import { __rootdir__ } from '../root';
import env from 'dotenv';
env.config();

import { RewriteFrames } from '@sentry/integrations';
import { version } from '../package.json';
import Client from './bot/struct/Client';
import * as Sentry from '@sentry/node';
const client = new Client();

if (process.env.SENTRY) {
	Sentry.init({
		release: version,
		dsn: process.env.SENTRY,
		serverName: 'escape_bot',
		environment: process.env.NODE_ENV ?? 'development',
		integrations: [
			new RewriteFrames({ root: __rootdir__, prefix: '/' }),
			new Sentry.Integrations.Http({ tracing: true, breadcrumbs: false })
		]
	});
}

client.on('error', error => client.logger.error(error, { label: 'ERROR' }));
client.on('warn', error => client.logger.warn(error, { label: 'WARN' }));

client.start(process.env.TOKEN!);
