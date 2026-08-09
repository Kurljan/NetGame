// src/engine/EventBus.js
// Lightweight pub/sub event system used across the entire game.

class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event.
   * @param {string}   event
   * @param {Function} callback
   * @returns {Function} unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Subscribe once — auto-removes after first call.
   */
  once(event, callback) {
    const wrapper = (data) => { callback(data); this.off(event, wrapper); };
    return this.on(event, wrapper);
  }

  /** Unsubscribe a specific callback from an event. */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
  }

  /** Emit an event with optional data payload. */
  emit(event, data) {
    this._listeners.get(event)?.forEach(cb => {
      try { cb(data); } catch (e) { console.error(`[EventBus] Error in "${event}" handler:`, e); }
    });
  }

  /** Remove all listeners for an event. */
  clear(event) {
    if (event) this._listeners.delete(event);
    else this._listeners.clear();
  }
}

// Singleton instance shared across the entire application
export const eventBus = new EventBus();
