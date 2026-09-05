import { expect } from 'chai';
import sinon from 'sinon';
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
    expect(callback).to.not.called;
    expect(unsubscribe).to.be.a('function');
  });

  it('should correctly publish event to channel', () => {
    EventManager.publish(testChannel, 'test-payload');

    expect(callback).to.calledOnceWith('test-payload');
  });

  it('should correctly unsubscribe', () => {
    unsubscribe();

    EventManager.publish(testChannel, { test: 1 });

    expect(callback).to.not.called;
  });

  it('should correctly unsubscribe via method', () => {
    const callback1 = sinon.stub();
    const channel = 'unsubscribe';

    EventManager.subscribe(channel, callback1);
    EventManager.unsubscribe(channel, callback1);
    EventManager.publish(channel);

    expect(callback1).to.not.called;
  });

  it('should correctly publish to not exist channel', () => {
    const res = EventManager.publish('not-exist');

    expect(res).to.equal(EventManager);
  });

  it('should correctly unsubscribe from not exist channel', () => {
    const res = EventManager.unsubscribe('unknown', () => null);

    expect(res).to.equal(EventManager);
  });
});

describe('EventManager subscription changes', () => {
  // Inspect private storage only in tests; keep it out of the public API.
  const events = EventManager['events'];

  afterEach(() => {
    events.clear();
  });

  it('should deliver once per publication when a handler renews itself', () => {
    let calls = 0;
    const handler = () => {
      calls++;
      // Fail instead of hanging if dispatch starts iterating a live Set again.
      expect(calls).to.be.at.most(2);
      EventManager.unsubscribe('renew', handler);
      EventManager.subscribe('renew', handler);
    };
    const otherHandler = sinon.stub();
    const stop = EventManager.subscribe('renew', handler);

    // Keep the channel alive during renewal so deletion alone cannot fix this test.
    const stopOther = EventManager.subscribe('renew', otherHandler);

    EventManager.publish('renew');
    expect(calls).to.equal(1);
    expect(otherHandler).to.calledOnce;

    EventManager.publish('renew');
    expect(calls).to.equal(2);
    expect(otherHandler).to.calledTwice;
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
    expect(removed).to.calledOnceWith('first', 'snapshot');
    expect(added).to.not.called;

    EventManager.publish('snapshot', 'second');
    expect(removed).to.calledOnce;
    expect(added).to.calledOnceWith('second', 'snapshot');
  });

  it('should clean up the original channels after the caller mutates its array', () => {
    const channels = ['original', 'second'];
    const handler = sinon.stub();
    const stop = EventManager.subscribe(channels, handler);
    const stopReplacement = EventManager.subscribe('replacement', handler);

    channels.splice(0, channels.length, 'replacement');
    stop();

    EventManager.publish(['original', 'second']);
    expect(handler).to.not.called;
    EventManager.publish('replacement');
    expect(handler).to.calledOnce;
    stopReplacement();
  });

  it('should retain a channel until its last handler is removed', () => {
    const first = sinon.stub();
    const second = sinon.stub();
    const stopFirst = EventManager.subscribe('shared', first);
    const stopSecond = EventManager.subscribe('shared', second);

    stopFirst();
    expect(events.get('shared')?.size).to.equal(1);
    EventManager.publish('shared');
    expect(first).to.not.called;
    expect(second).to.calledOnce;

    stopSecond();
    stopSecond();
    expect(events.has('shared')).to.equal(false);
  });

  it('should release channel storage after cleanup', () => {
    for (let i = 0; i < 1000; i++) {
      EventManager.subscribe(`temporary:${i}`, () => null)();
    }

    expect(events.size).to.equal(0);
    expect([...events.values()].some((handlers) => handlers.size === 0)).to.equal(false);
  });
});
