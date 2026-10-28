# 🧠 PSICO PLAYROOM

Simulación 2D de salas psicológicas interactivas para niños y adultos.

## 🎯 Características

- 🏠 **Salas 2D interactivas** - Juegos, arte, puzzles, naturaleza, lectura
- 👥 **Multiusuario** - Invita amigos con código de 6 dígitos
- 🔄 **Sincronización en tiempo real** - Interacciones compartidas
- 📊 **Informe psicológico** - Métricas y observaciones
- 💾 **Persistencia offline** - IndexedDB + localStorage
- 📱 **Responsive** - Mobile, tablet, desktop, TV

## 🚀 Inicio Rápido

### Desarrollo local:
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Despliegue a GitHub Pages:
```bash
npm run deploy
```

## 📁 Estructura del Proyecto

```
src/
├── components/     # Componentes React
├── rooms/          # Salas 2D (PixiJS)
├── multiplayer/    # WebRTC + PeerJS
├── db/             # IndexedDB + localStorage
├── activities/     # Juegos por etapas
├── reports/        # Informe psicológico
└── assets/         # Imágenes, sonidos
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run deploy` - Desplegar a GitHub Pages
- `npm run lint` - Linting

## 🌐 Demo

Visita: https://coiponorte.github.io/psico-playroom/

## 📝 Licencia

MIT License - Libre para uso personal y comercial.

---

Desarrollado con ❤️ para la salud mental y el bienestar.