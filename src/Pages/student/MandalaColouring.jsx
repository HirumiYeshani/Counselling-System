import React, { useRef, useEffect, useState } from "react";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const MandalaColouring = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  // 🎨 Colors for palette
  const colors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
    "#000000",
    "#FFFFFF",
  ];

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.7;
      canvas.width = size;
      canvas.height = size;
      contextRef.current = ctx;
      drawMandalaBase(); // redraw after resize
    };

    setSize();
    window.addEventListener("resize", setSize);

    return () => window.removeEventListener("resize", setSize);
  }, []);

  //  Utility: Get Coordinates (mouse & touch)
  const getCoordinates = (e, rect) => {
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // 🖌️ Start Drawing
  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getCoordinates(e, rect);

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = selectedColor;
    contextRef.current.lineWidth = 2;
    contextRef.current.lineCap = "round";

    setIsDrawing(true);
  };

  //  Continue Drawing
  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getCoordinates(e, rect);

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  //  Stop Drawing
  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  //  Draw Mandala Base Pattern
  const drawMandalaBase = () => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = "#D1D5DB";
    ctx.lineWidth = 1;

    // Circles
    for (let r = 50; r < width / 2; r += 50) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial Lines
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * (width / 2),
        centerY + Math.sin(angle) * (height / 2)
      );
      ctx.stroke();
    }
  };

  // ♻️ Reset Canvas
  const resetCanvas = () => {
    drawMandalaBase();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Sidebar */}
      <Student_sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          Mandala Coloring
        </h1>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="border-2 border-gray-300 rounded-lg shadow-lg bg-white"
            style={{
              cursor: `url("data:image/svg+xml;utf8,
                <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32' style='fill:${encodeURIComponent(
                  selectedColor
                )};stroke:black;stroke-width:1'>
                  <circle cx='16' cy='16' r='6'/>
                </svg>
              ") 16 16, auto`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-10 h-10 rounded-full border-2 ${
                selectedColor === color
                  ? "border-black scale-110"
                  : "border-gray-300"
              } transition transform`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            onClick={resetCanvas}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandalaColouring;
