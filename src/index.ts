type EventHandler<TData = any> = (data?: TData, channel?: string) => void;

interface IUnsubscribe {
  (): typeof EventManager;
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
    const channels = Array.from(EventManager.getChannels(channelName));

    channels.forEach((channel) => {
      if (!EventManager.events.has(channel)) {
        EventManager.events.set(channel, new Set());
      }

      EventManager.events.get(channel)!.add(handler);
    });

    return (): typeof EventManager => EventManager.unsubscribe(channels, handler);
  };

  /**
   * Unsubscribe handler from a channel
   */
  public static unsubscribe = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
    handler: (data?: TEventPayload<TChannel>) => void,
  ): typeof EventManager => {
    EventManager.getChannels(channelName).forEach((channel) => {
      const handlers = EventManager.events.get(channel);

      handlers?.delete(handler);

      if (handlers?.size === 0) {
        EventManager.events.delete(channel);
      }
    });

    return EventManager;
  };

  /**
   * Publish data to channel
   * Snapshot each channel's handlers when dispatch for that channel starts.
   */
  public static publish = <TChannel extends TEventsKeys>(
    channelName: TChannel | TChannel[],
    data?: TEventPayload<TChannel>,
  ): typeof EventManager => {
    EventManager.getChannels(channelName).forEach((channel) => {
      const handlers = EventManager.events.get(channel);

      if (handlers) {
        Array.from(handlers).forEach((handler) => handler(data, channel));
      }
    });

    return EventManager;
  };
}

export type { EventHandler, IEvents, IUnsubscribe };

export default EventManager;
