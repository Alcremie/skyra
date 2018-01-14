const { Extendable, util: { regExpEsc } } = require('klasa');
const { PromptList } = require('../index');
const USER_REGEXP = new RegExp('^(?:<@!?)?(\\d{17,21})>?$');

function resolveUser(query, guild) {
	if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
	if (/^\w{1,32}#\d{4}$/.test(query)) {
		const res = guild.members.find(member => member.user.tag === query);
		return res ? res.user : null;
	}
	return null;
}

module.exports = class extends Extendable {

	constructor(...args) {
		super(...args, ['ArgResolver'], { name: 'username', klasa: true });
	}

	async extend(arg, currentUsage, possible, repeat, msg) {
		if (!msg.guild) return this.user(arg, currentUsage, possible, repeat, msg);
		const resUser = await resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const member of msg.guild.members.values()) {
			if (reg.test(member.user.username)) results.push(member.user);
		}

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(user => regWord.test(user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0:
				if (currentUsage.type === 'optional' && !repeat) return null;
				throw `${currentUsage.possibles[possible].name} Must be a valid name, id or user mention`;
			case 1: return querySearch[0];
			default: return PromptList.run(msg, querySearch.slice(0, 10).map(user => user.username))
				.then(number => querySearch[number]);
		}
	}

};
