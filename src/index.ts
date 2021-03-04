import Env from 'dotenv';
Env.config();

import Client from './bot/struct/Client';
import * as Sentry from '@sentry/node';
const client = new Client();

if (process.env.SENTRY) {
	Sentry.init({
		dsn: process.env.SENTRY,
		environment: process.env.NODE_ENV
	});
}

client.on('error', error => client.logger.error(error, { label: 'ERROR' }));
client.on('warn', error => client.logger.warn(error, { label: 'WARN' }));

client.start(process.env.TOKEN!);
