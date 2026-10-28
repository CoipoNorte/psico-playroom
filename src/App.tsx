import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomSelector from './components/RoomSelector';
import MultiplayerConnect from './components/MultiplayerConnect';
import PlayroomCanvas from './rooms/PlayroomCanvas';
import { multiplayer } from './multiplayer/peer';
import { saveSession } from './db/storage';
import './App.css';

interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const rooms: Room[] = [
  { id: 'play', name: 'Sala de Juegos', icon: '🎮', color: '#FF6B6B', description: 'Juguetes interactivos' },
  { id: 'art', name: 'Sala de Arte', icon: '🎨', color: '#4ECDC4', description: 'Expresión creativa' },
  { id: 'puzzle', name: 'Sala de Puzzles', icon: '🧩', color: '#45B7D1', description: 'Desarrollo cognitivo' },
  { id: 'nature', name: 'Sala de Naturaleza', icon: '🌳', color: '#96CEB4', description: 'Calma y relajación' },
  { id: 'reading', name: 'Sala de Lectura', icon: '📚', color: '#FFEAA7', description: 'Cuentos y narrativas' },
];

function App() {
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);

  const handleRoomSelect = useCallback((roomId: string) => {
    setCurrentRoom(roomId);
    
    // Save session start
    saveSession({
      id: sessionId,
      roomCode: '',
      startTime: Date.now(),
      activities: [roomId],
      notes: '',
    });
  }, [sessionId]);

  const handleGenerateCode = useCallback(() => {
    multiplayer.createRoom().then(() => {
      setIsConnected(true);
    });
    return '';
  }, []);

  const handleConnect = useCallback((code: string) => {
    multiplayer.joinRoom(code).then((success) => {
      if (success) {
        setIsConnected(true);
      }
    });
  }, []);

  const handleInteraction = useCallback((interaction: any) => {
    if (isConnected) {
      multiplayer.sendInteraction(interaction);
    }
  }, [isConnected]);

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {!currentRoom ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lobby"
          >
            <RoomSelector rooms={rooms} onSelect={handleRoomSelect} />
            <MultiplayerConnect
              onConnect={handleConnect}
              onGenerateCode={handleGenerateCode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="room-view"
          >
            <button className="back-btn" onClick={() => setCurrentRoom(null)}>
              ← Volver al lobby
            </button>
            <h2>{rooms.find(r => r.id === currentRoom)?.name}</h2>
            <PlayroomCanvas roomId={currentRoom} onInteraction={handleInteraction} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;