type EventHandler<TData = any> = (data?: TData) => void;

interface IUnsubscribe {
  (): EventManager;
}

// For augmentation
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEventsPayload {}

type TEventsKeys = keyof IEventsPayload | string;
type TEventPayload<TChannel extends TEventsKeys> = TChannel extends keyof IEventsPayload
  ? IEventsPayload[TChannel]
  : any;

type IEvents = Map<
  keyof IEventsPayload | string,
  Set<EventHandler<IEventsPayload[keyof IEventsPayload]>>
>;

/**
 * Simple event manager pattern for pub/sub
 */
class EventManager {
  /**
   * @private
   */
  private static readonly events: IEvents = new Map();

  /**
   * Subscribe handler on a channel
   */
  public static subscribe = <TChannel extends TEventsKeys>(
    channelName: TChannel,
    handler: EventHandler<TEventPayload<TChannel>>,
  ): IUnsubscribe => {
    if (!EventManager.events.has(channelName)) {
      EventManager.events.set(channelName, new Set());
    }

    EventManager.events.get(channelName)!.add(handler);

    return (): EventManager => EventManager.unsubscribe(channelName, handler);
  };

  /**
   * Make unsubscribe function for many callbacks
   * @protected
   */
  protected static makeUnsubscribe(unsub: IUnsubscribe[]): IUnsubscribe {
    return () => {
      unsub.forEach((unsubscribe) => unsubscribe());

      return EventManager;
    };
  }

  /**
   * Subscribe multiple handlers on a channel
   */
  public static subscribeMany = <TChannel extends TEventsKeys>(
    channelName: TChannel,
    handlers: EventHandler<TEventPayload<TChannel>>[],
  ): IUnsubscribe => {
    const unsub = handlers.map((handler) => EventManager.subscribe(channelName, handler));

    return this.makeUnsubscribe(unsub);
  };

  /**
   * Subscribe handler on multiple channels
   */
  public static subscribeChannels = <TChannel extends TEventsKeys>(
    channelNames: TChannel[],
    handler: EventHandler<TEventPayload<TChannel>>,
  ): IUnsubscribe => {
    const unsub = channelNames.map((channelName) => EventManager.subscribe(channelName, handler));

    return this.makeUnsubscribe(unsub);
  };

  /**
   * Unsubscribe handler from a channel
   */
  public static unsubscribe = <TChannel extends TEventsKeys>(
    channelName: TChannel,
    handler: (data?: TEventPayload<TChannel>) => void,
  ): EventManager => {
    EventManager.events.get(channelName)?.delete(handler);

    return EventManager;
  };

  /**
   * Publish data to channel
   */
  public static publish = <TChannel extends TEventsKeys>(
    channelName: TChannel,
    data?: TEventPayload<TChannel>,
  ): EventManager => {
    EventManager.events.get(channelName)?.forEach((handler) => handler(data as never));

    return EventManager;
  };

  /**
   * Publish data to many channels
   */
  public static publishMany = <TChannel extends TEventsKeys>(
    channelNames: TChannel[],
    data?: TEventPayload<TChannel>,
  ): EventManager => {
    channelNames.forEach((channelName) => this.publish(channelName, data));

    return EventManager;
  };
}

export type { EventHandler, IEvents, IUnsubscribe };

export default EventManager;
