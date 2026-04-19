import React, { useEffect, useRef, useState } from "react";
import { socket } from "../../lib/socket";

type CanvasProps = {
  roomId: string;
  currentDrawerId: string | null;
  playerId: string;
  drawWord: string | null;
  wordLength: number;
};

function Canvas({ roomId, currentDrawerId, playerId, drawWord, wordLength }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);


  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);

  const lastPointRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isDrawer = playerId === currentDrawerId;

  const displayWord = isDrawer
    ? drawWord
    : "_ ".repeat(wordLength).trim();

  // 🎯 Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctxRef.current = ctx;
  }, []);

  // 🎯 Draw function
  const draw = (
    x: number,
    y: number,
    prevX: number,
    prevY: number,
    strokeColor: string,
    size: number
  ) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = size;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // 🎯 Get position (mouse + touch)
  const getPosition = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // 🎯 Start drawing
  const handleStart = (e: any) => {
    if (!isDrawer) return;

    setDrawing(true);

    const { x, y } = getPosition(e);
    lastPointRef.current = { x, y, prevX: x, prevY: y };
  };

  // 🎯 Stop drawing
  const handleEnd = () => {
    setDrawing(false);
  };

  // 🎯 Move (THROTTLED)
  const handleMove = (e: any) => {
    if (!drawing || !isDrawer) return;

    e.preventDefault();

    const { x, y } = getPosition(e);

    const prev = lastPointRef.current;
    if (!prev) return;

    const point = {
      x,
      y,
      prevX: prev.x,
      prevY: prev.y
    };

    lastPointRef.current = point;

    if (animationFrameRef.current) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      draw(point.x, point.y, point.prevX, point.prevY, color, brushSize);

      socket.emit("draw", {
        roomId,
        ...point,
        color,
        size: brushSize
      });

      animationFrameRef.current = null;
    });
  };

  // 🎯 Clear canvas (local + broadcast)
  const clearCanvas = () => {
    if (!isDrawer) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    socket.emit("clear-canvas", { roomId });
  };

  // 🎯 Listen draw
  useEffect(() => {
    const handler = (data: any) => {
      draw(
        data.x,
        data.y,
        data.prevX,
        data.prevY,
        data.color,
        data.size
      );
    };

    socket.on("draw", handler);

    return () => {
      socket.off("draw", handler);
    };
  }, []);

  // 🎯 Listen clear
  useEffect(() => {
    const handler = () => {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on("clear-canvas", handler);

    return () => {
      socket.off("clear-canvas", handler);
    };
  }, []);

  // 🎯 Stop drawing on new round
  useEffect(() => {
    const handler = () => setDrawing(false);

    socket.on("round-start", handler);

    return () => {
      socket.off("round-start", handler);
    };
  }, []);

  return (
    <div className="flex flex-col w-full lg:w-2/5 h-screen sm:h-[75vh] lg:h-full bg-violet-100 rounded-2xl p-3 sm:p-4 border-2 border-black shadow-lg">

      {/* Canvas */}
      <div className="flex-1 bg-white rounded-xl border-2 border-black shadow-inner relative overflow-hidden">

        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-violet-500 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-black shadow-md">
           {displayWord || "Drawing Board"}
        </div>

        <canvas
          ref={canvasRef}
          style={{ touchAction: "none" }}
          className={`w-full h-full rounded-xl ${isDrawer ? "cursor-crosshair" : "cursor-not-allowed opacity-70"
            }`}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseMove={handleMove}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onTouchMove={handleMove}
        />
      </div>

      {/* Toolbar */}
      <div className="mt-4 bg-white rounded-xl border-2 border-black p-3 shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">

        {/* Colors */}
        <div className="flex flex-wrap gap-3">
          {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#facc15", "#a855f7"].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-8 h-8 rounded-full border-2 border-black ${color === c ? "ring-2 ring-black scale-110" : ""
                }`}
            />
          ))}
        </div>

        {/* Brush */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Brush</span>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
        </div>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          disabled={!isDrawer}
          className="px-4 py-2 rounded-full border-2 border-black bg-violet-500 text-white font-semibold disabled:opacity-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Canvas;