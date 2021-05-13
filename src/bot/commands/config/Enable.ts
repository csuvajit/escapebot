import { Command, Flag } from 'discord-akairo';

export default class ConfigEnableCommand extends Command {
	public constructor() {
		super('config-enable', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {}
		});
	}

	public *args(): unknown {
		const sub = yield {
			type: [
				['config-enable-muted', 'muted'],
				['config-enable-modlog', 'modlog'],
				['config-enable-userlog', 'userlog'],
				['config-enable-webhook', 'webhook'],
				['config-enable-restrict', 'restrict']
			],
			otherwise: 'config_enable_command_failed'
		};

		return Flag.continue(sub);
	}
}
