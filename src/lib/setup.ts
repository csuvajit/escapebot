process.env.NODE_ENV ??= 'development';

import 'reflect-metadata';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';

import type { Db } from 'mongodb';
import { createColors } from 'colorette';
import { config } from 'dotenv-cra';
import { join } from 'path';
import { inspect } from 'util';
import { rootDir } from './constants';
import type Settings from '../struct/SettingsProvider';
import type { Webhook } from 'discord.js';

config({ path: join(rootDir, '.env') });

inspect.defaultOptions.depth = 1;

createColors({ useColor: true });

declare module '@sapphire/pieces' {
    interface Container {
        db: Db;
        settings: Settings;
		webhooks: Map<string, Webhook>;
    }
}
