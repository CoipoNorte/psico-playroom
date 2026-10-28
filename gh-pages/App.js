import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomSelector from './components/RoomSelector';
import MultiplayerConnect from './components/MultiplayerConnect';
import PlayroomCanvas from './rooms/PlayroomCanvas';
import { multiplayer } from './multiplayer/peer';
import { saveSession } from './db/storage';
import './App.css';
const rooms = [
    { id: 'play', name: 'Sala de Juegos', icon: '🎮', color: '#FF6B6B', description: 'Juguetes interactivos' },
    { id: 'art', name: 'Sala de Arte', icon: '🎨', color: '#4ECDC4', description: 'Expresión creativa' },
    { id: 'puzzle', name: 'Sala de Puzzles', icon: '🧩', color: '#45B7D1', description: 'Desarrollo cognitivo' },
    { id: 'nature', name: 'Sala de Naturaleza', icon: '🌳', color: '#96CEB4', description: 'Calma y relajación' },
    { id: 'reading', name: 'Sala de Lectura', icon: '📚', color: '#FFEAA7', description: 'Cuentos y narrativas' },
];
function App() {
    const [currentRoom, setCurrentRoom] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}`);
    const handleRoomSelect = useCallback((roomId) => {
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
    const handleConnect = useCallback((code) => {
        multiplayer.joinRoom(code).then((success) => {
            if (success) {
                setIsConnected(true);
            }
        });
    }, []);
    const handleInteraction = useCallback((interaction) => {
        if (isConnected) {
            multiplayer.sendInteraction(interaction);
        }
    }, [isConnected]);
    return (_jsx("div", { className: "app", children: _jsx(AnimatePresence, { mode: "wait", children: !currentRoom ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -20 }, className: "lobby", children: [_jsx(RoomSelector, { rooms: rooms, onSelect: handleRoomSelect }), _jsx(MultiplayerConnect, { onConnect: handleConnect, onGenerateCode: handleGenerateCode })] }, "lobby")) : (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "room-view", children: [_jsx("button", { className: "back-btn", onClick: () => setCurrentRoom(null), children: "\u2190 Volver al lobby" }), _jsx("h2", { children: rooms.find(r => r.id === currentRoom)?.name }), _jsx(PlayroomCanvas, { roomId: currentRoom, onInteraction: handleInteraction })] }, "room")) }) }));
}
export default App;
