const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const seedDir = path.join(root, 'database-seed')
const envId = process.argv[2] || 'cloud1-d3geudxpp50aa1802'
const collections = ['users', 'posts', 'activities', 'conversations']

function runCloudbase(commands) {
  const cloudbaseBin = process.platform === 'win32'
    ? path.join(process.env.APPDATA || '', 'npm', 'node_modules', '@cloudbase', 'cli', 'bin', 'cloudbase')
    : 'cloudbase'
  const command = process.platform === 'win32' ? 'node' : cloudbaseBin
  const args = [
    ...(process.platform === 'win32' ? [cloudbaseBin] : []),
    '-e',
    envId,
    'db',
    'nosql',
    'execute',
    '--json',
    '--command',
    JSON.stringify(commands),
  ]

  const result = spawnSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error([
      `cloudbase exited with ${result.status}`,
      result.error && `error:\n${result.error.stack || result.error.message || result.error}`,
      result.stdout && `stdout:\n${result.stdout}`,
      result.stderr && `stderr:\n${result.stderr}`,
    ].filter(Boolean).join('\n\n'))
  }

  return result.stdout.trim()
}

function buildDeleteCommand(collection) {
  return {
    TableName: collection,
    CommandType: 'DELETE',
    Command: JSON.stringify({
      delete: collection,
      deletes: [{ q: { seedTag: 'huanhu-initial-v1' }, limit: 0 }],
    }),
  }
}

function buildUpdateCommand(collection, docs) {
  return {
    TableName: collection,
    CommandType: 'UPDATE',
    Command: JSON.stringify({
      update: collection,
      updates: docs.map((doc) => {
        const { _id, ...data } = doc
        return {
          q: { _id },
          u: { $set: data },
          upsert: true,
        }
      }),
    }),
  }
}

function buildCountCommand(collection) {
  return {
    TableName: collection,
    CommandType: 'COMMAND',
    Command: JSON.stringify({
      count: collection,
      query: { seedTag: 'huanhu-initial-v1' },
    }),
  }
}

for (const collection of collections) {
  const file = path.join(seedDir, `${collection}.json`)
  const docs = JSON.parse(fs.readFileSync(file, 'utf8'))

  console.log(`Importing ${collection}: ${docs.length} documents`)
  runCloudbase([buildDeleteCommand(collection)])
  runCloudbase([buildUpdateCommand(collection, docs)])
}

const counts = runCloudbase(collections.map(buildCountCommand))
console.log(counts)
console.log('Seed data import finished.')
