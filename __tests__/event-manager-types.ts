import EventManager, { EventHandler, IUnsubscribe } from '../src';

// Compiled with tsc --noEmit by npm test's pretest hook; never invoked at runtime.
export const checkChaining = (handler: EventHandler): void => {
  const published: typeof EventManager = EventManager.publish('a').publish('b');
  const unsubscribed: typeof EventManager = EventManager.unsubscribe('a', handler);
  const stop: IUnsubscribe = unsubscribed.subscribe('a', handler);
  const cleaned: typeof EventManager = stop();
  const chainedCleanup: typeof EventManager = EventManager.subscribe('a', handler)().publish('b');

  EventManager.unsubscribe('a', handler).subscribe('b', handler);
  cleaned.publish('b');
  void [published, chainedCleanup];
};
