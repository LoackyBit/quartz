#!/usr/bin/env node

import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import chokidar from 'chokidar'

const DEFAULT_SOURCE =
  '/Users/lorenzo/Library/Mobile Documents/iCloud~md~obsidian/Documents/Ken vault/08 - Blog'
const DEFAULT_TARGET = path.resolve(process.cwd(), 'content')

const args = process.argv.slice(2)
const mode = args[0] === 'watch' ? 'watch' : 'once'
const shouldServe = args.includes('--serve')

const source = process.env.OBSIDIAN_BLOG_DIR ?? DEFAULT_SOURCE
const target = process.env.QUARTZ_CONTENT_DIR ?? DEFAULT_TARGET

const rsyncArgs = [
  '-a',
  '--delete',
  '--human-readable',
  '--exclude',
  '.DS_Store',
  '--exclude',
  '.obsidian/',
  '--exclude',
  '.trash/',
  '--exclude',
  '.git/',
  `${source}/`,
  `${target}/`,
]

let isSyncRunning = false
let pendingSync = false

const now = () => new Date().toISOString().replace('T', ' ').replace('Z', '')

const log = (message) => {
  process.stdout.write(`[qsync ${now()}] ${message}\n`)
}

const error = (message) => {
  process.stderr.write(`[qsync ${now()}] ERROR: ${message}\n`)
}

const runSync = async () => {
  if (isSyncRunning) {
    pendingSync = true
    return
  }

  isSyncRunning = true
  pendingSync = false

  await new Promise((resolve, reject) => {
    const child = spawn('rsync', rsyncArgs, { stdio: 'inherit' })

    child.on('error', (err) => {
      reject(err)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve(undefined)
        return
      }

      reject(new Error(`rsync exited with code ${code}`))
    })
  })

  isSyncRunning = false

  if (pendingSync) {
    await runSync()
  }
}

const startQuartzServe = () => {
  const child = spawn('npx', ['quartz', 'build', '--serve'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('close', (code) => {
    if (code === 0) {
      return
    }

    error(`Quartz serve stopped with code ${code}`)
  })

  return child
}

const main = async () => {
  log(`Source: ${source}`)
  log(`Target: ${target}`)

  try {
    await runSync()
    log('Initial sync completed')
  } catch (err) {
    error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }

  let serveProcess

  if (shouldServe) {
    log('Starting Quartz in serve mode')
    serveProcess = startQuartzServe()
  }

  if (mode === 'once') {
    return
  }

  log('Watching for changes...')

  const watcher = chokidar.watch(source, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
    ignored: (entryPath) => {
      const normalizedPath = entryPath.replaceAll('\\', '/')
      return (
        normalizedPath.includes('/.obsidian/') ||
        normalizedPath.includes('/.trash/') ||
        normalizedPath.endsWith('/.DS_Store')
      )
    },
  })

  let syncTimer = null

  const scheduleSync = () => {
    if (syncTimer !== null) {
      clearTimeout(syncTimer)
    }

    syncTimer = setTimeout(async () => {
      try {
        log('Change detected, syncing...')
        await runSync()
        log('Sync completed')
      } catch (err) {
        error(err instanceof Error ? err.message : String(err))
      }
    }, 250)
  }

  watcher.on('add', scheduleSync)
  watcher.on('change', scheduleSync)
  watcher.on('unlink', scheduleSync)
  watcher.on('addDir', scheduleSync)
  watcher.on('unlinkDir', scheduleSync)
  watcher.on('error', (watchErr) => {
    error(watchErr instanceof Error ? watchErr.message : String(watchErr))
  })

  const shutdown = async () => {
    log('Stopping watcher...')
    await watcher.close()

    if (serveProcess) {
      serveProcess.kill('SIGTERM')
    }

    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
