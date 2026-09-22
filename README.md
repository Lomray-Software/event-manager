# Event manager on Typescript

A synchronous event manager for JavaScript and TypeScript.

<p align="center">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=reliability_rating" alt="reliability">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=security_rating" alt="Security Rating">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=sqale_rating" alt="Maintainability Rating">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=vulnerabilities" alt="Vulnerabilities">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=bugs" alt="Bugs">
  <img src="https://sonarcloud.io/api/project_badges/measure?project=event-manager-lib&metric=ncloc" alt="Lines of Code">
  <img src="https://img.shields.io/bundlephobia/minzip/@lomray/event-manager" alt="size">
  <img src="https://img.shields.io/npm/l/@lomray/event-manager" alt="size">
  <img src="https://img.shields.io/npm/v/@lomray/event-manager?label=semantic%20release&logo=semantic-release" alt="semantic version">
</p>

## Usage

Use this for synchronous, in-process publish/subscribe between parts of one
application. It is not a message broker: there is no persistence, replay, network
transport, or per-request isolation. Channels belong to a static shared registry;
do not use shared channels for private data across server requests.

```sh
npm i --save @lomray/event-manager
```

<!-- docs-test:example -->
```typescript
import EventManager from '@lomray/event-manager';

const received: string[] = [];
const unsubscribe = EventManager.subscribe('example:message', (data: string | undefined) => {
  if (data !== undefined) {
    received.push(data);
  }
});

EventManager.publish('example:message', 'hello');
unsubscribe();
EventManager.publish('example:message', 'not received');
console.log(received); // ['hello']
```

Retain the unsubscribe function and call it when the subscriber is no longer
needed. In a React effect, return a cleanup function that calls it. If you also
start a timer, clear that timer separately. An unsubscribe function removes a
handler, not other work started by your application.

Both `subscribe` and `publish` accept a channel name or an array of channel names.
Each channel's handlers are captured when dispatch for that channel starts.
Subscriptions added or removed by a handler take effect on the next publication
to that channel. Handler exceptions propagate to the caller.

For typed payloads, augment the exported interface in an application module:

```typescript
import '@lomray/event-manager';

declare module '@lomray/event-manager' {
  interface IEventsPayload {
    'order:created': { orderId: string };
  }
}
```

The bounded subscribe/publish/unsubscribe example is checked against release 2.0.3.
The package is CommonJS; the TypeScript example uses default-import interop.
A native CommonJS consumer can use
`const EventManager = require('@lomray/event-manager')`.
