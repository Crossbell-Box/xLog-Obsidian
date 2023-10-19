import { Notice, TFile } from 'obsidian'
import { type XlogAppPlugin } from './plugin'

let hasInit = false

export class MappingManager {
	private readonly plugin: XlogAppPlugin

	constructor(plugin: XlogAppPlugin) {
		this.plugin = plugin

		if (!hasInit) {
			this.init()
			hasInit = true
		}
	}

	onunload() {}

	private init() {
		this.indexFiles()
		this.registerHooks()
	}

	private indexFiles() {
		// FIXME: I should skip if there is already a mapping in settings
		//        But this may cause some problems when something changes during version upgrade
		//        So I just comment it for now
		// const hasIndexed = Boolean(this.plugin.settingTab.settings.postMapping)
		// if (hasIndexed) return

		const { vault } = this.plugin.app

		const files = vault.getMarkdownFiles()
		for (const file of files) {
			this.handleFile(file)
		}
	}

	private async handleFile(file: TFile) {
		const { metadataCache } = this.plugin.app
		const fileCache = metadataCache.getFileCache(file)
		if (!fileCache) {
			// FIXME: looks like this won't happen?
			return
		}

		const { frontmatter } = fileCache
		if (!frontmatter) return
		console.log(frontmatter)

		const { xlog_slug } = frontmatter
		if (!xlog_slug) return

		const posts = await this.plugin.indexer.getPosts()
		const post = posts.list.find((p) => p.slug === xlog_slug)

		if (!post) return

		this.linkFile({
			file,
			slug: xlog_slug,
			tags: post.tags,
			ctime: new Date(post.createdAt).getTime(),
			mtime: new Date(post.updatedAt).getTime(),
		})
	}

	private registerHooks() {
		const { vault, metadataCache } = this.plugin.app

		metadataCache.on('changed', () => {})
		metadataCache.on('deleted', () => {})
		vault.on('rename', () => {})
	}

	public openFileBySlug(slug: string) {
		const postMapping = this.plugin.settingTab.settings.postMapping
		if (!postMapping) {
			new Notice(
				`Open file for slug '${slug}' failed. No post mapping found. Please try to index files first.`,
			)
			return
		}
		const filepath = postMapping[slug]
		if (!filepath) {
			new Notice(
				`Open file for slug '${slug}' failed. No local file found. There may be something wrong when indexing files. Please try to re-index files.`,
			)
			return
		}
		const file = this.plugin.app.vault.getAbstractFileByPath(filepath)
		if (!(file instanceof TFile)) {
			new Notice(
				`Open file for slug '${slug}' failed. The local file '${filepath}' is not a markdown file.`,
			)
			return
		}
		this.plugin.app.workspace.getLeaf().openFile(file, { active: true })
	}

	private async linkFile({
		file,
		slug,
		tags,
		ctime,
		mtime,
	}: {
		file: TFile
		slug: string
		tags?: string[]
		ctime?: number
		mtime?: number
	}) {
		try {
			// change properties
			await this.plugin.app.fileManager.processFrontMatter(
				file,
				(frontmatter) => {
					frontmatter = { ...frontmatter }
					frontmatter.xlog_slug = slug
					if (tags && !frontmatter.tags) {
						// the local first
						frontmatter.tags = tags
					}
				},
				{
					ctime,
					mtime,
				},
			)

			// save mapping
			this.plugin.settingTab.settings.postMapping ??= {}
			this.plugin.settingTab.settings.postMapping[slug] = file.path
			await this.plugin.settingTab.saveSettings()
		} catch (error) {
			console.error(error)
			new Notice(
				`Link file '${file.path}' to slug '${slug}' failed. Please check the console for more details.`,
			)
		}
	}

	private unlinkFile({ file, slug }: { file: TFile; slug: string }) {
		try {
			// change properties
			this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
				if (frontmatter?.xlog_slug) {
					delete frontmatter.xlog_slug
				}
			})

			// save mapping
			this.plugin.settingTab.settings.postMapping ??= {}
			delete this.plugin.settingTab.settings.postMapping[slug]
			this.plugin.settingTab.saveSettings()
		} catch (error) {
			console.error(error)
			new Notice(
				`Unlink file '${file.path}' from slug '${slug}' failed. Please check the console for more details.`,
			)
		}
	}
}
