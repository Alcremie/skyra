import { MusicHandler } from '@lib/structures/music/MusicHandler';
import { MusicCommand, MusicCommandOptions } from '@lib/structures/MusicCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { requireSongPresent } from '@utils/Music/Decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<MusicCommandOptions>({
	description: (language) => language.get(LanguageKeys.Commands.Music.SkipDescription),
	usage: '[force]'
})
export default class extends MusicCommand {
	@requireSongPresent()
	public async run(message: KlasaMessage, [force = false]: [boolean]) {
		const { music } = message.guild!;

		if (music.listeners.length >= 4) {
			if (force) {
				if (!(await message.hasAtLeastPermissionLevel(PermissionLevels.Moderator))) {
					throw message.language.get(LanguageKeys.Commands.Music.SkipPermissions);
				}
			} else {
				const response = this.handleSkips(music, message.author.id);
				if (response) return message.sendMessage(response);
			}
		}

		await music.skip(this.getContext(message));
	}

	public handleSkips(musicManager: MusicHandler, user: string): string | false {
		const song = musicManager.song || musicManager.queue[0];
		if (song.skips.has(user)) return musicManager.guild.language.get(LanguageKeys.Commands.Music.SkipVotesVoted);
		song.skips.add(user);
		const members = musicManager.listeners.length;
		return this.shouldInhibit(musicManager, members, song.skips.size);
	}

	public shouldInhibit(musicManager: MusicHandler, total: number, size: number): false | string {
		if (total <= 3) return false;

		const needed = Math.ceil(total * 0.4);
		return size >= needed ? false : musicManager.guild.language.get(LanguageKeys.Commands.Music.SkipVotesTotal, { amount: size, needed });
	}
}
