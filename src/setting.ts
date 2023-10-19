import { type App, Notice, PluginSettingTab, Setting } from 'obsidian'
import { type XlogAppPlugin } from './plugin'

export interface PluginSettings {
	characterId?: number
	token?: string
	accountType?: 'email' | 'op'
	/** xlog_slug to obsidian filepath */
	postMapping?: Record<string, string>
}

const DEFAULT_SETTINGS: PluginSettings = {
	characterId: undefined,
	token: undefined,
	accountType: undefined,
	postMapping: undefined,
}

/**
 * To change a new setting:
 * ```ts
 * this.settings.mySetting = 'new value'
 * await this.saveSettings()
 * ```
 */
export class SettingTab extends PluginSettingTab {
	plugin: XlogAppPlugin
	settings!: PluginSettings

	constructor(app: App, plugin: XlogAppPlugin) {
		super(app, plugin)
		this.plugin = plugin

		this.registerLoginHandler()
	}

	private registerLoginHandler() {
		this.plugin.registerObsidianProtocolHandler('xlog-login', async (data) => {
			const loginData = data as object as {
				characterId: string
				token: string
				type: 'op' | 'email'
			}

			console.debug({ loginData })

			// check data
			if (!loginData.characterId || !loginData.token || !loginData.type) {
				new Notice('Failed to login: the login data is not correct')
				return
			}

			// save data
			this.settings.characterId = parseInt(loginData.characterId, 10)
			this.settings.token = loginData.token
			this.settings.accountType = loginData.type
			await this.saveSettings()

			new Notice('Login successfully.')

			this.display() // refresh display
		})
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		containerEl.createEl('h2', { text: 'Settings for xLog plugin.' })

		// login
		const hasLoggedIn = !!this.settings.token
		new Setting(containerEl)
			.setName('Account')
			.setDesc(
				hasLoggedIn
					? `Character ID: ${this.settings.characterId}`
					: 'Login to xLog with your Crossbell account.',
			)
			.addButton((button) => {
				if (!hasLoggedIn) {
					button
						.setButtonText('Login')
						.setCta()
						.onClick(async () => {
							// for electron: require("shell").openExternal("http://...")
							// but the below just works:
							window.open('https://f.crossbell.io/obsidian-login', '_blank')
						})
				} else {
					button
						.setButtonText('Logout')
						.setWarning()
						.onClick(async () => {
							this.settings.token = undefined
							this.settings.characterId = undefined
							this.settings.accountType = undefined
							await this.saveSettings()
							new Notice('Logout successfully.')
							this.display() // refresh display
						})
				}
			})

		// new Setting(containerEl)
		// 	.setName('Setting #1')
		// 	.setDesc("It's a secret")
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder('Enter your secret')
		// 			.setValue(this.plugin.settings.mySetting)
		// 			.onChange(async (value) => {
		// 				console.log('Secret: ' + value)
		// 				this.plugin.settings.mySetting = value
		// 				await this.plugin.saveSettings()
		// 			}),
		// 	)
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData(),
		)
	}

	async saveSettings() {
		await this.plugin.saveData(this.settings)
	}
}
