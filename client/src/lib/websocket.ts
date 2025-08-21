import { logInfo, logError, logWarn } from './logger';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        logInfo('WebSocket', 'Connected successfully');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          logError('WebSocket', 'Error parsing message', { error: error instanceof Error ? error.message : 'Unknown error' });
        }
      };

      this.ws.onclose = () => {
        logWarn('WebSocket', 'Connection closed');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        logError('WebSocket', 'Connection error', { error });
      };
    } catch (error) {
      logError('WebSocket', 'Failed to create connection', { error: error instanceof Error ? error.message : 'Unknown error' });
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logInfo('WebSocket', `Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      logError('WebSocket', 'Max reconnection attempts reached');
    }
  }

  private handleMessage(message: any) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => listener(message));
  }

  public send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      logWarn('WebSocket', 'WebSocket is not connected');
    }
  }

  public on(type: string, listener: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  public off(type: string, listener: Function) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  public joinProject(userId: number, projectId: number) {
    this.send({
      type: 'join_project',
      userId,
      projectId
    });
  }

  public leaveProject() {
    this.send({
      type: 'leave_project'
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketClient = new WebSocketClient();
