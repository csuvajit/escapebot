import { join } from 'path';

export const rootDir = join(__dirname, '..', '..');
export const srcDir = join(rootDir, 'src');

export const RandomLoadingMessage = ['Computing...', 'Thinking...', 'Cooking some food', 'Give me a moment', 'Loading...'];

export const Collections = {
	SETTINGS: 'settings',
	TAGS: 'tags',
	CASES: 'cases',
	REMINDERS: 'reminders',
	ROLE_STATES: 'rolestates',
	DIALOGFLOWS: 'dialogflows',
	INTENTS: 'intents'
};

export const Settings = {
	MOD_LOG: 'modLog',
	MUTE_ROLE: 'muteRole',
	WEBHOOK_LOG: 'webhookLog',
	RESTRICT_ROLE: 'restrictRole',
	MODERATION: 'moderation',
	ROLE_STATE: 'roleState',
	USER_LOG: 'userLog',
	REACTION_ROLE: 'reactionRole'
};
