import { readFileSync, writeFileSync } from 'node:fs'

const targetVersion = Bun.env.npm_package_version
if (!targetVersion) {
	throw new Error('npm_package_version not defined')
}

// read minAppVersion from manifest.json and bump version to target version
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'))
const { minAppVersion } = manifest
manifest.version = targetVersion
writeFileSync('manifest.json', JSON.stringify(manifest, null, '\t'))

// update versions.json with target version and minAppVersion from manifest.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'))
versions[targetVersion] = minAppVersion
writeFileSync('versions.json', JSON.stringify(versions, null, '\t'))

console.log({ versions })
