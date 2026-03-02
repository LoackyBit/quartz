---
title: Migrazione blog da Astro a Quartz
date: 2026-03-02
tags:
  - quartz
  - migrazione
  - obsidian
  - github-actions
  - digital-garden
stage: learning 🧩
source:
  - https://github.com/LoackyBit/quartz
summary: Migrazione da Astro a Quartz con deploy su GitHub Pages, sync Obsidian automatica e revisione completa di contenuti e configurazione.
draft: false
---

## Cosa hai cambiato

Ho rifatto il setup del blog su Quartz in modo strutturale, non solo contenutistico.

- Deploy automatico con GitHub Actions (deploy.yml) su branch `v4`
- Tema remoto applicato in build (`ayu-light-mirage`) via step `curl ... | bash`
- Configurazione `baseUrl` aggiornata e poi stabilizzata su `"/quartz"`
- Nuovo flusso di sync Obsidian -> Quartz con script Node dedicato
- Nuovi script npm per sync singola, watch, serve e auto-push
- Aggiornamento README da guida generica Quartz a guida operativa locale
- Riallineamento della cartella content con più passaggi (dir/symlink/sync)
- Pulizia finale di file temporanei (`content/sda.md` rimosso)

## Timeline sintetica

Fasi principali:
1. Introduzione pipeline deploy e primi contenuti Quartz.
2. Serie di fix su quartz.config.ts per URL GitHub Pages (`baseUrl`).
3. Tentativi sul tema in workflow (aggiunta/rimozione/reintroduzione step fetch tema).
4. Alternanza tra content directory e symlink verso vault blog.
5. Introduzione stack di sincronizzazione Obsidian (obsidian-sync.mjs).
6. Attivazione modalità auto-commit/push per deploy continuo.
7. Documentazione finale dei nuovi comandi nel README.

## Passaggi pratici

Comandi chiave che ho standardizzato:

```bash
npm run qsync
npm run qsync:watch
npm run qserve
npm run qsync:deploy
npm run qserve:deploy
```

Lo script `obsidian-sync.mjs` fa:
- sync con `rsync -a --delete` dal vault Obsidian a content
- esclusione di `.obsidian`, `.trash`, .DS_Store, .git
- watch con `chokidar`
- opzionale `--serve` (avvia Quartz)
- opzionale `--push` (commit+push automatico solo su content)

## Errori comuni emersi

- `baseUrl` non coerente con Pages: causa link rotti o asset mancanti.
- Passaggio dir <-> symlink su content: genera commit rumorosi (delete/add massivi).
- Auto-push su watch senza filtri: produce molti commit ravvicinati.
- Dipendenze runtime non allineate: hai fissato Node con .nvmrc a `22`.
- .gitignore su scripts: rischio di non versionare script critici.

## Stato attuale

Il setup finale è coerente con un workflow "Obsidian-first":
- scrivi nel vault
- sync automatico verso Quartz
- build/deploy automatizzato su GitHub Pages

## Collegamenti

- [[Quartz]]
- [[Obsidian Sync]]
- [[GitHub Actions Deploy]]
- [[Digital Garden Workflow]]
