import moment from 'moment';
import chalk from 'chalk';
import util from 'util';

const COLORS: { [key: string]: 'red' | 'cyan' | 'yellow' | 'magenta' } = {
	debug: 'yellow',
	info: 'cyan',
	warn: 'magenta',
	error: 'red'
};

const TAGS: { [key: string]: string } = {
	debug: '[DEBUG]',
	info: '[INFO ]',
	warn: '[WARN ]',
	error: '[ERROR]'
};

export default class Logger {
	public debug(message: string | any, { label }: { label?: string }) {
		return (this.constructor as typeof Logger).write(message, { label, tag: 'debug' });
	}

	public info(message: string | any, { label }: { label?: string }) {
		return (this.constructor as typeof Logger).write(message, { label, tag: 'info' });
	}

	public error(message: string | any, { label }: { label?: string }) {
		return (this.constructor as typeof Logger).write(message, { error: true, label, tag: 'error' });
	}

	public warn(message: string | any, { label }: { label?: string }) {
		return (this.constructor as typeof Logger).write(message, { label, tag: 'warn' });
	}

	private static write(message: string | any, { error, label, tag }: { error?: boolean; label?: string; tag: string }) {
		const timestamp = chalk.cyan(moment().utcOffset('+05:30').format('DD-MM-YYYY kk:mm:ss'));
		const content = this.clean(message);
		const stream = error ? process.stderr : process.stdout;
		return stream.write(`[${timestamp}] [SHARD 0] ${chalk[COLORS[tag]].bold(TAGS[tag])} » ${label ? `[${label}] » ` : ''}${content}\n`);
	}

	private static clean(message: string | any) {
		if (typeof message === 'string') return message;
		return util.inspect(message, { depth: Infinity });
	}
}
