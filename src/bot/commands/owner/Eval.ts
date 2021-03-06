import { Command, Flag, Argument } from 'discord-akairo';
import { Util, Message } from 'discord.js';
import util from 'util';

export default class EvalCommand extends Command {
	private readonly _replaceToken!: string;

	public constructor() {
		super('eval', {
			aliases: ['eval', 'e'],
			category: 'owner',
			ownerOnly: true,
			description: {},
			optionFlags: ['--depth', '-d']
		});
	}

	public *args(): unknown {
		const depth = yield {
			'match': 'option',
			'type': Argument.range('integer', 0, 3, true),
			'flag': ['--depth', '-d'],
			'default': 0
		};

		const code = yield {
			match: 'rest',
			type: (msg: Message, code: string) => {
				if (!code) return Flag.cancel();
				return code;
			}
		};

		return { code, depth };
	}

	public async exec(message: Message, { code, depth }: { code: string; depth: number }) {
		let hrDiff;
		let evaled;
		try {
			const hrStart = process.hrtime();
			evaled = await eval(code); // eslint-disable-line
			hrDiff = process.hrtime(hrStart);
		} catch (error) {
			return message.util!.send(`*Error while evaluating!* \n\`\`\`js\n${error as string}\n\`\`\``);
		}

		const result = this.result(evaled, hrDiff, depth);
		if (Array.isArray(result)) {
			return result.map(async (res, index) => {
				if (index === 0) return message.util!.send(res);
				return message.channel.send(res);
			});
		}
		return message.util!.send(result);
	}

	private result(result: string, hrDiff: number[], depth: number) {
		const inspected = util.inspect(result, { depth })
			.replace(new RegExp('!!NL!!', 'g'), '\n')
			.replace(this.replaceToken, '--🙄--');

		const split = inspected.split('\n');
		const last = inspected.length - 1;
		const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
		const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ? split[split.length - 1] : inspected[last];
		const prepend = `\`\`\`js\n${prependPart}\n`;
		const append = `\n${appendPart}\n\`\`\``;

		return Util.splitMessage(
			`*Executed in ${this.totalTime(hrDiff).toFixed(2)}ms* \`\`\`js\n${inspected}\`\`\``,
			{ maxLength: 1900, prepend, append }
		);
	}

	private get replaceToken() {
		if (!this._replaceToken) {
			const token = this.client.token!.split('').join('[^]{0,2}');
			const revToken = this.client.token!.split('').reverse().join('[^]{0,2}');
			Object.defineProperty(this, '_replaceToken', { value: new RegExp(`${token}|${revToken}`, 'g') });
		}
		return this._replaceToken;
	}

	private totalTime(hrDiff: number[]) {
		return (hrDiff[0] * 1000) + (hrDiff[1] / 1000000);
	}
}
