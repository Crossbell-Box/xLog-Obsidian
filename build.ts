import { existsSync, watch } from 'node:fs'
import { copyFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const isDev = Bun.env.NODE_ENV === 'development'
const PLUGIN_DIR = Bun.env.OBSIDIAN_PLUGIN_DIR

async function builder() {
	if (!PLUGIN_DIR) {
		throw new Error('OBSIDIAN_PLUGIN_DIR not defined')
	}

	const t0 = Bun.nanoseconds()
	const res = await Bun.build({
		entrypoints: ['./src/index.ts'],
		outdir: './dist',
		sourcemap: isDev ? 'external' : 'none',
		minify: !isDev,
		target: 'node',
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
	})

	if (res.success) {
		const id = require('./manifest.json').id
		const testPath = resolve(PLUGIN_DIR, id)

		if (!existsSync(testPath)) {
			await mkdir(testPath)
		}

		copyFile('./dist/index.js', resolve(testPath, 'main.js'))
		copyFile('./manifest.json', resolve(testPath, 'manifest.json'))
		copyFile('./styles.css', resolve(testPath, 'styles.css'))
		copyFile('./.hotreload', resolve(testPath, '.hotreload'))

		const t1 = Bun.nanoseconds()
		console.log(`Build success. (${(t1 - t0) / 1000000}ms)`)
	} else {
		const t1 = Bun.nanoseconds()
		console.error(`Build failed. (${t1 - t0}ms)`)
		console.error(res.logs)
	}
}

builder()

watch('./src', { recursive: true }, builder)
