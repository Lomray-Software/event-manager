# Event manager on Typescript

This package provides event manager on typescript for any JS/TS project (React/React Native/NodeJS).

## Usage

1. Install package:

```sh
  npm i --save @lomray/event-manager
```

2. Add subscribers and emitters:
```typescript
import EventManager from '@lomray/event-manager';

interface IDemoChannelData {
    prop1: string;
    prop2: number;
}

enum Channel {
    demo = 'demo'
}

// Listen event on channel (don't forget call unsubscribe for remove litener)
const unsubscribe = EventManager.subscribe<IDemoChannelData>(Channel.demo, (data) => {
    console.log(data);
});

// Publish some data to channel
setInterval(() => {
  EventManager.publish<IDemoChannelData>(Channel.demo, { prop1: 'hi', prop2: 1 });
}, 5000);
```

Working example for react:
```typescript
const DemoComponent = () => {
    useEffect(() => {
      const unsubscribe = EventManager.subscribe<IDemoChannelData>(Channel.demo, (data) => {
        console.log(data);
      });
      
      return () => {
        unsubscribe();
      }
    });
}
```
