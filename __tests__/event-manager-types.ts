import type { EventHandler, IUnsubscribe } from '../src';
import EventManager from '../src';

/**
 * Compiled by npm run ts:check; never invoked at runtime.
 */
const checkChaining = (handler: EventHandler): void => {
  const published: typeof EventManager = EventManager.publish('a').publish('b');
  const unsubscribed: typeof EventManager = EventManager.unsubscribe('a', handler);
  const stop: IUnsubscribe = unsubscribed.subscribe('a', handler);
  const cleaned: typeof EventManager = stop();
  const chainedCleanup: typeof EventManager = EventManager.subscribe('a', handler)().publish('b');

  EventManager.unsubscribe('a', handler).subscribe('b', handler);
  cleaned.publish('b');
  void [published, chainedCleanup];
};

export default checkChaining;
