import sinon from 'sinon';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import EventManager from '../src';

describe('EventManager', () => {
  const sandbox = sinon.createSandbox();
  const callback = sandbox.stub();
  const testChannel = 'test1';
  const unsubscribe = EventManager.subscribe(testChannel, callback);

  beforeEach(() => {
    sandbox.reset();
  });

  it('should correctly subscribe & unsubscribe', () => {
    expect(callback.called).toBe(false);
    expect(unsubscribe).toBeTypeOf('function');
  });

  it('should correctly publish event to channel', () => {
    EventManager.publish(testChannel, 'test-payload');

    expect(callback.calledOnceWith('test-payload')).toBe(true);
  });

  it('should correctly unsubscribe', () => {
    unsubscribe();

    EventManager.publish(testChannel, { test: 1 });

    expect(callback.called).toBe(false);
  });

  it('should correctly unsubscribe via method', () => {
    const callback1 = sinon.stub();
    const channel = 'unsubscribe';

    EventManager.subscribe(channel, callback1);
    EventManager.unsubscribe(channel, callback1);
    EventManager.publish(channel);

    expect(callback1.called).toBe(false);
  });

  it('should correctly publish to not exist channel', () => {
    const res = EventManager.publish('not-exist');

    expect(res).toBe(EventManager);
  });

  it('should correctly unsubscribe from not exist channel', () => {
    const res = EventManager.unsubscribe('unknown', () => null);

    expect(res).toBe(EventManager);
  });
});

describe('EventManager subscription changes', () => {
  // Inspect private storage only in tests; keep it out of the public API.
  const { events } = EventManager as unknown as { events: Map<string, Set<unknown>> };

  afterEach(() => {
    events.clear();
  });

  it('should deliver once per publication when a handler renews itself', () => {
    let calls = 0;
    const handler = () => {
      calls++;
      // Fail instead of hanging if dispatch starts iterating a live Set again.
      expect(calls).toBeLessThanOrEqual(2);
      EventManager.unsubscribe('renew', handler);
      EventManager.subscribe('renew', handler);
    };
    const otherHandler = sinon.stub();
    const stop = EventManager.subscribe('renew', handler);

    // Keep the channel alive during renewal so deletion alone cannot fix this test.
    const stopOther = EventManager.subscribe('renew', otherHandler);

    EventManager.publish('renew');
    expect(calls).toBe(1);
    expect(otherHandler.callCount).toBe(1);

    EventManager.publish('renew');
    expect(calls).toBe(2);
    expect(otherHandler.callCount).toBe(2);
    stop();
    stopOther();
  });

  it('should apply added and removed handlers on the next publication', () => {
    const removed = sinon.stub();
    const added = sinon.stub();

    EventManager.subscribe('snapshot', () => {
      EventManager.unsubscribe('snapshot', removed);
      EventManager.subscribe('snapshot', added);
    });
    EventManager.subscribe('snapshot', removed);

    EventManager.publish('snapshot', 'first');
    expect(removed.calledOnceWith('first', 'snapshot')).toBe(true);
    expect(added.called).toBe(false);

    EventManager.publish('snapshot', 'second');
    expect(removed.callCount).toBe(1);
    expect(added.calledOnceWith('second', 'snapshot')).toBe(true);
  });

  it('should clean up the original channels after the caller mutates its array', () => {
    const channels = ['original', 'second'];
    const handler = sinon.stub();
    const stop = EventManager.subscribe(channels, handler);
    const stopReplacement = EventManager.subscribe('replacement', handler);

    channels.splice(0, channels.length, 'replacement');
    stop();

    EventManager.publish(['original', 'second']);
    expect(handler.called).toBe(false);
    EventManager.publish('replacement');
    expect(handler.callCount).toBe(1);
    stopReplacement();
  });

  it('should retain a channel until its last handler is removed', () => {
    const first = sinon.stub();
    const second = sinon.stub();
    const stopFirst = EventManager.subscribe('shared', first);
    const stopSecond = EventManager.subscribe('shared', second);

    stopFirst();
    expect(events.get('shared')?.size).toBe(1);
    EventManager.publish('shared');
    expect(first.called).toBe(false);
    expect(second.callCount).toBe(1);

    stopSecond();
    stopSecond();
    expect(events.has('shared')).toBe(false);
  });

  it('should release channel storage after cleanup', () => {
    for (let i = 0; i < 1000; i++) {
      EventManager.subscribe(`temporary:${i}`, () => null)();
    }

    expect(events.size).toBe(0);
    expect([...events.values()].some((handlers) => handlers.size === 0)).toBe(false);
  });
});
