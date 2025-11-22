import { EventEmitter } from 'events';

class EventBusService extends EventEmitter {
  emitComparisonUpdate(id: string, payload: any) {
    this.emit(`comparison-update:${id}`, payload);
  }

  onComparisonUpdate(id: string, cb: (payload: any) => void) {
    this.on(`comparison-update:${id}`, cb);
    return () => this.removeListener(`comparison-update:${id}`, cb);
  }
}

const eventBusService = new EventBusService();
export default eventBusService;
