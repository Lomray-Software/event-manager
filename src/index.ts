type EventHandler<TData = any> = (data: TData) => void;

type IEvents = Map<string, Set<EventHandler>>;

interface IUnsubscribe {
  (): EventManager;
}

/**
 * Simple event manager pattern for pub/sub
 */
class EventManager {
  /**
   * @private
   */
  private static events: IEvents = new Map();

  /**
   * Subscribe handler on a channel
   */
  static subscribe = <TData = any>(
    channelName: string,
    handler: EventHandler<TData>,
  ): IUnsubscribe => {
    if (!EventManager.events.has(channelName)) {
      EventManager.events.set(channelName, new Set());
    }

    EventManager.events.get(channelName)!.add(handler);

    return (): EventManager => EventManager.unsubscribe(channelName, handler);
  };

  /**
   * Subscribe multiple handlers on a channel
   */
  static subscribeMany = <TData = any>(
    channelName: string,
    handlers: EventHandler<TData>[],
  ): IUnsubscribe => {
    const unsub = handlers.map((handler) => EventManager.subscribe(channelName, handler));

    return () => {
      unsub.map((unsubscribe) => unsubscribe());

      return EventManager;
    };
  };

  /**
   * Unsubscribe handler from a channel
   */
  static unsubscribe = (channelName: string, handler: (data?: any) => void): EventManager => {
    EventManager.events.get(channelName)?.delete(handler);

    return EventManager;
  };

  /**
   * Publish data to channel
   */
  static publish = <TData = any>(channelName: string, data?: TData): EventManager => {
    EventManager.events.get(channelName)?.forEach((handler) => handler(data));

    return EventManager;
  };
}

export type { EventHandler, IEvents, IUnsubscribe };

export default EventManager;
