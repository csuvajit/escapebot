/* eslint-disable no-mixed-operators */
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

interface Args {
	color: {
		type: 'hex' | 'rgb' | 'hsl';
		colors: Record<string, string | number>;
	};
}

export default class ColorCommand extends Command {
	public constructor() {
		super('color', {
			aliases: ['color'],
			args: [
				{
					id: 'color',
					match: 'content',
					type: (_, phrase) => {
						phrase = phrase.toLowerCase();
						if (phrase.includes('hsl')) return this.parseHSL(phrase);
						if (phrase.includes('rgb')) return this.parseRGB(phrase);
						return this.parseHex(phrase);
					},
					prompt: {
						start: 'Please enter a color.',
						retry: 'Invalid color. Please enter a valid color.'
					}
				}
			],
			category: 'util',
			clientPermissions: ['EMBED_LINKS'],
			description: {
				content: 'Get information and conversions of a color code.',
				usage: '<color - hex, rgb, or hsl>',
				examples: ['#FFFFFF', 'rgb(255, 255, 255)', 'hsl(0, 0%, 100%)', 'hsl(0, 0, 1)']
			}
		});
	}

	public exec(message: Message, { color: { colors, type } }: Args) {
		// Converter functions.
		const rgbToHex = ({ r, g, b }: Record<string, number>) => ({
			r: r.toString(16),
			g: g.toString(16),
			b: b.toString(16)
		});
		const hexToRGB = ({ r, g, b }: Record<string, string>) => ({
			r: parseInt(r, 16),
			g: parseInt(g, 16),
			b: parseInt(b, 16)
		});
		const hslToRGB = ({ h, s, l }: Record<string, number>) => {
			const c = (1 - Math.abs(2 * l - 1)) * s; // Chroma
			const h1 = h / 60; // H'
			const x = c * (1 - Math.abs((h1 % 2) - 1)); // Temporary value.

			// Find colors with same hue and chroma on the RGB cube.
			let rgb1 = [] as Array<number>;
			if ((h1 >= 0 && h1 < 1) || h1 === 6) rgb1 = [c, x, 0];
			else if (h1 >= 1 && h1 < 2) rgb1 = [x, c, 0];
			else if (h1 >= 2 && h1 < 3) rgb1 = [0, c, x];
			else if (h1 >= 3 && h1 < 4) rgb1 = [0, x, c];
			else if (h1 >= 4 && h1 < 5) rgb1 = [x, 0, c];
			else if (h1 >= 5 && h1 < 6) rgb1 = [c, 0, x];

			const m = l - c / 2; // Matching factor.
			const [r, g, b] = rgb1.map(a => Math.round((a + m) * 255));
			console.log([h, s, l], [r, g, b]);
			return { r, g, b };
		};
		const rgbToHSL = ({ r, g, b }: Record<string, number>) => {
			const [r1, g1, b1] = [r, g, b].map(x => x / 255);
			const v = Math.max(r1, g1, b1); // Value.
			const min = Math.min(r1, g1, b1);
			const c = v - min; // Chroma.
			const l = v - c / 2; // Lightness.

			// Get the hue based on rotation along the RGB cube.
			let h = undefined;
			if (c === 0) h = 0;
			else if (v === r1) h = Math.round(60 * (0 + (g1 - b1) / c));
			else if (v === g1) h = Math.round(60 * (2 + (b1 - r1) / c));
			else h = Math.round(60 * (4 + (r1 - g1) / c)); // v === b1

			// Get saturation.
			let s = undefined;
			if (l === 0 || l === 1) s = 0;
			else s = (v - l) / Math.min(l, 1 - l);

			const fix = (n: number) => parseFloat(n.toFixed(2));
			return { h: h < 0 ? 360 + h : h, s: fix(s), l: fix(l) };
		};

		let [hex, rgb, hsl] = [undefined, undefined, undefined] as Array<string | undefined>;
		if (type === 'hsl') {
			const { r, g, b } = hslToRGB(colors as Record<string, number>);
			const { r: r1, g: g1, b: b1 } = rgbToHex({ r, g, b });
			hsl = `hsl(${colors.h}, ${colors.s}, ${colors.l})`;
			rgb = `rgb(${r}, ${g}, ${b})`;
			hex = `#${r1}${g1}${b1}`;
		}
		if (type === 'hex') {
			const { r, g, b } = hexToRGB(colors as Record<string, string>);
			const { h, s, l } = rgbToHSL({ r, g, b });

			hex = `#${colors.r}${colors.g}${colors.b}`;
			rgb = `rgb(${r}, ${g}, ${b})`;
			hsl = `hsl(${h}, ${s}, ${l})`;
		}
		if (type === 'rgb') {
			const { h, s, l } = rgbToHSL(colors as Record<string, number>);
			const { r, g, b } = rgbToHex(colors as Record<string, number>);

			rgb = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
			hex = `#${r}${g}${b}`;
			hsl = `hsl(${h}, ${s}, ${l})`;
		}

		/* eslint-disable @typescript-eslint/restrict-template-expressions */
		return message.channel.send({
			embeds: [
				{
					color: hex ? parseInt(hex.slice(1), 16) : undefined,
					fields: [
						{ name: 'Hex Code', value: `\`${hex}\`` },
						{ name: 'RGB Code', value: `\`${rgb}\`` },
						{ name: 'HSL Code', value: `\`${hsl}\`` }
					]
				}
			]
		});
	}

	private parseHSL(phrase: string) {
		if (/^hsl\([0-9]{1,3}(\s*,\s*([0-9]{1,3}%|[0-1]\.?[0-9]*)){2}\)$/.test(phrase)) {
			const getSL = (p: string) => (p.includes('%') ? parseInt(p, 10) / 100 : parseFloat(p));
			const [h1, s1, l1] = phrase.slice(4, -1).split(/\s*,\s*/g);
			const h = parseInt(h1, 10);
			const s = getSL(s1);
			const l = getSL(l1);
			if (h > 360 || s > 1 || l > 1) return undefined;
			return {
				type: 'hsl',
				colors: { h, s, l }
			};
		}
		return undefined;
	}

	private parseRGB(phrase: string) {
		if (/^rgb\((\s*\d{1,3}\s*)(,\s*\d{1,3}\s*){2}\)$/.test(phrase)) {
			const [r, g, b] = phrase
				.slice(4, -1)
				.split(/\s*,\s*/g)
				.map(c => parseInt(c, 10));
			if (r > 255 || g > 255 || b > 255) return undefined;
			return {
				type: 'rgb',
				colors: { r, g, b }
			};
		}
		return undefined;
	}

	private parseHex(phrase: string) {
		if (/^#?(([0-9a-f]{3}){1,2}|[0-9a-f]{1})$/.test(phrase)) {
			if (phrase.startsWith('#')) phrase = phrase.slice(1);
			const len = phrase.length;
			let [r, g, b] = [undefined, undefined, undefined] as Array<string | undefined>;
			if (len === 1) {
				const c = `${phrase}${phrase}`;
				[r, g, b] = [c, c, c];
			} else if (len === 3) {
				[r, g, b] = phrase.split('').map(c => `${c}${c}`);
			} else {
				r = `${phrase[0]}${phrase[1]}`;
				g = `${phrase[2]}${phrase[3]}`;
				b = `${phrase[4]}${phrase[5]}`;
			}
			return {
				type: 'hex',
				colors: { r, g, b }
			};
		}
		return undefined;
	}
}
