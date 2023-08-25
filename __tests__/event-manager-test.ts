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
