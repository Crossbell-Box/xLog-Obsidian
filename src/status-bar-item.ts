import { Notice } from 'obsidian'

import { Plugin } from './plugin'

export class StatusBarItem {
	private plugin: Plugin

	constructor(plugin: Plugin) {
		this.plugin = plugin

		this.init()
	}

	init() {
		this.plugin.app.workspace.onLayoutReady(() => {
			this.addStatusBarItem()
		})
	}

	addStatusBarItem() {
		const statusBarItemEl = this.plugin.addStatusBarItem()
		statusBarItemEl.setText('Status Bar Text')
		this.plugin.registerDomEvent(
			statusBarItemEl,
			'click',
			async (evt: MouseEvent) => {
				new Notice(
					this.plugin.app.workspace.activeEditor?.editor?.getSelection() ??
						'no',
				)
			},
		)
	}
}
