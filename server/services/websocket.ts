import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ClientConnection {
  ws: WebSocket;
  userId: number;
  projectId: number;
}

export class WeddingWebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection');

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'join_project':
        this.handleJoinProject(ws, message);
        break;
      case 'leave_project':
        this.handleLeaveProject(ws, message);
        break;
      case 'activity_update':
        this.broadcastToProject(message.projectId, message, ws);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleJoinProject(ws: WebSocket, message: any) {
    const { userId, projectId } = message;
    const clientId = this.generateClientId(ws);
    
    this.clients.set(clientId, {
      ws,
      userId,
      projectId
    });

    // Notify other clients in the project
    this.broadcastToProject(projectId, {
      type: 'user_joined',
      userId,
      timestamp: new Date().toISOString()
    }, ws);
  }

  private handleLeaveProject(ws: WebSocket, message: any) {
    const client = this.getClientByWebSocket(ws);
    if (client) {
      this.broadcastToProject(client.projectId, {
        type: 'user_left',
        userId: client.userId,
        timestamp: new Date().toISOString()
      }, ws);
    }
    this.removeClient(ws);
  }

  public broadcastToProject(projectId: number, message: any, excludeWs?: WebSocket) {
    const projectClients = Array.from(this.clients.values())
      .filter(client => client.projectId === projectId && client.ws !== excludeWs);

    projectClients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  public notifyTaskUpdate(projectId: number, task: any, action: string, userId: number) {
    this.broadcastToProject(projectId, {
      type: 'task_updated',
      task,
      action,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyGuestUpdate(projectId: number, guest: any, action: string, userId: number) {
    this.broadcastToProject(projectId, {
      type: 'guest_updated',
      guest,
      action,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyBudgetUpdate(projectId: number, budgetItem: any, action: string, userId: number) {
    this.broadcastToProject(projectId, {
      type: 'budget_updated',
      budgetItem,
      action,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyVendorUpdate(projectId: number, vendor: any, action: string, userId: number) {
    this.broadcastToProject(projectId, {
      type: 'vendor_updated',
      vendor,
      action,
      userId,
      timestamp: new Date().toISOString()
    });
  }

  public notifyActivity(projectId: number, activity: any) {
    this.broadcastToProject(projectId, {
      type: 'new_activity',
      activity,
      timestamp: new Date().toISOString()
    });
  }

  private generateClientId(ws: WebSocket): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientByWebSocket(ws: WebSocket): ClientConnection | undefined {
    return Array.from(this.clients.values()).find(client => client.ws === ws);
  }

  private removeClient(ws: WebSocket) {
    const entries = Array.from(this.clients.entries());
    const clientEntry = entries.find(([, client]) => client.ws === ws);
    if (clientEntry) {
      this.clients.delete(clientEntry[0]);
    }
  }
}

export let websocketService: WeddingWebSocketService;

export function initializeWebSocketService(server: Server) {
  websocketService = new WeddingWebSocketService(server);
  return websocketService;
}
