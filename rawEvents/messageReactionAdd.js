const { RawEvent, constants: { CONNECT_FOUR } } = require('../index');
const EMOJI_WHITELIST = new Set(['⭐', ...CONNECT_FOUR.REACTIONS]);
const CONNECT_FOUR_WHITELIST = new Set(CONNECT_FOUR.REACTIONS);

module.exports = class extends RawEvent {

	constructor(...args) {
		super(...args, { name: 'MESSAGE_REACTION_ADD' });
	}

	async run({ message, reaction, user }) { // eslint-disable-line
		// Unfinished
	}

	// 	{ user_id: 'id',
	// 	  message_id: 'id',
	// 	  emoji: { name: '😄', id: null, animated: false },
	// 	  channel_id: 'id' }

	async process(data) {
		if (!EMOJI_WHITELIST.has(data.emoji.name)) return false;
		// Verify channel
		const channel = this.client.channels.get(data.channel_id);
		if (!channel || channel.type !== 'text' || !channel.readable) return false;

		// The ConnectFour does not need more data than this
		if (CONNECT_FOUR_WHITELIST.has(data.emoji.name)) {
			this._handleConnectFour(channel, data.emoji.name, data.user_id);
			return false;
		}

		// Verify user
		const user = await this.client.users.fetch(data.user_id);

		// Verify message
		const message = await channel.messages.fetch(data.message_id);
		if (!message || !data.emoji) return false;

		// Verify reaction
		const reaction = message.reactions.add({
			emoji: data.emoji,
			count: 0,
			me: user.id === this.client.user.id
		});
		reaction._add(user);

		return { message, reaction, user };
	}

	_handleConnectFour(channel, emoji, userID) {
		const game = this.client.connectFour.matches.get(channel.id);
		if (game) game.send(emoji, userID);
	}

};