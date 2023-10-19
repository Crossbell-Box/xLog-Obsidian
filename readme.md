# Obsidian xLog

> WIP. This plugin is not ready for use.

## Contributing

### Development

#### Clone this repository

#### Install deps

```bash
bun install
```

### Develop

```bash
mv .env.example .env
# 修改 YOUR-OB-VAULT-PATH 实际 vault 的路径
echo 'OBSIDIAN_PLUGIN_PATH=YOUR-OB-VAULT-PATH/.obsidian/plugins' >> .env
export OBSIDIAN_PLUGIN_DIR=~/obsidian/plugins
bun run dev
```

#### Bump version:

Change the version in `package.json` and run `bun run version`.
