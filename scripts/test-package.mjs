import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = mkdtempSync(path.join(tmpdir(), 'event-manager-package-'));
const env = { ...process.env };

delete env.NO_COLOR;

/**
 * Resolve npm from the active npm invocation or the current Node installation.
 */
const npmCli =
  process.env.npm_execpath ??
  path.join(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js');

/**
 * Use the current Node binary without resolving executables through PATH.
 */
const run = (args, cwd = temporary) =>
  execFileSync(process.execPath, args, {
    cwd,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    timeout: 120_000,
  });

try {
  /**
   * Match release preparation without changing the checkout or installing Git hooks.
   */
  const staging = path.join(temporary, 'package');

  cpSync(root, staging, {
    recursive: true,
    filter: (source) =>
      !['.git', '.agents', '.codex', 'node_modules'].includes(
        path.relative(root, source).split(path.sep)[0],
      ),
  });
  const metadata = JSON.parse(readFileSync(path.join(staging, 'package.json'), 'utf8'));

  delete metadata.scripts.prepare;
  writeFileSync(path.join(staging, 'package.json'), `${JSON.stringify(metadata, null, 2)}\n`);

  const [packed] = JSON.parse(
    run([npmCli, 'pack', '--ignore-scripts', '--json', '--pack-destination', temporary], staging),
  );

  assert.deepEqual(packed.files.map(({ path: filename }) => filename).sort(), [
    'README.md',
    'lib/index.d.ts',
    'lib/index.js',
    'package.json',
  ]);
  writeFileSync(path.join(temporary, 'package.json'), JSON.stringify({ private: true }));
  run([
    npmCli,
    'install',
    '--offline',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    path.join(temporary, packed.filename),
  ]);

  const require = createRequire(path.join(temporary, 'package.json'));
  const manifest = require('@lomray/event-manager/package.json');
  const entry = require.resolve('@lomray/event-manager');
  const EventManager = require('@lomray/event-manager');

  assert.deepEqual(
    [manifest.main, manifest.types, manifest.type, manifest.exports],
    ['lib/index.js', 'lib/index.d.ts', undefined, undefined],
  );
  assert.equal(typeof EventManager, 'function');
  assert.deepEqual(Object.keys(EventManager), [
    'events',
    'getChannels',
    'subscribe',
    'unsubscribe',
    'publish',
  ]);
  assert.equal((await import(pathToFileURL(entry).href)).default, EventManager);
  assert.equal(
    readFileSync(path.join(path.dirname(entry), 'index.d.ts'), 'utf8'),
    readFileSync(path.join(root, 'types/index.d.ts'), 'utf8'),
  );

  const received = [];
  const stop = EventManager.subscribe('package:event', (...args) => received.push(args));

  assert.equal(EventManager.publish('package:event', { id: 1 }), EventManager);
  assert.deepEqual(received, [[{ id: 1 }, 'package:event']]);
  assert.equal(stop(), EventManager);
  EventManager.publish('package:event', { id: 2 });
  assert.equal(received.length, 1);
  console.info('PASS packed files, CommonJS/ESM exports, declarations, delivery and cleanup');

  writeFileSync(
    path.join(temporary, 'consumer.ts'),
    `import EventManager from '@lomray/event-manager';
import type { EventHandler, IEvents, IUnsubscribe } from '@lomray/event-manager';

declare module '@lomray/event-manager' {
  interface IEventsPayload {
    'package:event': { id: number };
  }
}

const handler: EventHandler<{ id: number }> = (data, channel) => {
  const id: number | undefined = data?.id;
  const name: string | undefined = channel;
  void [id, name];
};
const stop: IUnsubscribe = EventManager.subscribe('package:event', handler);
const chained: typeof EventManager = stop().publish('package:event', { id: 1 });
const events: IEvents = new Map();
EventManager.unsubscribe('package:event', handler).subscribe('untyped', () => {});
EventManager.publish('untyped', 'arbitrary payload');
// @ts-expect-error Augmented channels enforce their payload type.
EventManager.publish('package:event', { id: 'invalid' });
// @ts-expect-error Internal storage is not part of the public declaration.
EventManager.events;
void [chained, events];
`,
  );
  writeFileSync(
    path.join(temporary, 'consumer.cts'),
    `import EventManager = require('@lomray/event-manager');
const chained: typeof EventManager = EventManager.publish('commonjs');
const stop: EventManager.IUnsubscribe = chained.subscribe('commonjs', () => {});
stop().publish('commonjs');
`,
  );

  for (const [moduleResolution, module] of [
    ['Bundler', 'ESNext'],
    ['Node16', 'Node16'],
    ['NodeNext', 'NodeNext'],
  ]) {
    writeFileSync(
      path.join(temporary, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          noEmit: true,
          strict: true,
          skipLibCheck: false,
          esModuleInterop: true,
          target: 'ES2022',
          types: [],
          module,
          moduleResolution,
        },
        files: moduleResolution === 'Bundler' ? ['consumer.ts'] : ['consumer.ts', 'consumer.cts'],
      }),
    );
    run([path.join(root, 'node_modules/typescript/bin/tsc'), '--project', 'tsconfig.json']);
    console.info(`PASS ${moduleResolution}: strict declarations, augmentation and chaining`);
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
