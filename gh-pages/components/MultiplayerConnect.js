import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
export const MultiplayerConnect = ({ onConnect, onGenerateCode }) => {
    const [code, setCode] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const handleGenerate = () => {
        const newCode = onGenerateCode();
        setGeneratedCode(newCode);
    };
    return (_jsxs(motion.div, { className: "multiplayer-section", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 }, children: [_jsx("h2", { children: "\uD83D\uDC65 Modo Multiusuario" }), _jsxs("div", { className: "code-input", children: [_jsx("input", { type: "text", placeholder: "C\u00F3digo de 6 d\u00EDgitos", maxLength: 6, value: code, onChange: (e) => setCode(e.target.value.replace(/\D/g, '')) }), _jsx("button", { onClick: () => onConnect(code), disabled: code.length !== 6, children: "Conectar" })] }), _jsx("button", { onClick: handleGenerate, className: "generate-btn", children: "\uD83C\uDFB2 Generar c\u00F3digo de sala" }), generatedCode && (_jsxs(motion.p, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "code-display", children: ["C\u00F3digo: ", _jsx("strong", { children: generatedCode })] }))] }));
};
export default MultiplayerConnect;
