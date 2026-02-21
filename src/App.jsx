import React, { useState, useRef, useEffect } from 'react';

// --- SPRACH-WÖRTERBUCH ---
const LANG_DICT = {
  "🇩🇪 DE": {
    title: "🧱 Patchwork Facade AI", wall_header: "Wand Dimensionen (mm)", width: "Breite", height: "Höhe",
    shuffle_btn: "🎲 Neu clustern (KI)", opt_gaps_btn: "✂️ Zuschnitts-Richtung wechseln",
    wall_area: "Wandfläche", win_area: "Fensterfläche", fill_rate: "Füllgrad", price_total: "Gesamtpreis",
    matrix_header: "📋 Fenster-Steuerung", col_vis: "👁️", col_pin: "📌", col_id: "ID", col_x: "X", col_y: "Y"
  },
  "🇪🇸 ES": {
    title: "🧱 Generador de Fachadas", wall_header: "Dimensiones del muro (mm)", width: "Ancho", height: "Alto",
    shuffle_btn: "🎲 Reagrupar (IA)", opt_gaps_btn: "✂️ Cambiar dirección de corte",
    wall_area: "Área Muro", win_area: "Área Ventanas", fill_rate: "Relleno", price_total: "Precio Total",
    matrix_header: "📋 Control de ventanas", col_vis: "👁️", col_pin: "📌", col_id: "ID", col_x: "X", col_y: "Y"
  },
  "🇬🇧 EN": {
    title: "🧱 Facade Generator AI", wall_header: "Wall Dimensions (mm)", width: "Width", height: "Height",
    shuffle_btn: "🎲 Shuffle (AI)", opt_gaps_btn: "✂️ Toggle Fillers",
    wall_area: "Wall Area", win_area: "Window Area", fill_rate: "Fill Rate", price_total: "Total Price",
    matrix_header: "📋 Window Control", col_vis: "👁️", col_pin: "📌", col_id: "ID", col_x: "X", col_y: "Y"
  }
};

export default function App() {
  const [lang, setLang] = useState("🇩🇪 DE");
  const T = LANG_DICT[lang];

  const [wall, setWall] = useState({ w: 4000, h: 3000 });
  const [windows, setWindows] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const [seed, setSeed] = useState(42);
  const canvasRef = useRef(null);

  const SCALE = 800 / Math.max(wall.w, 1);
  const canvas_h = wall.h * SCALE;

  useEffect(() => {
    // Startdaten laden
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
    try {
      const res = await fetch("/api/cluster", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(req)
      });
      const data = await res.json();
      
      const newWindows = winsToProcess.map(w => {
        const placed = data.windows.find(p => p.id === w.id);
        if (placed) return { ...w, x: placed.x, y: placed.y, w: placed.w, h: placed.h };
        return w;
      });
      setWindows(newWindows);
      setGaps(data.gaps);
    } catch (e) { console.error(e); }
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
      triggerAI(updated); 
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
  const fillRate = wallArea > 0 ? (winArea / wallArea) * 100 : 0;

  return (
    <div style={styles.appContainer}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; background-color: #f0f2f6; margin: 0; color: #31333F; }
          .btn-primary { background: #FF4B4B; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.2s; width: 100%; margin-bottom: 10px; }
          .btn-primary:hover { background: #FF3333; box-shadow: 0 4px 12px rgba(255, 75, 75, 0.2); }
          .btn-secondary { background: white; color: #31333F; border: 1px solid #D6D6D8; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; transition: 0.2s; width: 100%; }
          .btn-secondary:hover { border-color: #FF4B4B; color: #FF4B4B; }
          .input-field { width: 100%; padding: 10px; border: 1px solid #D6D6D8; border-radius: 6px; box-sizing: border-box; font-family: 'Inter'; font-size: 14px; margin-top: 4px; }
          .input-field:focus { outline: none; border-color: #FF4B4B; box-shadow: 0 0 0 2px rgba(255, 75, 75, 0.2); }
          .metric-card { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); flex: 1; }
          .metric-title { font-size: 13px; color: #555; font-weight: 500; margin-bottom: 5px; }
          .metric-value { font-size: 24px; font-weight: 700; color: #31333F; margin: 0; }
          .table-container { background: white; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
          th { background: #F8F9FB; padding: 12px; font-weight: 600; color: #555; border-bottom: 1px solid #e0e0e0; }
          td { padding: 10px 12px; border-bottom: 1px solid #eee; vertical-align: middle; }
          tr:hover { background: #F8F9FB; }
          .win-icon-btn { background: rgba(255,255,255,0.9); border: 1px solid #ccc; border-radius: 4px; font-size: 12px; cursor: pointer; padding: 2px 6px; margin: 0 2px; transition: 0.1s; }
          .win-icon-btn:hover { background: white; border-color: #333; transform: scale(1.05); }
        `}
      </style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px"}}>
          <h2 style={{margin: 0, fontSize: "18px", fontWeight: "700"}}>{T.title}</h2>
        </div>
        
        {/* Language Selector */}
        <div style={{display: "flex", gap: "5px", marginBottom: "25px"}}>
          {Object.keys(LANG_DICT).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{...styles.langBtn, background: lang === l ? "#FF4B4B" : "#eee", color: lang === l ? "white" : "#333"}}>
              {l.split(" ")[0]}
            </button>
          ))}
        </div>

        <div style={{marginBottom: "25px"}}>
          <h4 style={{margin: "0 0 10px 0", fontSize: "14px"}}>{T.wall_header}</h4>
          <div style={{display: "flex", gap: "10px"}}>
            <div>
              <label style={styles.label}>{T.width}</label>
              <input type="number" className="input-field" value={wall.w} onChange={e => setWall({...wall, w: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label style={styles.label}>{T.height}</label>
              <input type="number" className="input-field" value={wall.h} onChange={e => setWall({...wall, h: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>

        <button className="btn-primary" onClick={() => { const s = Math.random(); setSeed(s); triggerAI(windows, s); }}>
          {T.shuffle_btn}
        </button>
        <button className="btn-secondary" onClick={() => triggerAI(windows)}>
          {T.opt_gaps_btn}
        </button>

        <h4 style={{marginTop:"30px", marginBottom: "10px", fontSize: "14px"}}>{T.matrix_header}</h4>
        <div className="table-container">
          <table>
            <thead><tr>
              <th width="10%">{T.col_vis}</th><th width="10%">{T.col_pin}</th><th>{T.col_id}</th><th>{T.col_x}</th><th>{T.col_y}</th>
            </tr></thead>
            <tbody>
              {windows.map(w => (
                <tr key={w.id} style={{ opacity: w.visible ? 1 : 0.4, background: w.is_pinned ? "rgba(255, 235, 59, 0.15)" : "transparent" }}>
                  <td><input type="checkbox" checked={w.visible} onChange={() => { const u = windows.map(x => x.id === w.id ? {...x, visible: !x.visible} : x); setWindows(u); triggerAI(u); }} style={{cursor: "pointer"}}/></td>
                  <td><input type="checkbox" checked={w.is_pinned} onChange={() => togglePin(w.id)} style={{cursor: "pointer"}}/></td>
                  <td style={{fontWeight: "600"}}>{w.pos_label}</td>
                  <td><input type="number" value={w.x} className="input-field" style={{padding: "4px", marginTop: 0}} onChange={(e) => { const u = windows.map(x => x.id === w.id ? {...x, x: parseInt(e.target.value)||0, is_pinned: true} : x); setWindows(u); triggerAI(u); }}/></td>
                  <td><input type="number" value={w.y} className="input-field" style={{padding: "4px", marginTop: 0}} onChange={(e) => { const u = windows.map(x => x.id === w.id ? {...x, y: parseInt(e.target.value)||0, is_pinned: true} : x); setWindows(u); triggerAI(u); }}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HAUPTBEREICH */}
      <div style={styles.mainArea}>
        
        {/* DASHBOARD METRICS */}
        <div style={styles.dashboard}>
          <div className="metric-card">
            <div className="metric-title">{T.wall_area}</div>
            <div className="metric-value">{wallArea.toFixed(2)} m²</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">{T.win_area}</div>
            <div className="metric-value">{winArea.toFixed(2)} m²</div>
          </div>
          <div className="metric-card">
            <div className="metric-title">{T.fill_rate}</div>
            <div className="metric-value">{fillRate.toFixed(1)} %</div>
          </div>
          <div className="metric-card" style={{borderLeft: "4px solid #FF4B4B"}}>
            <div className="metric-title">{T.price_total}</div>
            <div className="metric-value">{totalPrice.toFixed(2)} €</div>
          </div>
        </div>

        {/* CANVAS WORKSPACE */}
        <div style={styles.canvasWrapper}>
          
          {/* ARCHITEKTUR FIGUR */}
          <div style={{ 
            width: Math.max(30, 400 * SCALE), height: 1780 * SCALE, marginRight: "15px",
            background: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 280%22><circle cx=%2250%22 cy=%2225%22 r=%2215%22 fill=%22%23333%22/><path d=%22M 30 50 Q 50 40 70 50 L 85 130 L 70 130 L 65 70 L 60 130 L 65 260 L 45 260 L 50 140 L 45 140 L 40 260 L 20 260 L 25 130 L 20 70 L 15 130 Z%22 fill=%22%23333%22/></svg>') no-repeat bottom center/contain",
            opacity: 0.6 
          }} />

          {/* DIE WAND */}
          <div 
            ref={canvasRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            style={{ 
              width: wall.w * SCALE, height: canvas_h, 
              border: "4px solid #31333F", position: "relative",
              background: "repeating-linear-gradient(45deg, #fce4e4, #fce4e4 10px, #ffffff 10px, #ffffff 20px)",
              overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", borderRadius: "2px"
            }}
          >
            {/* ZUSCHNITTE (GAPS) */}
            {gaps.map(g => (
              <div key={g.id} style={{
                position: "absolute", left: g.x * SCALE, bottom: g.y * SCALE, 
                width: g.w * SCALE, height: g.h * SCALE,
                background: "rgba(255, 75, 75, 0.4)", border: "1px dashed #FF4B4B",
                pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center", 
                fontSize: "10px", color: "white", textShadow: "0px 1px 2px rgba(0,0,0,0.8)", fontWeight: "600"
              }}>
                {(g.w * g.h / 1000000) >= 0.4 ? `${(g.w * g.h / 1000000).toFixed(2)} m²` : ""}
              </div>
            ))}

            {/* FENSTER */}
            {windows.filter(w => w.visible).map(w => (
              <div 
                key={w.id} onMouseDown={(e) => handleMouseDown(e, w.id, w.is_pinned)}
                style={{
                  position: "absolute", left: w.x * SCALE, bottom: w.y * SCALE,
                  width: w.w * SCALE, height: w.h * SCALE,
                  background: w.color, 
                  border: w.is_pinned ? "3px solid #31333F" : "2px solid #555",
                  boxShadow: w.is_pinned ? "none" : "0 4px 10px rgba(0,0,0,0.3)",
                  cursor: w.is_pinned ? "not-allowed" : (draggingId === w.id ? "grabbing" : "grab"),
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                  fontWeight: "700", fontSize: "12px", zIndex: w.is_pinned ? 5 : 10,
                  color: "#222", opacity: w.is_pinned ? 0.95 : 1, transition: draggingId === w.id ? "none" : "all 0.1s"
                }}
              >
                {/* TOOLBAR IM FENSTER */}
                <div style={{position: "absolute", top: 4, right: 4, display: "flex"}}>
                  <button className="win-icon-btn" onClick={(e) => { e.stopPropagation(); const u = windows.map(x => x.id === w.id ? {...x, rotated: !x.rotated} : x); setWindows(u); triggerAI(u); }}>🔄</button>
                  <button className="win-icon-btn" onClick={(e) => { e.stopPropagation(); togglePin(w.id); }}>{w.is_pinned ? "❌" : "📌"}</button>
                </div>
                <span style={{pointerEvents: "none", marginTop: "15px", textAlign: "center", lineHeight: "1.2"}}>
                  {w.is_pinned && "📌 "}{w.pos_label}<br/>
                  <span style={{fontSize: "10px", fontWeight: "500"}}>{w.w}x{w.h}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- CSS IN JS STYLES ---
const styles = {
  appContainer: { display: "flex", height: "100vh", overflow: "hidden" },
  sidebar: { width: "380px", background: "#ffffff", borderRight: "1px solid #e0e0e0", padding: "25px", overflowY: "auto", boxShadow: "2px 0 10px rgba(0,0,0,0.02)", zIndex: 100 },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", background: "#F4F6F8", overflowY: "auto" },
  dashboard: { display: "flex", gap: "15px", padding: "25px", background: "white", borderBottom: "1px solid #e0e0e0", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" },
  canvasWrapper: { flex: 1, padding: "40px", display: "flex", alignItems: "flex-end", justifyContent: "center" },
  label: { fontSize: "12px", fontWeight: "600", color: "#555", display: "block" },
  langBtn: { border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: "600", transition: "0.2s" }
};
