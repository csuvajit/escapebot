import { Structures } from 'discord.js';

class ButtonInteraction extends Structures.get('ButtonInteraction') {
	public author = { id: this.user.id, tag: this.user.tag };

	public get util() {
		return this;
	}

	public send(data: any) {
		return super.reply(data);
	}
}

class CommandInteraction extends Structures.get('CommandInteraction') {
	public author = { id: this.user.id, tag: this.user.tag };

	public get util() {
		return this;
	}

	public send(data: any) {
		return super.reply(data);
	}
}

Structures.extend('ButtonInteraction', () => ButtonInteraction);
Structures.extend('CommandInteraction', () => CommandInteraction);
