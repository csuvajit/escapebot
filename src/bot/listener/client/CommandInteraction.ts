import { Interaction } from 'discord.js';
import { Listener, Command, Flag } from 'discord-akairo';

export class InteractionParser {
	public flagWords: string[];
	public optionFlagWords: string[];

	public constructor({
		flagWords = [],
		optionFlagWords = []
	} = {}) {
		this.flagWords = flagWords;
		this.optionFlagWords = optionFlagWords;
	}

	private parseOptions(options: any[], all: any[] = [], phrases: any[] = [], flags: any[] = [], optionFlags: any[] = []): any[] {
		options = Array.from(options.values());
		if (!options.length) return [all, phrases, flags, optionFlags];

		const top = options.shift();
		if (!top) return [all, phrases, flags, optionFlags];

		if (!top.value) {
			phrases.push({ type: 'Phrase', value: top.name, raw: `${top.name as string} ` });
			all.push({ type: 'Phrase', value: top.name, raw: `${top.name as string} ` });
		}

		if (typeof top.value === 'boolean') {
			if (top.value) {
				if (this.flagWords.includes(`--${top.name as string}`)) {
					all.push({ type: 'Flag', key: `--${top.name as string}`, raw: `--${top.name as string} ` });
					flags.push({ type: 'Flag', key: `--${top.name as string}`, raw: `--${top.name as string} ` });
				} else {
					phrases.push({ type: 'Phrase', value: `${top.name as string}`, raw: `--${top.name as string} ` });
					all.push({ type: 'Phrase', value: `${top.name as string}`, raw: `--${top.name as string} ` });
				}
			}
		} else if (top.value) {
			if (this.optionFlagWords.includes(`--${top.name as string}`)) {
				optionFlags.push({ type: 'OptionFlag', value: `${top.value as string}`, key: `--${top.name as string}`, raw: `--${top.name as string} "${top.value as string}" ` });
				all.push({ type: 'OptionFlag', value: `${top.value as string}`, key: `--${top.name as string}`, raw: `--${top.name as string} "${top.value as string}" ` });
			} else {
				// name
				const phraseName = { type: 'Phrase', value: `${top.name as string}`, raw: `--${top.name as string} ` };
				// value
				const phraseValue = { type: 'Phrase', value: `${top.value as string}`, raw: `"${top.value as string}" ` };

				phrases.push(...[phraseName, phraseValue]);
				all.push(...[phraseName, phraseValue]);
			}
		}

		if (top.options?.size) {
			[all, phrases, flags, optionFlags] = this.parseOptions(top.options, all, phrases, flags, optionFlags);
		}

		return this.parseOptions(options, all, phrases, flags, optionFlags);
	}

	public parse(args: any[]) {
		const [all, phrases, flags, optionFlags] = this.parseOptions(args);
		return { all, phrases, flags, optionFlags };
	}
}


export default class MessageListener extends Listener {
	public constructor() {
		super('commandInteraction', {
			emitter: 'client',
			event: 'interaction',
			category: 'client'
		});
	}

	public async exec(interaction: Interaction) {
		if (!interaction.isCommand()) return;

		const command = this.client.commandHandler.findCommand(interaction.commandName);
		if (!command) return; // eslint-disable-line

		return this.handleInteraction(interaction, command, interaction.options);
	}

	// TODO: CommandInteractionOption to Array
	private contentParser(command: Command, content: any) {
		if (Array.isArray(content)) {
			// @ts-expect-error
			const contentParser = new InteractionParser({ flagWords: command.contentParser.flagWords, optionFlagWords: command.contentParser.optionFlagWords });
			return contentParser.parse(content);
		}
		// @ts-expect-error
		return command.contentParser.parse(content);
	}

	private async handleInteraction(interaction: Interaction, command: Command, content: any, ignore = false): Promise<unknown> {
		if (!ignore) {
			// @ts-expect-error
			if (await this.client.commandHandler.runPostTypeInhibitors(interaction, command)) return;
		}
		const parsed = this.contentParser(command, content);
		// @ts-expect-error
		const args = await command.argumentRunner.run(interaction, parsed, command.argumentGenerator);
		if (Flag.is(args, 'cancel')) {
			return this.client.commandHandler.emit('commandCancelled', interaction, command);
		} else if (Flag.is(args, 'continue')) {
			const continueCommand = this.client.commandHandler.modules.get(args.command)!;
			return this.handleInteraction(interaction, continueCommand, args.rest, args.ignore);
		}

		// @ts-expect-error
		return this.client.commandHandler.runCommand(interaction, command, args);
	}
}
