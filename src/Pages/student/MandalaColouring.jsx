import React, { useRef, useEffect, useState } from "react";
import Student_sidebar from "../../Components/sidebar/Student_sidebar";

const MandalaColouring = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [brushSize, setBrushSize] = useState(3);
  const [activeTool, setActiveTool] = useState("brush");
  const [completedSections, setCompletedSections] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // 🎨 Extended Color Palette with gradient options
  const colorPalettes = {
    rainbow: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"],
    pastel: ["#FECACA", "#FDE68A", "#A7F3D0", "#BFDBFE", "#DDD6FE", "#FBCFE8"],
    earth: ["#78350F", "#065F46", "#1E40AF", "#6B7280", "#F59E0B", "#DC2626"],
    cool: ["#06B6D4", "#8B5CF6", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"]
  };

  const [activePalette, setActivePalette] = useState("rainbow");

  // ⏱️ Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const setSize = () => {
      const size = Math.min(window.innerWidth * 0.8, 600);
      canvas.width = size;
      canvas.height = size;
      contextRef.current = ctx;
      drawMandalaBase();
    };

    setSize();
    window.addEventListener("resize", setSize);

    return () => window.removeEventListener("resize", setSize);
  }, []);

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

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getCoordinates(e, rect);

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    contextRef.current.strokeStyle = selectedColor;
    contextRef.current.lineWidth = brushSize;
    contextRef.current.lineCap = "round";
    contextRef.current.lineJoin = "round";

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const { x, y } = getCoordinates(e, rect);

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
    checkCompletion();
  };

  const checkCompletion = () => {
    // Simple completion checker - in real app, implement more sophisticated logic
    setCompletedSections(prev => Math.min(prev + 1, 36));
    if (completedSections >= 35) {
      setShowCompletion(true);
    }
  };

  const drawMandalaBase = () => {
    const ctx = contextRef.current;
    if (!ctx) return;

    const { width, height } = canvasRef.current;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#F9FAFB";

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, width / 2 - 10, 0, Math.PI * 2);
    ctx.fill();

    // Decorative circles
    for (let r = 40; r < width / 2; r += 40) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial lines with decorative patterns
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI) / 18;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * (width / 2 - 10),
        centerY + Math.sin(angle) * (height / 2 - 10)
      );
      ctx.stroke();

      // Add small decorative circles at intersections
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(
          centerX + Math.cos(angle) * (width / 4),
          centerY + Math.sin(angle) * (height / 4),
          3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#D1D5DB";
        ctx.fill();
      }
    }
  };

  const resetCanvas = () => {
    setCompletedSections(0);
    setShowCompletion(false);
    setTimeSpent(0);
    drawMandalaBase();
  };

  const saveArtwork = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `mandala-art-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-blue-50">
      {/* Sidebar */}
      <Student_sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="text-left mb-5">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
            Mandala Coloring Therapy
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
            <div className="text-sm text-gray-500">Time Spent</div>
          </div>
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedSections}/36</div>
            <div className="text-sm text-gray-500">Sections Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round((completedSections / 36) * 100)}%</div>
            <div className="text-sm text-gray-500">Progress</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto w-full">
          
          {/* Left Panel - Tools */}
          <div className="lg:w-[430px] bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 Coloring Tools</h2>
            
            {/* Color Palettes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Color Themes</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(colorPalettes).map(([name, ]) => (
                  <button
                    key={name}
                    onClick={() => setActivePalette(name)}
                    className={`p-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      activePalette === name 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {colorPalettes[activePalette].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedColor === color
                        ? "border-gray-800 scale-110 shadow-lg"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Brush Size: {brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Tools */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Tools</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTool("brush")}
                  className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                    activeTool === "brush" 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <span className="text-lg">🖌️</span>
                  <span className="text-xs mt-1">Brush</span>
                </button>
                <button
                  onClick={() => setActiveTool("fill")}
                  className={`p-3 rounded-xl flex flex-col items-center transition-all ${
                    activeTool === "fill" 
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                  }`}
                >
                  <span className="text-lg">🎨</span>
                  <span className="text-xs mt-1">Fill</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={resetCanvas}
                className="w-full bg-red-400 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                Reset Canvas
              </button>
              <button
                onClick={saveArtwork}
                className="w-full bg-sky-400 text-white py-3 rounded-xl font-semibold hover:bg-sky-500 transition-colors flex items-center justify-center gap-2"
              >
                Save Artwork
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="border-4 border-white rounded-2xl shadow-2xl bg-white cursor-crosshair"
                style={{
                  cursor: `url("data:image/svg+xml;utf8,
                    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32'>
                      <circle cx='16' cy='16' r='${brushSize}' fill='${encodeURIComponent(selectedColor)}' stroke='black' stroke-width='1'/>
                    </svg>
                  ") 16 16, crosshair`,
                }}
              />
              
              {/* Completion Overlay */}
              {showCompletion && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl text-center max-w-sm">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Amazing Work!</h3>
                    <p className="text-gray-600 mb-4">You've completed your mandala masterpiece!</p>
                    <button
                      onClick={() => setShowCompletion(false)}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Continue Coloring
                    </button>
                  </div>
                </div>
              )}
            </div>

         
          </div>
        </div>

     
      </div>

      {/* Custom CSS for slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${selectedColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: ${selectedColor};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default MandalaColouring;