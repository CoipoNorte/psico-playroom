import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MultiplayerConnectProps {
  onConnect: (code: string) => void;
  onGenerateCode: () => string;
}

export const MultiplayerConnect: React.FC<MultiplayerConnectProps> = ({ onConnect, onGenerateCode }) => {
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerate = () => {
    const newCode = onGenerateCode();
    setGeneratedCode(newCode);
  };

  return (
    <motion.div
      className="multiplayer-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h2>👥 Modo Multiusuario</h2>
      
      <div className="code-input">
        <input
          type="text"
          placeholder="Código de 6 dígitos"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />
        <button onClick={() => onConnect(code)} disabled={code.length !== 6}>
          Conectar
        </button>
      </div>

      <button onClick={handleGenerate} className="generate-btn">
        🎲 Generar código de sala
      </button>

      {generatedCode && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="code-display"
        >
          Código: <strong>{generatedCode}</strong>
        </motion.p>
      )}
    </motion.div>
  );
};

export default MultiplayerConnect;