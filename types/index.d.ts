declare namespace EventManager {
  type EventHandler<TData = any> = (data?: TData, channel?: string) => void;

  interface IUnsubscribe {
    (): typeof EventManager;
  }

  // For augmentation
  interface IEventsPayload {}

  type TEventsKeys = keyof IEventsPayload | string;
  type TEventPayload<TChannel extends TEventsKeys> = TChannel extends keyof IEventsPayload
    ? IEventsPayload[TChannel]
    : any;

  type IEvents = Map<
    keyof IEventsPayload | string,
    Set<EventHandler<IEventsPayload[keyof IEventsPayload]>>
  >;
}

declare class EventManager {
  private static readonly events;

  protected static getChannels: <TChannel extends EventManager.TEventsKeys>(
    channelName: TChannel | TChannel[],
  ) => TChannel[];

  static subscribe: <TChannel extends EventManager.TEventsKeys>(
    channelName: TChannel | TChannel[],
    handler: EventManager.EventHandler<EventManager.TEventPayload<TChannel>>,
  ) => EventManager.IUnsubscribe;

  static unsubscribe: <TChannel extends EventManager.TEventsKeys>(
    channelName: TChannel | TChannel[],
    handler: (data?: EventManager.TEventPayload<TChannel>) => void,
  ) => typeof EventManager;

  static publish: <TChannel extends EventManager.TEventsKeys>(
    channelName: TChannel | TChannel[],
    data?: EventManager.TEventPayload<TChannel>,
  ) => typeof EventManager;
}

export = EventManager;
