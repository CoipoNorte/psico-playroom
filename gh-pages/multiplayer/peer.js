// WebRTC Multiplayer with PeerJS for PSICO PLAYROOM
import Peer from 'peerjs';
export class MultiplayerManager {
    constructor() {
        Object.defineProperty(this, "peer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "connections", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "roomCode", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ''
        });
        Object.defineProperty(this, "isHost", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "onMessageCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "onConnectionCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "onDisconnectionCallback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
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
    handleConnection(conn) {
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
            const msg = data;
            this.onMessageCallback?.(msg);
        });
        conn.on('close', () => {
            console.log('Connection closed with:', conn.peer);
            this.connections.delete(conn.peer);
            this.onDisconnectionCallback?.(conn.peer);
        });
    }
    async createRoom() {
        this.isHost = true;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.roomCode = code;
        // Register room code as peer ID
        // In a real implementation, you'd use a signaling server
        // For now, we'll use the peer ID as the room code
        return code;
    }
    async joinRoom(code) {
        this.isHost = false;
        this.roomCode = code;
        try {
            const conn = this.peer.connect(code);
            this.handleConnection(conn);
            return true;
        }
        catch (error) {
            console.error('Failed to join room:', error);
            return false;
        }
    }
    sendInteraction(interaction) {
        const msg = {
            type: 'interaction',
            data: interaction,
            timestamp: Date.now(),
        };
        this.broadcast(msg);
    }
    sendChat(message) {
        const msg = {
            type: 'chat',
            data: { message },
            timestamp: Date.now(),
        };
        this.broadcast(msg);
    }
    broadcast(msg) {
        this.connections.forEach((conn) => {
            if (conn.open) {
                conn.send(msg);
            }
        });
    }
    sendToPeer(peerId, msg) {
        const conn = this.connections.get(peerId);
        if (conn && conn.open) {
            conn.send(msg);
        }
    }
    onMessage(callback) {
        this.onMessageCallback = callback;
    }
    onConnection(callback) {
        this.onConnectionCallback = callback;
    }
    onDisconnection(callback) {
        this.onDisconnectionCallback = callback;
    }
    getRoomCode() {
        return this.roomCode;
    }
    isHostUser() {
        return this.isHost;
    }
    getConnectionCount() {
        return this.connections.size;
    }
    destroy() {
        this.connections.forEach((conn) => conn.close());
        this.peer?.destroy();
    }
}
export const multiplayer = new MultiplayerManager();
