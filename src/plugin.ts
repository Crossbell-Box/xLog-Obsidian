import { App, MarkdownView, Modal, Plugin } from 'obsidian'
import { MappingManager } from './mapping-manager'
import { SettingTab } from './setting'
import { StatusBarItem } from './status-bar-item'
import { Indexer } from './utils/api'
import './utils/icons'
import { addLogoIcon, getLogoIconName } from './utils/logo'
import { ObsidianXlogViewType, ViewPanel } from './views/view-panel'

export class XlogAppPlugin extends Plugin {
	public settingTab!: SettingTab
	public indexer!: Indexer
	public mappingManager!: MappingManager

	async onload() {
		// Load Settings
		this.settingTab = new SettingTab(this.app, this)
		this.addSettingTab(this.settingTab)
		await this.settingTab.loadSettings()

		// Init Indexer
		this.indexer = new Indexer(this)

		// Init Mapping Manager
		this.mappingManager = new MappingManager(this)

		// Register xLog Panel View
		this.registerView(ObsidianXlogViewType, (leaf) => new ViewPanel(leaf, this))
		// Create an icon in the left ribbon to open the plugin's view panel
		addLogoIcon()
		this.addRibbonIcon(getLogoIconName(), 'xLog', (evt: MouseEvent) => {
			this.toggleTableControlsView()
		})

		// Add a status bar item to the bottom of the app. Does not work on mobile apps.
		new StatusBarItem(this)

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open()
			},
		})
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor, view) => {
				console.log(editor.getSelection())
				editor.replaceSelection('Sample Editor Command')
			},
		})
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView)
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open()
					}

					// This command will only show up in Command Palette when the check function returns true
					return true
				}
			},
		})

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt)
		})

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
		)
	}

	onunload() {
		this.mappingManager.onunload()
	}

	private readonly toggleTableControlsView = async (): Promise<void> => {
		// if exists, reveal
		const existing = this.app.workspace.getLeavesOfType(ObsidianXlogViewType)
		if (existing.length) {
			this.app.workspace.revealLeaf(existing[0])
			return
		}

		// if not exists, create
		await this.app.workspace.getRightLeaf(false).setViewState({
			type: ObsidianXlogViewType,
			active: true,
		})
		// then reveal
		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(ObsidianXlogViewType)[0],
		)
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app)
	}

	onOpen() {
		const { contentEl } = this
		contentEl.setText('Woah!')
	}

	onClose() {
		const { contentEl } = this
		contentEl.empty()
	}
}
