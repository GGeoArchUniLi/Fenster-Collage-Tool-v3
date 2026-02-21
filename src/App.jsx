import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [wall, setWall] = useState({ w: 4000, h: 3000 });
  const [windows, setWindows] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [seed, setSeed] = useState(42);
  const canvasRef = useRef(null);

  const SCALE = 800 / Math.max(wall.w, 1);
  const canvas_h = wall.h * SCALE;

  // Lädt Dummy/Startdaten
  useEffect(() => {
    fetch("/api/search?land=DE&plz=10115")
      .then(r => r.json())
      .then(d => {
        const initialWins = d.results.map((r, i) => ({
          ...r, pos_label: `P${i+1}`, x: 0, y: 0, is_pinned: false, rotated: false, visible: true
        }));
        setWindows(initialWins);
        triggerAI(initialWins);
      });
  }, []);

  const triggerAI = async (winsToProcess, forceSeed = seed) => {
    const visibleWins = winsToProcess.filter(w => w.visible);
    const req = {
      wall_w: wall.w, wall_h: wall.h, windows: visibleWins,
      symmetry: false, chaos: 10, seed: forceSeed, lock_pinned: true
    };
    const res = await fetch("/api/cluster", {
      method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(req)
    });
    const data = await res.json();
    
    // Positionen mergen
    const newWindows = winsToProcess.map(w => {
      const placed = data.windows.find(p => p.id === w.id);
      if (placed) return { ...w, x: placed.x, y: placed.y, w: placed.w, h: placed.h };
      return w;
    });
    setWindows(newWindows);
    setGaps(data.gaps);
  };

  const handleMouseDown = (e, id, is_pinned) => {
    if (is_pinned || e.target.tagName === 'BUTTON') return;
    setDraggingId(id);
  };

  const handleMouseMove = (e) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px_x = e.clientX - rect.left;
    const px_y = e.clientY - rect.top;
    
    let mm_x = Math.round(px_x / SCALE);
    let mm_y = Math.round((rect.height - px_y) / SCALE);

    setWindows(windows.map(w => w.id === draggingId ? { ...w, x: mm_x, y: mm_y } : w));
  };

  const handleMouseUp = () => {
    if (draggingId) {
      const updated = windows.map(w => w.id === draggingId ? { ...w, is_pinned: true } : w);
      setWindows(updated);
      setDraggingId(null);
      triggerAI(updated); // KI rechnet Gaps nach loslassen sofort neu!
    }
  };

  const togglePin = (id) => {
    const updated = windows.map(w => w.id === id ? { ...w, is_pinned: !w.is_pinned } : w);
    setWindows(updated);
    triggerAI(updated);
  };

  const totalPrice = windows.filter(w => w.visible).reduce((sum, w) => sum + w.price, 0);
  const winArea = windows.filter(w => w.visible).reduce((sum, w) => sum + (w.w * w.h), 0) / 1000000;
  const wallArea = (wall.w * wall.h) / 1000000;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{ width: "350px", background: "#fff", borderRight: "1px solid #ccc", padding: "20px", overflowY: "auto" }}>
        <h2>🧱 Facade AI (Pro)</h2>
        
        <h4>Wand Dimensionen (mm)</h4>
        <input type="number" value={wall.w} onChange={e => setWall({...wall, w: parseInt(e.target.value)})} style={{width: "100%", padding:"8px", marginBottom:"10px"}} />
        <input type="number" value={wall.h} onChange={e => setWall({...wall, h: parseInt(e.target.value)})} style={{width: "100%", padding:"8px", marginBottom:"20px"}} />
        
        <button 
          onClick={() => { const s = Math.random(); setSeed(s); triggerAI(windows, s); }} 
          style={{width: "100%", padding:"12px", background:"#0066cc", color:"white", border:"none", borderRadius:"4px", cursor:"pointer", fontWeight:"bold"}}>
          🎲 Neu Clustern (KI)
        </button>

        <div style={{marginTop: "20px", background:"#f0f2f6", padding:"15px", borderRadius:"8px"}}>
          <h4>📊 Live Kalkulation</h4>
          <p>Fläche Wand: <b>{wallArea.toFixed(2)} m²</b></p>
          <p>Fläche Fenster: <b>{winArea.toFixed(2)} m²</b></p>
          <h3>💶 {totalPrice.toFixed(2)} €</h3>
        </div>

        <h4 style={{marginTop:"30px"}}>📋 Matrix</h4>
        <table style={{width: "100%", fontSize:"12px", borderCollapse: "collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #ccc"}}>
            <th>👁️</th><th>📌</th><th>ID</th><th>X</th><th>Y</th>
          </tr></thead>
          <tbody>
            {windows.map(w => (
              <tr key={w.id} style={{background: w.is_pinned ? "#fff3cd" : "transparent", opacity: w.visible ? 1 : 0.4}}>
                <td><input type="checkbox" checked={w.visible} onChange={() => {
                  const u = windows.map(x => x.id === w.id ? {...x, visible: !x.visible} : x);
                  setWindows(u); triggerAI(u);
                }}/></td>
                <td><input type="checkbox" checked={w.is_pinned} onChange={() => togglePin(w.id)}/></td>
                <td><b>{w.pos_label}</b></td>
                <td><input type="number" value={w.x} style={{width:"50px"}} onChange={(e) => {
                  const u = windows.map(x => x.id === w.id ? {...x, x: parseInt(e.target.value)||0, is_pinned: true} : x);
                  setWindows(u); triggerAI(u);
                }}/></td>
                <td><input type="number" value={w.y} style={{width:"50px"}} onChange={(e) => {
                  const u = windows.map(x => x.id === w.id ? {...x, y: parseInt(e.target.value)||0, is_pinned: true} : x);
                  setWindows(u); triggerAI(u);
                }}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HAUPTBEREICH (CANVAS) */}
      <div style={{ flex: 1, padding: "40px", display: "flex", alignItems: "flex-end", justifyContent: "center", background: "#e9ecef" }}>
        
        {/* Die 1.78m Architektur-Figur */}
        <div style={{ 
          width: Math.max(30, 400 * SCALE), height: 1780 * SCALE, marginRight: "20px",
          background: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 280%22><circle cx=%2250%22 cy=%2225%22 r=%2215%22 fill=%22%23333%22/><path d=%22M 30 50 Q 50 40 70 50 L 85 130 L 70 130 L 65 70 L 60 130 L 65 260 L 45 260 L 50 140 L 45 140 L 40 260 L 20 260 L 25 130 L 20 70 L 15 130 Z%22 fill=%22%23333%22/></svg>') no-repeat bottom center/contain",
          opacity: 0.6 
        }} />

        {/* Die Wand (Interactive Area) */}
        <div 
          ref={canvasRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          style={{ 
            width: wall.w * SCALE, height: wall.h * SCALE, 
            border: "4px solid darkred", position: "relative",
            background: "repeating-linear-gradient(45deg, #ffcccc, #ffcccc 10px, #ffffff 10px, #ffffff 20px)",
            overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
        >
          {/* Zuschnitte Rendern */}
          {gaps.map(g => (
            <div key={g.id} style={{
              position: "absolute", left: g.x * SCALE, bottom: g.y * SCALE, 
              width: g.w * SCALE, height: g.h * SCALE,
              background: "rgba(255, 77, 77, 0.4)", border: "1px dashed darkred",
              pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px", color: "white"
            }}>
              {(g.w * g.h / 1000000) >= 0.4 ? `${(g.w * g.h / 1000000).toFixed(2)} m²` : ""}
            </div>
          ))}

          {/* Fenster Rendern */}
          {windows.filter(w => w.visible).map(w => (
            <div 
              key={w.id} onMouseDown={(e) => handleMouseDown(e, w.id, w.is_pinned)}
              style={{
                position: "absolute", left: w.x * SCALE, bottom: w.y * SCALE,
                width: w.w * SCALE, height: w.h * SCALE,
                background: w.color, border: w.is_pinned ? "4px solid #222" : "2px solid #555",
                cursor: w.is_pinned ? "not-allowed" : (draggingId === w.id ? "grabbing" : "grab"),
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                fontWeight: "bold", fontSize: "12px", zIndex: w.is_pinned ? 5 : 10,
                opacity: w.is_pinned ? 0.95 : 1
              }}
            >
              {/* Toolbar in Fenster (Rotieren & Pin) */}
              <div style={{position: "absolute", top: 2, right: 2, display: "flex", gap: "2px"}}>
                <button onClick={(e) => { e.stopPropagation(); const u = windows.map(x => x.id === w.id ? {...x, rotated: !x.rotated} : x); setWindows(u); triggerAI(u); }} style={{fontSize:"10px", cursor:"pointer"}}>🔄</button>
                <button onClick={(e) => { e.stopPropagation(); togglePin(w.id); }} style={{fontSize:"10px", cursor:"pointer"}}>{w.is_pinned ? "❌" : "📌"}</button>
              </div>
              <span style={{pointerEvents: "none", marginTop: "15px"}}>{w.pos_label}<br/>{w.w}x{w.h}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
