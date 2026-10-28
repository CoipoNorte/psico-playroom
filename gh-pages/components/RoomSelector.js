import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
export const RoomSelector = ({ rooms, onSelect }) => {
    return (_jsxs("div", { className: "room-selector", children: [_jsx(motion.h1, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "title", children: "\uD83E\uDDE0 PSICO PLAYROOM" }), _jsx(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 }, className: "subtitle", children: "Simulaci\u00F3n 2D de salas psicol\u00F3gicas interactivas" }), _jsx("div", { className: "room-grid", children: rooms.map((room, index) => (_jsxs(motion.button, { className: "room-card", style: { backgroundColor: room.color }, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * index }, whileHover: { scale: 1.05, y: -5 }, whileTap: { scale: 0.95 }, onClick: () => onSelect(room.id), children: [_jsx("span", { className: "room-icon", children: room.icon }), _jsx("h3", { children: room.name }), _jsx("p", { children: room.description })] }, room.id))) })] }));
};
export default RoomSelector;
