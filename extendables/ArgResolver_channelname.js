const { Extendable, util: { regExpEsc } } = require('klasa');
const { PromptList } = require('../index');
const CHANNEL_REGEXP = new RegExp('^(?:<#)?(\\d{17,21})>?$');

function resolveChannel(query, guild) {
	if (CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)[1]);
	return null;
}

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['ArgResolver'], { name: 'channelname', klasa: true });
	}

	async extend(arg, currentUsage, possible, repeat, msg) {
		if (!msg.guild) return this.channel(arg, currentUsage, possible, repeat, msg);
		const resChannel = resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const channel of msg.guild.channels.values()) {
			if (reg.test(channel.name)) results.push(channel);
		}

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(channel => regWord.test(channel.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0:
				if (currentUsage.type === 'optional' && !repeat) return null;
				throw `${currentUsage.possibles[possible].name} Must be a valid name, id or channel mention`;
			case 1: return querySearch[0];
			default: return PromptList.run(msg, querySearch.slice(0, 10).map(channel => channel.name))
				.then(number => querySearch[number]);
		}
	}

};
