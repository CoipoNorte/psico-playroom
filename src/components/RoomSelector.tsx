import React from 'react';
import { motion } from 'framer-motion';

interface Room {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface RoomSelectorProps {
  rooms: Room[];
  onSelect: (roomId: string) => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({ rooms, onSelect }) => {
  return (
    <div className="room-selector">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="title"
      >
        🧠 PSICO PLAYROOM
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="subtitle"
      >
        Simulación 2D de salas psicológicas interactivas
      </motion.p>

      <div className="room-grid">
        {rooms.map((room, index) => (
          <motion.button
            key={room.id}
            className="room-card"
            style={{ backgroundColor: room.color }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(room.id)}
          >
            <span className="room-icon">{room.icon}</span>
            <h3>{room.name}</h3>
            <p>{room.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;