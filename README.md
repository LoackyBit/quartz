# Quartz Obsidian Sync Scripts (Non pubblicati)

Questa guida spiega come usare gli script in `scripts/` per sincronizzare i contenuti da Obsidian a Quartz.

## Script disponibili

- `obsidian-sync.mjs`: sync dei file dal vault Obsidian a `content/`
- `install-obsidian-sync-launchagent.sh`: installa il servizio macOS automatico
- `uninstall-obsidian-sync-launchagent.sh`: rimuove il servizio macOS automatico

## Requisiti

- macOS
- Node.js 22+
- npm 10.9+
- `rsync` disponibile nel sistema
- repository git configurato con accesso push verso `origin`

Comando consigliato prima di usare gli script:

```bash
cd /Users/lorenzo/Documents/GitHub/quartz
nvm use 22
```

Non usare `sudo` per questi script.

## Modalita 1: Sync singola (una tantum)

Esegue una sola sincronizzazione dal vault Obsidian verso `content/`.

```bash
npm run qsync
```

Equivalente diretto:

```bash
node ./scripts/obsidian-sync.mjs once
```

## Modalita 2: Sync automatica locale (watch)

Resta in ascolto delle modifiche in Obsidian e sincronizza `content/` automaticamente.

```bash
npm run qsync:watch
```

Per fermare: `Ctrl+C`.

## Modalita 3: Sync automatica + deploy online

Watch continuo con commit/push automatico delle modifiche in `content/`.
Ogni push attiva GitHub Actions e aggiorna GitHub Pages.

```bash
npm run qsync:deploy
```

Per fermare: `Ctrl+C`.

## Modalita 4: Anteprima locale + sync automatica

Avvia Quartz in serve mode e sincronizza in automatico.

```bash
npm run qserve
```

Con deploy automatico incluso:

```bash
npm run qserve:deploy
```

## Avvio automatico con Obsidian (macOS)

Installa un `LaunchAgent` che:

- avvia il watcher quando Obsidian e aperto
- ferma il watcher quando Obsidian viene chiuso

Installazione:

```bash
./scripts/install-obsidian-sync-launchagent.sh
```

Disinstallazione:

```bash
./scripts/uninstall-obsidian-sync-launchagent.sh
```

## Log utili

- Watcher log: `~/Library/Logs/quartz-obsidian-sync.log`
- Supervisor log: `~/Library/Logs/quartz-obsidian-supervisor.log`

## Troubleshooting rapido

- Errore engine Node/npm: esegui `nvm use 22`
- Sync non parte: verifica che il percorso del vault Obsidian esista
- Deploy non parte: verifica accesso git push su `origin` e branch corretto
