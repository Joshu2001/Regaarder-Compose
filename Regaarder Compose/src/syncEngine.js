import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

class OfflineSyncEngine {
  constructor(roomName = 'regaarder-sheets-room') {
    this.roomName = roomName;
    this.doc = new Y.Doc();
    this.indexeddbProvider = null;
    this.wsProvider = null;
    this.statusListeners = new Set();
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    this.init();
  }

  init() {
    // 1. Local Persistence (IndexedDB) for robust offline storage
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      try {
        this.indexeddbProvider = new IndexeddbPersistence(this.roomName, this.doc);
        this.indexeddbProvider.on('synced', () => {
          this.notifyStatus('synced-local');
        });
      } catch (err) {
        console.warn('IndexedDB persistence error:', err);
      }
    }

    // 2. Real-time WebSocket Provider for Multi-user Sync
    const wsUrl = typeof window !== 'undefined' && window.location ? (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + '/yjs' : 'ws://localhost:1234';
    try {
      this.wsProvider = new WebsocketProvider(wsUrl, this.roomName, this.doc, {
        connect: true,
      });

      this.wsProvider.on('status', (event) => {
        if (event.status === 'connected') {
          this.notifyStatus('connected');
        } else {
          this.notifyStatus('offline');
        }
      });
    } catch (err) {
      console.warn('WebSocket sync error:', err);
    }

    // 3. Browser Network Event Handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        if (this.wsProvider && !this.wsProvider.shouldConnect) {
          this.wsProvider.connect();
        }
        this.notifyStatus(this.wsProvider?.wsconnected ? 'connected' : 'syncing');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyStatus('offline');
      });
    }
  }

  getMap(name) {
    return this.doc.getMap(name);
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  notifyStatus(status) {
    this.statusListeners.forEach((cb) => cb({ status, isOnline: this.isOnline }));
  }

  destroy() {
    if (this.indexeddbProvider) this.indexeddbProvider.destroy();
    if (this.wsProvider) this.wsProvider.destroy();
    this.doc.destroy();
  }
}

export const syncEngine = new OfflineSyncEngine();
