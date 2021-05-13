import { Command, Flag } from 'discord-akairo';

export default class ConfigDisableCommand extends Command {
	public constructor() {
		super('config-disable', {
			category: 'config',
			clientPermissions: ['EMBED_LINKS'],
			typing: true,
			description: {}
		});
	}

	public *args(): unknown {
		const sub = yield {
			type: [
				['config-disable-muted', 'muted'],
				['config-disable-modlog', 'modlog'],
				['config-disable-userlog', 'userlog'],
				['config-disable-webhook', 'webhook'],
				['config-disable-restrict', 'restrict']
			],
			otherwise: 'config_disable_command_failed'
		};

		return Flag.continue(sub);
	}
}
