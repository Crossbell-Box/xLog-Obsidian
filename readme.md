# Obsidian xLog

> WIP. This plugin is not ready for use.

## Contributing

### Development

1. Clone this repository.

2. Install deps.

```bash
bun install
```

2. Develop:

```bash
mv .env.example .env
echo 'OBSIDIAN_PLUGIN_PATH=YOUR-OB-VAULT-PATH/.obsidian/plugins'
export OBSIDIAN_PLUGIN_DIR=~/obsidian/plugins
bun run dev
```

3. Bump version:

Change the version in `package.json` and run `bun run version`.
