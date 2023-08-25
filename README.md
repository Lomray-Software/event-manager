# Event manager on Typescript

This package provides simple event manager on typescript for any JS/TS project (React/React Native/NodeJS).

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

1. Install package:

```sh
  npm i --save @lomray/event-manager
```

2. Add subscribers and emit events:
```typescript
import EventManager from '@lomray/event-manager';

enum Channel {
    demo = 'demo'
}

// Listen event on channel (don't forget call unsubscribe for remove litener)
const unsubscribe = EventManager.subscribe(Channel.demo, (data) => {
    console.log(data);
});

// Publish some data to channel
setInterval(() => {
  EventManager.publish(Channel.demo, { prop1: 'hi', prop2: 1 });
}, 5000);

// remove listener
unsubscribe()

// You can publish and subscribe on multiple channels
EventManager.subscribe(['channel1', 'channel2'], (data) => {
  console.log(data);
});
EventManager.publish(['channel1', 'channel2'], { prop1: 'hi', prop2: 1 });
```

Working example for react:
```typescript
const DemoComponent = () => {
    useEffect(() => {
      const unsubscribe = EventManager.subscribe(Channel.demo, (data) => {
        console.log(data);
      });
      
      return () => {
        unsubscribe();
      }
    });
}
```

Example augmentation for describe payload events:
```typescript

declare module '@lomray/event-manager' {
    export interface IEventsPayload {
        [Channel.demo]: {
            prop1: string;
            prop2: number;
        }
    }
}
```
