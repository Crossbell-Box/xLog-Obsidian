import { existsSync } from 'fs'
import { resolve } from 'path'
import { copyFile, mkdir } from 'fs/promises'
import { defineConfig } from 'tsup'
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig((options) => ({
	entry: {
		index: './src/index.ts',
	},
	outDir: './dist',
	format: ['cjs'],
	clean: true,
	sourcemap: options.watch ? 'inline' : false,
	minify: !options.watch,
	target: 'es2020',
	bundle: true,
	treeshake: true,
	noExternal: ['crossbell'],
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
	],
	onSuccess: async () => {
		const id = require('./manifest.json').id
		const testPath = resolve(process.env.OBSIDIAN_PLUGIN_PATH as string, id)

		if (!existsSync(testPath)) {
			await mkdir(testPath)
		}

		copyFile('./dist/index.js', resolve(testPath, 'main.js'))
		copyFile('./manifest.json', resolve(testPath, 'manifest.json'))
		copyFile('./styles.css', resolve(testPath, 'styles.css'))
		// copyFile('./.hotreload', resolve(testPath, '.hotreload'))

		console.log('Moved to obsidian plugin.')
	},
}))
