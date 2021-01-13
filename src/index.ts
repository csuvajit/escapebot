import Env from 'dotenv';
Env.config();

import Client from './bot/struct/Client';

const client = new Client();

client.on('error', error => client.logger.error(error, { label: 'ERROR' }));
client.on('warn', error => client.logger.warn(error, { label: 'WARN' }));

client.start(process.env.TOKEN!);
