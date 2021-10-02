import { Command } from 'discord-akairo';
import { Message, MessageReaction, User } from 'discord.js';

interface EmbedArgs {
	dealer: Array<string>;
	player: Array<string>;
	show: boolean;
}

export default class BlackJackCommand extends Command {
	public constructor() {
		super('blackjack', {
			aliases: ['blackjack', 'bj'],
			category: 'games',
			clientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
			description: {
				content: 'Play a game of Blackjack!',
				usage: '<>',
				examples: []
			}
		});
	}

	public async exec(message: Message) {
		const dealer = [this.pullCard(), this.pullCard()];
		const player = [this.pullCard(), this.pullCard()];
		const w = this.calcWinner(dealer, player, false);
		let show = w === 'p' || w === 'd';
		const m = await message.channel.send({ ...this.getEmbed(message, { dealer, player, show }) });
		const emojis = ['✅', '🛑'];
		await m.react(emojis[0]);
		await m.react(emojis[1]);
		while (!show) {
			const winner = this.calcWinner(dealer, player, show);
			if (winner) return m.reactions.removeAll();

			let selection: 'hit' | 'stand' | undefined = undefined;
			try {
				await m.awaitReactions(
					(r: MessageReaction, u: User) => {
						r.users.remove(u);
						if (u.id !== message.author.id) return false;
						if (!emojis.includes(r.emoji.name as string)) return false;

						if (r.emoji.name === emojis[0]) selection = 'hit';
						else selection = 'stand';
						return true;
					},
					{ errors: ['time'], time: 3e4, max: 1 }
				);
			} catch {}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (!selection) {
				m.reactions.removeAll();
				return message.reply('Game ended due to lack of input!');
			}

			if (selection === 'hit') player.push(this.pullCard());
			else show = true;

			await m.edit({ ...this.getEmbed(message, { dealer, player, show }) });
			if (this.calcWinner(dealer, player, show)) return m.reactions.removeAll();
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		while (true) {
			const pw = this.calcWeight(player);
			const dw = this.calcWeight(dealer);
			if (pw < 21 && (dw < 17 || pw > 17)) dealer.push(this.pullCard());
			await m.edit({ ...this.getEmbed(message, { dealer, player, show }) });
			if (this.calcWinner(dealer, player, show)) return m.reactions.removeAll();
		}
	}

	private getEmbed(message: Message, { dealer, player, show }: EmbedArgs) {
		const playerWeight = this.calcWeight(player);
		const dealerWeight = this.calcWeight(dealer);
		const winner = this.calcWinner(dealer, player, show);
		const playerComment = `${playerWeight > 21 ? '**Busted!**' : ''} ${winner === 'p' ? '**Won!**' : ''}`;
		const dealerComment = `${dealerWeight > 21 ? '**Busted!**' : ''} ${winner === 'd' ? '**Won!**' : ''}`;
		const winOrBust = playerWeight > 21 || dealerWeight > 21 || winner === 'p' || winner === 'd';
		if (winOrBust) show = true;

		const getColor = () => {
			if (dealerComment.includes('Won')) return '#FF0000';
			if (playerComment.includes('Won')) return '#00FF00';
			return '#00000';
		};

		return {
			embeds: [
				{
					author: {
						name: message.author.tag,
						icon_url: message.author.displayAvatarURL({ dynamic: true })
					},
					color: getColor(),
					fields: [
						{
							name: `Player => ${playerWeight} ${playerComment}`,
							value: `${player.join(' | ')}`
						},
						{
							name: `Dealer => ${
								show ? dealerWeight : `${this.calcWeight(dealer.filter((_, i) => i !== 1))} + ?`
							} ${dealerComment}`,
							value: `${dealer.map((c, i) => (!show && i === 1 ? '❓' : c)).join(' | ')}`
						}
					]
				}
			]
		};
	}

	private calcWinner(dealer: Array<string>, player: Array<string>, show: boolean) {
		const dealerWeight = this.calcWeight(dealer);
		const playerWeight = this.calcWeight(player);
		if (player.length === 5 && playerWeight <= 21) return 'p';
		if (dealerWeight === 21 || playerWeight > 21) return 'd';
		if (playerWeight === 21 || dealerWeight > 21) return 'p';
		if (show && dealerWeight > playerWeight) return 'd';
		return undefined;
	}

	private calcWeight(deck: Array<string>) {
		const cards = deck.slice(0).map(card => card.slice(1));
		let value = 0;
		let aces = 0;
		for (const card of cards) {
			if (!card) continue;
			if (card === 'A') aces++;
			else if (card === '2') value += 2;
			else if (card === '3') value += 3;
			else if (card === '4') value += 4;
			else if (card === '5') value += 5;
			else if (card === '6') value += 6;
			else if (card === '7') value += 7;
			else if (card === '8') value += 8;
			else if (card === '9') value += 9;
			else value += 10;
		}
		for (let i = 0; i < aces; i++) {
			if (value <= 21 - 11) value += 11;
			else value += 1;
		}
		return value;
	}

	private pullCard() {
		const getRandom = (arr: Array<string>) => arr[Math.floor(Math.random() * (arr.length - 1))];
		const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
		const colors = ['❤️', '♦️', '♠️', '♣️'];
		return `${getRandom(colors)}${getRandom(cards)}`;
	}
}
