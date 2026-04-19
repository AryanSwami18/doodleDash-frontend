import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const lastPointRef = useRef<{ x: number; y: number; prevX: number; prevY: number } | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isDrawer = playerId === currentDrawerId;
  const displayWord = isDrawer ? drawWord : "_ ".repeat(wordLength).trim();

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const nextWidth = container.clientWidth;
    const nextHeight = container.clientHeight;
    if (!nextWidth || !nextHeight) return;

    const previousSnapshot = document.createElement("canvas");
    previousSnapshot.width = canvas.width;
    previousSnapshot.height = canvas.height;

    const previousCtx = previousSnapshot.getContext("2d");
    if (previousCtx && canvas.width && canvas.height) {
      previousCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    if (previousSnapshot.width && previousSnapshot.height) {
      ctx.drawImage(previousSnapshot, 0, 0, nextWidth, nextHeight);
    }
  };

  useEffect(() => {
    resizeCanvas();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", resizeCanvas);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

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

  const getPosition = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ("touches" in event && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }

    if ("clientX" in event) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    return { x: 0, y: 0 };
  };

  const handleStart = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    setDrawing(true);
    const { x, y } = getPosition(event);
    lastPointRef.current = { x, y, prevX: x, prevY: y };
  };

  const handleEnd = () => {
    setDrawing(false);
    lastPointRef.current = null;
  };

  const handleMove = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDrawer) return;

    event.preventDefault();

    const { x, y } = getPosition(event);
    const prev = lastPointRef.current;
    if (!prev) return;

    const point = {
      x,
      y,
      prevX: prev.x,
      prevY: prev.y,
    };

    lastPointRef.current = point;

    if (animationFrameRef.current) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      draw(point.x, point.y, point.prevX, point.prevY, color, brushSize);

      socket.emit("draw", {
        roomId,
        ...point,
        color,
        size: brushSize,
      });

      animationFrameRef.current = null;
    });
  };

  const clearCanvas = () => {
    if (!isDrawer) return;

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear-canvas", { roomId });
  };

  useEffect(() => {
    const handler = (data: {
      x: number;
      y: number;
      prevX: number;
      prevY: number;
      color: string;
      size: number;
    }) => {
      draw(data.x, data.y, data.prevX, data.prevY, data.color, data.size);
    };

    socket.on("draw", handler);
    return () => {
      socket.off("draw", handler);
    };
  }, []);

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

  useEffect(() => {
    const handler = () => setDrawing(false);

    socket.on("round-start", handler);
    return () => {
      socket.off("round-start", handler);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-2xl border-2 border-black bg-violet-100 p-3 shadow-lg sm:p-4">
      <div
        ref={containerRef}
        className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl border-2 border-black bg-white shadow-inner sm:min-h-[320px]"
      >
        <div className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full border-2 border-black bg-violet-500 px-3 py-1 text-center text-xs font-bold text-white shadow-md">
          {displayWord || "Drawing Board"}
        </div>

        <canvas
          ref={canvasRef}
          style={{ touchAction: "none" }}
          className={`h-full w-full rounded-xl ${
            isDrawer ? "cursor-crosshair" : "cursor-not-allowed opacity-70"
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

      <div className="mt-4 flex flex-col gap-4 rounded-xl border-2 border-black bg-white p-3 shadow-md md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-wrap justify-center gap-3 md:w-auto md:justify-start">
          {["#000000", "#ef4444", "#3b82f6", "#22c55e", "#facc15", "#a855f7"].map((swatch) => (
            <button
              key={swatch}
              onClick={() => setColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-8 w-8 rounded-full border-2 border-black ${
                color === swatch ? "scale-110 ring-2 ring-black" : ""
              }`}
            />
          ))}
        </div>

        <div className="flex w-full items-center justify-center gap-2 md:w-auto">
          <span className="text-sm font-semibold">Brush</span>
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(event) => setBrushSize(Number(event.target.value))}
          />
        </div>

        <button
          onClick={clearCanvas}
          disabled={!isDrawer}
          className="w-full rounded-full border-2 border-black bg-violet-500 px-4 py-2 font-semibold text-white disabled:opacity-50 md:w-auto"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export default Canvas;
