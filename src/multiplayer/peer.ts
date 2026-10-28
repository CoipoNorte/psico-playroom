// WebRTC Multiplayer with PeerJS for PSICO PLAYROOM

import Peer, { DataConnection } from 'peerjs';

export interface PeerMessage {
  type: 'interaction' | 'chat' | 'sync' | 'join' | 'leave';
  data: any;
  timestamp: number;
}

export class MultiplayerManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private roomCode: string = '';
  private isHost: boolean = false;
  private onMessageCallback: ((msg: PeerMessage) => void) | null = null;
  private onConnectionCallback: ((peerId: string) => void) | null = null;
  private onDisconnectionCallback: ((peerId: string) => void) | null = null;

  constructor() {
    this.peer = new Peer({
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      debug: 0,
    });

    this.peer.on('open', (id) => {
      console.log('Peer connected with ID:', id);
    });

    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      console.log('Connection opened with:', conn.peer);
      this.connections.set(conn.peer, conn);
      this.onConnectionCallback?.(conn.peer);
      
      // Send join message
      this.sendToPeer(conn.peer, {
        type: 'join',
        data: { peerId: this.peer?.id },
        timestamp: Date.now(),
      });
    });

    conn.on('data', (data) => {
      const msg = data as PeerMessage;
      this.onMessageCallback?.(msg);
    });

    conn.on('close', () => {
      console.log('Connection closed with:', conn.peer);
      this.connections.delete(conn.peer);
      this.onDisconnectionCallback?.(conn.peer);
    });
  }

  async createRoom(): Promise<string> {
    this.isHost = true;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.roomCode = code;
    
    // Register room code as peer ID
    // In a real implementation, you'd use a signaling server
    // For now, we'll use the peer ID as the room code
    
    return code;
  }

  async joinRoom(code: string): Promise<boolean> {
    this.isHost = false;
    this.roomCode = code;
    
    try {
      const conn = this.peer!.connect(code);
      this.handleConnection(conn);
      return true;
    } catch (error) {
      console.error('Failed to join room:', error);
      return false;
    }
  }

  sendInteraction(interaction: any) {
    const msg: PeerMessage = {
      type: 'interaction',
      data: interaction,
      timestamp: Date.now(),
    };
    
    this.broadcast(msg);
  }

  sendChat(message: string) {
    const msg: PeerMessage = {
      type: 'chat',
      data: { message },
      timestamp: Date.now(),
    };
    
    this.broadcast(msg);
  }

  private broadcast(msg: PeerMessage) {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(msg);
      }
    });
  }

  private sendToPeer(peerId: string, msg: PeerMessage) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(msg);
    }
  }

  onMessage(callback: (msg: PeerMessage) => void) {
    this.onMessageCallback = callback;
  }

  onConnection(callback: (peerId: string) => void) {
    this.onConnectionCallback = callback;
  }

  onDisconnection(callback: (peerId: string) => void) {
    this.onDisconnectionCallback = callback;
  }

  getRoomCode(): string {
    return this.roomCode;
  }

  isHostUser(): boolean {
    return this.isHost;
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  destroy() {
    this.connections.forEach((conn) => conn.close());
    this.peer?.destroy();
  }
}

export const multiplayer = new MultiplayerManager();