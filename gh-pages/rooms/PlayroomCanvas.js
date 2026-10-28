import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
export const PlayroomCanvas = ({ roomId, onInteraction }) => {
    const canvasRef = useRef(null);
    useEffect(() => {
        if (!canvasRef.current)
            return;
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1a1a2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });
        canvasRef.current.appendChild(app.view);
        const room = new PIXI.Container();
        app.stage.addChild(room);
        const bg = new PIXI.Graphics();
        bg.beginFill(0x2a2a4e);
        bg.drawRect(0, 0, app.screen.width, app.screen.height);
        bg.endFill();
        bg.alpha = 0.5;
        room.addChild(bg);
        const toys = [
            { id: 'block1', x: 200, y: 200, color: 0xff6b6b, size: 60 },
            { id: 'block2', x: 400, y: 300, color: 0x4ecdc4, size: 80 },
            { id: 'ball', x: 600, y: 250, color: 0xffe66d, size: 50 },
            { id: 'puzzle', x: 300, y: 500, color: 0x95e1d3, size: 70 },
        ];
        toys.forEach((toy) => {
            const graphics = new PIXI.Graphics();
            graphics.beginFill(toy.color);
            graphics.drawCircle(0, 0, toy.size / 2);
            graphics.endFill();
            graphics.x = toy.x;
            graphics.y = toy.y;
            graphics.eventMode = 'static';
            graphics.cursor = 'pointer';
            graphics.on('pointerover', () => {
                graphics.scale.set(1.2);
            });
            graphics.on('pointerout', () => {
                graphics.scale.set(1);
            });
            graphics.on('pointerdown', () => {
                graphics.tint = 0xffffff;
                setTimeout(() => {
                    graphics.tint = 0xffffff;
                }, 200);
                onInteraction?.({
                    type: 'toy_click',
                    toyId: toy.id,
                    timestamp: Date.now(),
                });
            });
            room.addChild(graphics);
        });
        const handleResize = () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            bg.width = app.screen.width;
            bg.height = app.screen.height;
        };
        window.addEventListener('resize', handleResize);
        app.ticker.add(() => {
            room.children.forEach((child, index) => {
                if (child instanceof PIXI.Graphics) {
                    child.y += Math.sin(Date.now() * 0.001 + index) * 0.5;
                }
            });
        });
        return () => {
            window.removeEventListener('resize', handleResize);
            app.destroy(true, { children: true, texture: true, baseTexture: true });
        };
    }, [roomId, onInteraction]);
    return (_jsx("div", { ref: canvasRef, style: {
            width: '100%',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 0,
        } }));
};
export default PlayroomCanvas;
