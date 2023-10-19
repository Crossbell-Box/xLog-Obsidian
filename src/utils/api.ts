import { createIndexer } from 'crossbell/indexer'
import { Notice } from 'obsidian'
import { type XlogAppPlugin } from '../plugin'
import { type PluginSettings } from '../setting'

export class Indexer {
	private readonly plugin: XlogAppPlugin
	private readonly settings: PluginSettings

	private readonly indexer = createIndexer({ experimentalRequestDedupe: true })

	constructor(plugin: XlogAppPlugin) {
		this.plugin = plugin
		this.settings = this.plugin.settingTab.settings
	}

	public async getSiteInfo() {
		this.init()

		const characterId = this.settings.characterId!
		const res = await this.indexer.character.get(characterId)
		if (!res) {
			new Notice(`No character found for ID ${characterId}.`)
			throw new Error(`No character found for ID ${characterId}.`)
		}

		const siteInfo = {
			handle: res.handle,
			characterId: res.characterId,
			name: res.metadata?.content?.name ?? res.handle,
			avatar:
				res.metadata?.content?.avatars?.[0] ??
				`https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${res.handle}`, // default avatar
			bio: res.metadata?.content?.bio,
			banner: res.metadata?.content?.banners?.[0],
			siteName:
				(res.metadata?.content?.attributes?.find(
					(a) => a.trait_type === 'xlog_site_name',
				)?.value as string) || res.metadata?.content?.name,
			domain:
				(res.metadata?.content?.attributes?.find(
					(a) => a.trait_type === 'xlog_custom_domain',
				)?.value as string) || `${res.handle}.xlog.app`,
		}

		return siteInfo
	}

	public async getPosts({ cursor }: { cursor?: string } = {}) {
		this.init()

		const characterId = this.settings.characterId!
		const notes = await this.indexer.note.getMany({
			characterId: characterId,
			tags: ['post'],
			limit: 500,
			cursor,
			orderBy: 'publishedAt',
			sources: 'xlog',
		})

		const list = notes.list.map((note) => {
			return {
				...note,

				slug: note.metadata?.content?.attributes?.find(
					(a) => a.trait_type === 'xlog_slug',
				)?.value as string,
				cover: note.metadata?.content?.attachments?.find(
					(a) => a.name === 'cover',
				)?.address,
				tags: note.metadata?.content?.tags,
			}
		})

		return {
			list,
			cursor: notes.cursor,
			count: notes.count,
		}
	}

	// entry
	private init() {
		// check login status
		const characterId = this.settings.characterId
		if (!characterId) {
			this.showLoginNotice()
			throw new Error('not logged-in yet')
		}

		// init token
		if (this.settings.accountType === 'email') {
			this.indexer.newbie.token = this.settings.token
		} else if (this.settings.accountType === 'op') {
			this.indexer.siwe.token = this.settings.token
		}
	}

	private getMutator() {
		this.init()

		if (this.settings.accountType === 'email') {
			return this.indexer.newbie
		} else if (this.settings.accountType === 'op') {
			return this.indexer.siwe
		}
	}

	private showLoginNotice() {
		new Notice('Please login to xLog first.')
	}
}
