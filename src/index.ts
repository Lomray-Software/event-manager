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
   * Normalize channels input
   */
  protected static getChannels = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
  ): TChannel[] => (Array.isArray(channelName) ? channelName : [channelName]);

  /**
   * Subscribe handler on a channel
   */
  public static subscribe = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
    handler: EventHandler<TEventPayload<TChannel>>,
  ): IUnsubscribe => {
    EventManager.getChannels(channelName).forEach((channel) => {
      if (!EventManager.events.has(channel)) {
        EventManager.events.set(channel, new Set());
      }

      EventManager.events.get(channel)!.add(handler);
    });

    return (): EventManager => EventManager.unsubscribe(channelName, handler);
  };

  /**
   * Unsubscribe handler from a channel
   */
  public static unsubscribe = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
    handler: (data?: TEventPayload<TChannel>) => void,
  ): EventManager => {
    EventManager.getChannels(channelName).forEach((channel) => {
      EventManager.events.get(channel)?.delete(handler);
    });

    return EventManager;
  };

  /**
   * Publish data to channel
   */
  public static publish = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
    data?: TEventPayload<TChannel>,
  ): EventManager => {
    EventManager.getChannels(channelName).forEach((channel) => {
      EventManager.events.get(channel)?.forEach((handler) => handler(data));
    });

    return EventManager;
  };
}

export type { EventHandler, IEvents, IUnsubscribe };

export default EventManager;
