import {
	ButtonComponent,
	ColorComponent,
	Component,
	Editor,
	ItemView,
	Notice,
	WorkspaceLeaf,
	parseFrontMatterEntry,
	setIcon,
} from 'obsidian'
import { XlogAppPlugin } from '../plugin'
import { PluginSettings } from '../setting'
import { Indexer } from '../utils/api'
import { ipfsUrlToHttpUrl } from '../utils/ipfs'
import { getLogoIconName, getLogoSvgText } from '../utils/logo'

export const ObsidianXlogViewType = 'obsidian-xlog-view'

export class ViewPanel extends ItemView {
	private readonly plugin: XlogAppPlugin
	private readonly settings: PluginSettings

	constructor(leaf: WorkspaceLeaf, plugin: XlogAppPlugin) {
		super(leaf)
		this.plugin = plugin
		this.settings = plugin.settingTab.settings
	}

	public getViewType(): string {
		return ObsidianXlogViewType
	}

	public getDisplayText(): string {
		return 'xLog'
	}

	public getIcon(): string {
		return 'xlog-logo'
	}

	private drawingTimer: NodeJS.Timeout | undefined
	public async onOpen() {
		// draw site and posts view
		this.drawLoading()
		// fetch data
		const [site, posts] = await Promise.all([
			this.plugin.indexer.getSiteInfo(),
			this.plugin.indexer.getPosts(),
		])
		// draw data
		this.draw({ site, posts })
		// keep refreshing
		// this.drawingTimer = setInterval(async () => {
		// 	const [site, posts] = await Promise.all([
		// 		this.indexer.getSiteInfo(),
		// 		this.indexer.getPosts(),
		// 	])
		// 	this.draw({ site, posts })
		// }, 30 * 1000)
	}

	public async onClose() {
		this.drawingTimer && clearInterval(this.drawingTimer)
	}

	private drawLoading() {
		const contentEl = this.contentEl
		contentEl.empty()
		contentEl
			.createDiv({
				cls: 'view__loading',
			})
			.createDiv({
				cls: 'view__loading-logo-wrapper',
			})
			.createDiv({
				cls: 'view__loading-logo',
			})
			.appendChild(SvgElement(getLogoSvgText()))
	}

	private draw({
		site,
		posts,
	}: {
		site: Awaited<ReturnType<Indexer['getSiteInfo']>>
		posts: Awaited<ReturnType<Indexer['getPosts']>>
	}) {
		const contentEl = this.contentEl
		contentEl.empty()

		// draw site info
		const siteInfoEl = contentEl.createDiv({
			cls: 'view__site-info',
		})
		// avatar
		siteInfoEl
			.createDiv({
				cls: 'view__site-info-img-container',
			})
			.createEl('img', {
				attr: {
					src: ipfsUrlToHttpUrl(site.avatar),
					width: '100',
					height: '100',
				},
			})
		// text info
		const textInfoEl = siteInfoEl.createDiv()
		textInfoEl.createEl('h1', {
			cls: 'view__site-info-name',
			text: site.name,
		})
		textInfoEl.createEl('small', {
			cls: 'view__site-info-bio',
			text: site.bio,
		})
		textInfoEl.createDiv().createEl('a', {
			attr: {
				href: `https://${site.domain}`,
			},
			text: site.domain,
		})

		// draw posts
		const postsEl = contentEl.createDiv({
			cls: 'view__posts',
		})
		posts.list.forEach((post) => {
			const postEl = postsEl.createDiv({
				cls: 'view__post',
			})
			// title
			postEl.createEl('h2', {
				cls: 'view__post-title',
				text: post.metadata?.content?.title ?? 'Untitled',
			})
			// content
			postEl.createDiv({
				cls: 'view__post-content',
				text: (post.metadata?.content?.content ?? '').trim().slice(0, 500),
			})
			// footer
			const footerEl = postEl.createDiv({
				cls: 'view__post-footer',
			})
			footerEl.createEl('small', {
				cls: 'view__post-footer-date',
				text: new Date(post.publishedAt).toLocaleString(),
			})
			// actions
			const actionsEl = postEl.createDiv({
				cls: 'view__post-actions',
			})
			new ButtonComponent(actionsEl)
				.setClass('view__post-action')
				.setIcon('pencil')
				.setTooltip('Edit in Obsidian')
				.onClick(() => {
					window.open(`https://${site.domain}/${post.slug}`, '_blank')
				})
			new ButtonComponent(actionsEl)
				.setClass('view__post-action')
				.setIcon('arrow-down-up')
				.setTooltip('Sync')
				.onClick(() => {
					window.open(`https://${site.domain}/${post.slug}`, '_blank')
				})
			new ButtonComponent(actionsEl)
				.setClass('view__post-action')
				.setIcon(getLogoIconName())
				.setTooltip('Open in xLog')
				.onClick(() => {
					window.open(`https://${site.domain}/${post.slug}`, '_blank')
				})
		})

		console.log({ site, posts })
	}

	private async handleActionEdit(slug: string) {
		//
	}

	private async findDocumentBySlug(slug: string) {
		const { vault, metadataCache } = this.app
		const files = vault.getMarkdownFiles()
		files.find(async (file) => {
			// const file = metadataCache.getFileCache(file)?.frontmatter ?? await vault.
			// file.
		})

		// return doc
	}
}

/**
 * Convert an svg string into an HTML element.
 *
 * @param svgText svg image as a string
 */
function SvgElement(svgText: string): HTMLElement {
	const parser = new DOMParser()
	return parser.parseFromString(svgText, 'text/xml').documentElement
}
