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

  it('should correctly subscribe many', () => {
    const callback1 = sinon.stub();
    const callback2 = sinon.stub();
    const payload = 'hello';

    const unsubscribeMany = EventManager.subscribeMany('test2', [callback1, callback2]);

    EventManager.publish('test2', payload);

    unsubscribeMany();

    EventManager.publish('test2', 'world');

    expect(callback1).to.calledOnceWith(payload);
    expect(callback2).to.calledOnceWith(payload);
  });

  it('should correctly publish to not exist channel', () => {
    EventManager.publish('not-exist');
  });

  it('should correctly unsubscribe from not exist channel', () => {
    EventManager.unsubscribe('unknown', () => null);
  });
});
