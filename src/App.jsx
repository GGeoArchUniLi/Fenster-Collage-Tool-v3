import React, { useState, useRef, useEffect } from 'react';

// --- VOLLSTÄNDIGES WÖRTERBUCH (9 Sprachen) ---
const LANG_DICT = {
  "🇩🇪 DE": { title: "🧱 Facade Generator Pro", search_h: "1. Suche", c_land: "Land", c_zip: "PLZ", c_rad: "Radius", reuse: "Gebraucht", new: "Neu", btn_search: "Suchen", cust_h: "2. Eigenbestand", w_lbl: "Breite", h_lbl: "Höhe", btn_add: "Hinzufügen", wall_h: "Wandöffnung (mm)", btn_shuf: "🎲 Neu Clustern", btn_gaps: "✂️ Zuschnitte drehen", lock: "🔒 Pin behalten", sym: "📐 Symmetrie", chaos: "Chaos", wall_a: "Wandfläche", win_a: "Fensterfläche", fill: "Füllgrad", price: "Gesamtpreis", mat_h: "📋 Matrix", exp_btn: "📥 CSV Export", gaps_h: "🟥 Zuschnitte", no_gaps: "Keine Zuschnitte nötig!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Maße", a:"m²", src:"Herkunft", pr:"Preis", l:"Link"} },
  "🇬🇧 EN": { title: "🧱 Facade Generator Pro", search_h: "1. Search", c_land: "Country", c_zip: "ZIP", c_rad: "Radius", reuse: "Used", new: "New", btn_search: "Search", cust_h: "2. Custom Inventory", w_lbl: "Width", h_lbl: "Height", btn_add: "Add", wall_h: "Wall Opening (mm)", btn_shuf: "🎲 Shuffle", btn_gaps: "✂️ Toggle Gaps", lock: "🔒 Keep Pinned", sym: "📐 Symmetry", chaos: "Chaos", wall_a: "Wall Area", win_a: "Window Area", fill: "Fill Rate", price: "Total Price", mat_h: "📋 Matrix", exp_btn: "📥 CSV Export", gaps_h: "🟥 Gap Panels", no_gaps: "No gaps needed!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Dims", a:"m²", src:"Source", pr:"Price", l:"Link"} },
  "🇪🇸 ES": { title: "🧱 Generador de Fachadas", search_h: "1. Búsqueda", c_land: "País", c_zip: "C.P.", c_rad: "Radio", reuse: "Usado", new: "Nuevo", btn_search: "Buscar", cust_h: "2. Inventario Propio", w_lbl: "Ancho", h_lbl: "Alto", btn_add: "Añadir", wall_h: "Muro (mm)", btn_shuf: "🎲 Reagrupar", btn_gaps: "✂️ Rotar cortes", lock: "🔒 Bloquear Pines", sym: "📐 Simetría", chaos: "Caos", wall_a: "Área Muro", win_a: "Área Vent.", fill: "Relleno", price: "Precio Total", mat_h: "📋 Matriz", exp_btn: "📥 Exportar CSV", gaps_h: "🟥 Paneles de Relleno", no_gaps: "Sin huecos!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Dim", a:"m²", src:"Origen", pr:"Precio", l:"Link"} },
  "🇫🇷 FR": { title: "🧱 Générateur de Façade", search_h: "1. Recherche", c_land: "Pays", c_zip: "CP", c_rad: "Rayon", reuse: "Usagé", new: "Neuf", btn_search: "Chercher", cust_h: "2. Inventaire", w_lbl: "Largeur", h_lbl: "Hauteur", btn_add: "Ajouter", wall_h: "Mur (mm)", btn_shuf: "🎲 Mélanger", btn_gaps: "✂️ Alterner", lock: "🔒 Garder Pins", sym: "📐 Symétrie", chaos: "Chaos", wall_a: "Surface Mur", win_a: "Surface Fen.", fill: "Remplissage", price: "Prix", mat_h: "📋 Matrice", exp_btn: "📥 Exporter CSV", gaps_h: "🟥 Panneaux", no_gaps: "Pas de trous!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Dim", a:"m²", src:"Source", pr:"Prix", l:"Lien"} },
  "🇮🇹 IT": { title: "🧱 Generatore Facciate", search_h: "1. Ricerca", c_land: "Paese", c_zip: "CAP", c_rad: "Raggio", reuse: "Usato", new: "Nuovo", btn_search: "Cerca", cust_h: "2. Inventario", w_lbl: "Largh.", h_lbl: "Altezza", btn_add: "Aggiungi", wall_h: "Muro (mm)", btn_shuf: "🎲 Rimescola", btn_gaps: "✂️ Tagli", lock: "🔒 Mantieni Pin", sym: "📐 Simmetria", chaos: "Caos", wall_a: "Area Muro", win_a: "Area Fin.", fill: "Riempimento", price: "Prezzo", mat_h: "📋 Matrice", exp_btn: "📥 Export CSV", gaps_h: "🟥 Pannelli", no_gaps: "Perfetto!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Dim", a:"m²", src:"Fonte", pr:"Prezzo", l:"Link"} },
  "🇨🇭 RM": { title: "🧱 Generatur Façadas", search_h: "1. Tschertga", c_land: "Pajais", c_zip: "PLZ", c_rad: "Radius", reuse: "Duvrà", new: "Nov", btn_search: "Tschertgar", cust_h: "2. Inventari", w_lbl: "Ladezza", h_lbl: "Autezza", btn_add: "Agiuntar", wall_h: "Paraid (mm)", btn_shuf: "🎲 Maschadar", btn_gaps: "✂️ Panels", lock: "🔒 Fixar", sym: "📐 Simetria", chaos: "Caos", wall_a: "Paraid", win_a: "Fanestra", fill: "Emplenida", price: "Pretsch", mat_h: "📋 Matrix", exp_btn: "📥 Export CSV", gaps_h: "🟥 Panels", no_gaps: "Perfegt!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Dim", a:"m²", src:"Funtauna", pr:"Pretsch", l:"Link"} },
  "🇧🇬 BG": { title: "🧱 Генератор на фасади", search_h: "1. Търсене", c_land: "Държава", c_zip: "ПК", c_rad: "Радиус", reuse: "Стари", new: "Нови", btn_search: "Търси", cust_h: "2. Инвентар", w_lbl: "Ширина", h_lbl: "Височина", btn_add: "Добави", wall_h: "Стена (мм)", btn_shuf: "🎲 Разбъркай", btn_gaps: "✂️ Панели", lock: "🔒 Запази Пин", sym: "📐 Симетрия", chaos: "Хаос", wall_a: "Площ Стена", win_a: "Площ Проз.", fill: "Запълване", price: "Цена", mat_h: "📋 Матрица", exp_btn: "📥 CSV Експорт", gaps_h: "🟥 Панели", no_gaps: "Идеално!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"Разм", a:"m²", src:"Източник", pr:"Цена", l:"Линк"} },
  "🇮🇱 HE": { title: "🧱 מחולל חזיתות", search_h: "1. חיפוש", c_land: "מדינה", c_zip: "מיקוד", c_rad: "רדיוס", reuse: "ישן", new: "חדש", btn_search: "חפש", cust_h: "2. מלאי", w_lbl: "רוחב", h_lbl: "גובה", btn_add: "הוסף", wall_h: "קיר (מ״מ)", btn_shuf: "🎲 ערבב", btn_gaps: "✂️ פאנלים", lock: "🔒 נעל", sym: "📐 סימטריה", chaos: "כאוס", wall_a: "שטח קיר", win_a: "שטח חלונות", fill: "מילוי", price: "מחיר", mat_h: "📋 טבלה", exp_btn: "📥 ייצוא CSV", gaps_h: "🟥 פאנלים", no_gaps: "מושלם!", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"מידות", a:"m²", src:"מקור", pr:"מחיר", l:"לינק"} },
  "🇯🇵 JA": { title: "🧱 ファサードジェネレーター", search_h: "1. 検索", c_land: "国", c_zip: "郵便番号", c_rad: "半径", reuse: "中古", new: "新品", btn_search: "検索", cust_h: "2. 在庫", w_lbl: "幅", h_lbl: "高さ", btn_add: "追加", wall_h: "壁 (mm)", btn_shuf: "🎲 シャッフル", btn_gaps: "✂️ パネル切替", lock: "🔒 ピン固定", sym: "📐 対称", chaos: "カオス", wall_a: "壁面積", win_a: "窓面積", fill: "充填率", price: "価格", mat_h: "📋 マトリックス", exp_btn: "📥 CSV出力", gaps_h: "🟥 パネル", no_gaps: "完璧！", col: {v:"👁️", p:"📌", r:"🔄", f:"⭐", id:"ID", x:"X", y:"Y", dim:"寸法", a:"m²", src:"ソース", pr:"価格", l:"リンク"} }
};

export default function App() {
  const [lang, setLang] = useState("🇩🇪 DE");
  const T = LANG_DICT[lang];

  // Such-Status
  const [searchParams, setSearch] = useState({ land: "Deutschland", zip: "10115", radius: 50, reuse: true, new: false });
  const [customWin, setCustomWin] = useState({ w: 1000, h: 1200 });

  const [wall, setWall] = useState({ w: 4000, h: 3000 });
  const [windows, setWindows] = useState([]);
  const [gaps, setGaps] = useState([]);
  
  const [draggingId, setDraggingId] = useState(null);
  const [seed, setSeed] = useState(42);
  const [gapToggle, setGapToggle] = useState(false);
  const [lockPinned, setLockPinned] = useState(true);
  const [symmetry, setSymmetry] = useState(false);
  const [chaos, setChaos] = useState(10);
  
  const canvasRef = useRef(null);
  const SCALE = 800 / Math.max(wall.w, 1);
  const canvas_h = wall.h * SCALE;
  const [posCounter, setPosCounter] = useState(1);

  // API Call für Suche
  const performSearch = async () => {
    try {
      const q = new URLSearchParams(searchParams).toString();
      const res = await fetch(`/api/search?${q}`);
      const data = await res.json();
      
      let c = posCounter;
      const initialWins = data.results.map((r) => {
        const item = { ...r, pos_label: `P${c}`, x: 0, y: 0, is_pinned: false, rotated: false, visible: true, force: false };
        c++; return item;
      });
      setPosCounter(c);
      setWindows(initialWins);
      triggerAI(initialWins);
    } catch (e) { console.error(e); }
  };

  const addCustomWindow = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      pos_label: `P${posCounter}`,
      w: customWin.w, h: customWin.h, type: "Fenster", color: "#90EE90", price: 0, source: "Lager", link: "",
      x: 0, y: 0, is_pinned: false, rotated: false, visible: true, force: true
    };
    setPosCounter(posCounter + 1);
    const updated = [...windows, newItem];
    setWindows(updated);
    triggerAI(updated);
  };

  const triggerAI = async (winsToProcess, forceSeed = seed, forceGap = gapToggle) => {
    const req = {
      wall_w: wall.w, wall_h: wall.h, windows: winsToProcess,
      symmetry: symmetry, chaos: chaos, seed: forceSeed, lock_pinned: lockPinned, toggle_gaps: forceGap
    };
    try {
      const res = await fetch("/api/cluster", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(req)
      });
      const data = await res.json();
      
      const newWindows = winsToProcess.map(w => {
        const placed = data.windows.find(p => p.id === w.id);
        if (placed) return { ...w, x: placed.x, y: placed.y, w: placed.w, h: placed.h, rotated: placed.rotated };
        return w;
      });
      setWindows(newWindows);
      setGaps(data.gaps);
    } catch (e) { console.error(e); }
  };

  // Drag & Drop Handling
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
      setWindows(updated); setDraggingId(null); triggerAI(updated); 
    }
  };

  // Matrix Interaction
  const updateProp = (id, prop, val) => {
    const updated = windows.map(w => w.id === id ? { ...w, [prop]: val } : w);
    setWindows(updated); triggerAI(updated);
  };
  const handleCoordChange = (id, axis, val) => {
    const updated = windows.map(w => w.id === id ? { ...w, [axis]: val, is_pinned: true } : w);
    setWindows(updated); triggerAI(updated);
  }

  // CSV Export
  const downloadCSV = () => {
    let rows = [ ["ID", "Typ", "Breite", "Hoehe", "m2", "Preis", "Herkunft"] ];
    windows.filter(w=>w.visible).forEach(w => rows.push([w.pos_label, w.type, w.w, w.h, ((w.w*w.h)/1000000).toFixed(2), w.price, w.source]));
    gaps.forEach((g,i) => rows.push([`Gap-${i}`, "Zuschnitt", g.w, g.h, ((g.w*g.h)/1000000).toFixed(2), "0", "-"]));
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", "stueckliste.csv");
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
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
          .btn { padding: 8px 12px; border-radius: 4px; border: none; cursor: pointer; font-weight: 600; font-size: 13px; transition: 0.2s; width: 100%; margin-top: 5px; }
          .btn-red { background: #FF4B4B; color: white; } .btn-red:hover { background: #FF3333; }
          .btn-blue { background: #0066cc; color: white; } .btn-blue:hover { background: #005bb5; }
          .btn-white { background: white; border: 1px solid #ccc; color: #333; } .btn-white:hover { border-color: #FF4B4B; }
          .inp { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; font-family: 'Inter'; font-size: 13px; }
          .lbl { font-size: 12px; font-weight: 600; color: #555; margin-bottom: 2px; display: block; }
          .table-wrapper { background: white; border-radius: 8px; border: 1px solid #e0e0e0; overflow-x: auto; box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 20px;}
          table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
          th { background: #F8F9FB; padding: 10px; font-weight: 600; color: #555; border-bottom: 1px solid #e0e0e0; white-space: nowrap; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; vertical-align: middle; white-space: nowrap; }
          .icon-btn { background: rgba(255,255,255,0.9); border: 1px solid #777; border-radius: 3px; font-size: 10px; cursor: pointer; padding: 2px 5px; transition: 0.1s; }
          .icon-btn:hover { background: white; transform: scale(1.1); }
          .metric-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee; flex: 1; text-align: center;}
          .metric-lbl { font-size: 12px; color: #777; font-weight: 600;}
          .metric-val { font-size: 22px; font-weight: 700; color: #222; margin-top: 5px;}
        `}
      </style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={{display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "15px"}}>
          {Object.keys(LANG_DICT).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{background: lang === l ? "#FF4B4B" : "#eee", color: lang === l ? "white" : "#333", border:"none", borderRadius:"4px", fontSize:"10px", padding:"4px 6px", cursor:"pointer"}}>{l.split(" ")[0]}</button>
          ))}
        </div>
        <h2 style={{fontSize:"18px", marginTop:0}}>{T.title}</h2>

        {/* Suche */}
        <div style={styles.card}>
          <h4 style={{margin:"0 0 10px 0"}}>{T.search_h}</h4>
          <input className="inp" placeholder={T.c_land} value={searchParams.land} onChange={e=>setSearch({...searchParams, land:e.target.value})} style={{marginBottom:"5px"}}/>
          <input className="inp" placeholder={T.c_zip} value={searchParams.zip} onChange={e=>setSearch({...searchParams, zip:e.target.value})} style={{marginBottom:"5px"}}/>
          <div style={{display:"flex", gap:"10px", fontSize:"12px", marginBottom:"10px", marginTop:"5px"}}>
            <label><input type="checkbox" checked={searchParams.reuse} onChange={e=>setSearch({...searchParams, reuse:e.target.checked})}/> {T.reuse}</label>
            <label><input type="checkbox" checked={searchParams.new} onChange={e=>setSearch({...searchParams, new:e.target.checked})}/> {T.new}</label>
          </div>
          <button className="btn btn-red" onClick={performSearch}>{T.btn_search}</button>
        </div>

        {/* Custom Window */}
        <div style={styles.card}>
          <h4 style={{margin:"0 0 10px 0"}}>{T.cust_h}</h4>
          <div style={{display:"flex", gap:"10px"}}>
            <div><label className="lbl">{T.w_lbl}</label><input type="number" className="inp" value={customWin.w} onChange={e=>setCustomWin({...customWin, w: parseInt(e.target.value)})} /></div>
            <div><label className="lbl">{T.h_lbl}</label><input type="number" className="inp" value={customWin.h} onChange={e=>setCustomWin({...customWin, h: parseInt(e.target.value)})} /></div>
          </div>
          <button className="btn btn-white" onClick={addCustomWindow}>{T.btn_add}</button>
        </div>

        {/* Steuerung */}
        <div style={styles.card}>
          <h4 style={{margin:"0 0 10px 0"}}>{T.wall_h}</h4>
          <div style={{display:"flex", gap:"10px", marginBottom:"5px"}}>
             <input type="range" min="1000" max="30000" step="100" value={wall.w} onChange={e=>{setWall({...wall, w:parseInt(e.target.value)}); triggerAI(windows);}} style={{flex:1}}/>
             <input type="number" className="inp" value={wall.w} onChange={e=>{setWall({...wall, w:parseInt(e.target.value)||0}); triggerAI(windows);}} style={{width:"70px", padding:"4px"}}/>
          </div>
          <div style={{display:"flex", gap:"10px", marginBottom:"15px"}}>
             <input type="range" min="1000" max="30000" step="100" value={wall.h} onChange={e=>{setWall({...wall, h:parseInt(e.target.value)}); triggerAI(windows);}} style={{flex:1}}/>
             <input type="number" className="inp" value={wall.h} onChange={e=>{setWall({...wall, h:parseInt(e.target.value)||0}); triggerAI(windows);}} style={{width:"70px", padding:"4px"}}/>
          </div>

          <label className="lbl" style={{display:"flex", alignItems:"center", gap:"5px", marginBottom:"5px"}}><input type="checkbox" checked={lockPinned} onChange={e=>setLockPinned(e.target.checked)}/> {T.lock}</label>
          <label className="lbl" style={{display:"flex", alignItems:"center", gap:"5px", marginBottom:"5px"}}><input type="checkbox" checked={symmetry} onChange={e=>{setSymmetry(e.target.checked); triggerAI(windows);}}/> {T.sym}</label>
          <label className="lbl" style={{marginTop:"10px"}}>{T.chaos}: {chaos}%</label>
          <input type="range" min="0" max="100" value={chaos} onChange={e=>{setChaos(parseInt(e.target.value)); triggerAI(windows);}} style={{width:"100%", marginBottom:"10px"}}/>
          
          <button className="btn btn-blue" onClick={() => { const s = Math.random(); setSeed(s); triggerAI(windows, s); }}>{T.btn_shuf}</button>
          <button className="btn btn-white" onClick={() => { const t = !gapToggle; setGapToggle(t); triggerAI(windows, seed, t); }}>{T.btn_gaps}</button>
        </div>
      </div>

      {/* HAUPTBEREICH */}
      <div style={styles.mainArea}>
        
        {/* DASHBOARD METRICS */}
        <div style={{ display: "flex", gap: "15px", padding: "20px", background: "white", borderBottom: "1px solid #e0e0e0" }}>
          <div className="metric-box"><div className="metric-lbl">{T.wall_a}</div><div className="metric-val">{wallArea.toFixed(2)}</div></div>
          <div className="metric-box"><div className="metric-lbl">{T.win_a}</div><div className="metric-val">{winArea.toFixed(2)}</div></div>
          <div className="metric-box"><div className="metric-lbl">{T.fill}</div><div className="metric-val">{fillRate.toFixed(1)} %</div></div>
          <div className="metric-box" style={{borderLeft: "4px solid #FF4B4B"}}><div className="metric-lbl">{T.price}</div><div className="metric-val">{totalPrice.toFixed(2)} €</div></div>
        </div>

        {/* CANVAS */}
        <div style={{ flex: 1, padding: "30px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ 
            width: Math.max(30, 400 * SCALE), height: 1780 * SCALE, marginRight: "15px",
            background: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 280%22><circle cx=%2250%22 cy=%2225%22 r=%2215%22 fill=%22%23333%22/><path d=%22M 30 50 Q 50 40 70 50 L 85 130 L 70 130 L 65 70 L 60 130 L 65 260 L 45 260 L 50 140 L 45 140 L 40 260 L 20 260 L 25 130 L 20 70 L 15 130 Z%22 fill=%22%23333%22/></svg>') no-repeat bottom center/contain",
            opacity: 0.6 
          }} />

          <div ref={canvasRef} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
            style={{ width: wall.w * SCALE, height: canvas_h, border: "4px solid #333", position: "relative", background: "repeating-linear-gradient(45deg, #fce4e4, #fce4e4 10px, #ffffff 10px, #ffffff 20px)", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
          >
            {gaps.map(g => (
              <div key={g.id} style={{ position: "absolute", left: g.x * SCALE, bottom: g.y * SCALE, width: g.w * SCALE, height: g.h * SCALE, background: "rgba(255, 75, 75, 0.4)", border: "1px dashed #FF4B4B", pointerEvents: "none", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "10px", color: "white", textShadow: "0px 1px 2px rgba(0,0,0,0.8)", fontWeight: "600" }}>
                {(g.w * g.h / 1000000) >= 0.4 ? `${(g.w * g.h / 1000000).toFixed(2)}` : ""}
              </div>
            ))}
            {windows.filter(w => w.visible).map(w => (
              <div key={w.id} onMouseDown={(e) => handleMouseDown(e, w.id, w.is_pinned)}
                style={{ position: "absolute", left: w.x * SCALE, bottom: w.y * SCALE, width: w.w * SCALE, height: w.h * SCALE, background: w.color, border: w.is_pinned ? "3px solid #000" : "2px solid #555", cursor: w.is_pinned ? "not-allowed" : (draggingId === w.id ? "grabbing" : "grab"), display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontWeight: "700", fontSize: "11px", zIndex: w.is_pinned ? 5 : 10, opacity: w.is_pinned ? 0.95 : 1 }}
              >
                <div style={{position: "absolute", top: 2, right: 2, display: "flex", gap: "2px"}}>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); updateProp(w.id, 'rotated', !w.rotated); }}>🔄</button>
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); togglePin(w.id); }}>{w.is_pinned ? "❌" : "📌"}</button>
                </div>
                <span style={{pointerEvents: "none", marginTop: "12px", textAlign: "center"}}>{w.is_pinned && "📌 "}{w.pos_label}<br/><span style={{fontSize: "9px"}}>{w.w}x{w.h}</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* TABELLEN BEREICH */}
        <div style={{ padding: "20px", background: "white", borderTop: "1px solid #ccc" }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px"}}>
            <h3 style={{margin:0}}>{T.mat_h}</h3>
            <button className="btn btn-red" style={{width:"auto", marginTop:0}} onClick={downloadCSV}>{T.exp_btn}</button>
          </div>
          
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>{T.col.v}</th><th>{T.col.p}</th><th>{T.col.r}</th><th>{T.col.f}</th><th>{T.col.id}</th><th>{T.col.x}</th><th>{T.col.y}</th><th>{T.col.dim}</th><th>{T.col.a}</th><th>{T.col.src}</th><th>{T.col.pr}</th><th>{T.col.l}</th>
              </tr></thead>
              <tbody>
                {windows.map(w => (
                  <tr key={w.id} style={{ background: w.is_pinned ? "rgba(255, 235, 59, 0.15)" : (w.color+"33"), opacity: w.visible ? 1 : 0.4 }}>
                    <td><input type="checkbox" checked={w.visible} onChange={(e)=>updateProp(w.id, 'visible', e.target.checked)} style={{cursor:"pointer"}}/></td>
                    <td><input type="checkbox" checked={w.is_pinned} onChange={()=>togglePin(w.id)} style={{cursor:"pointer"}}/></td>
                    <td><input type="checkbox" checked={w.rotated} onChange={(e)=>updateProp(w.id, 'rotated', e.target.checked)} style={{cursor:"pointer"}}/></td>
                    <td><input type="checkbox" checked={w.force} onChange={(e)=>updateProp(w.id, 'force', e.target.checked)} style={{cursor:"pointer"}}/></td>
                    <td style={{fontWeight:"bold"}}>{w.pos_label}</td>
                    <td><input type="number" className="inp" value={w.x} onChange={(e)=>handleCoordChange(w.id, 'x', parseInt(e.target.value)||0)} style={{width:"60px", padding:"4px"}}/></td>
                    <td><input type="number" className="inp" value={w.y} onChange={(e)=>handleCoordChange(w.id, 'y', parseInt(e.target.value)||0)} style={{width:"60px", padding:"4px"}}/></td>
                    <td>{w.w} x {w.h}</td>
                    <td>{((w.w*w.h)/1000000).toFixed(2)}</td>
                    <td style={{maxWidth:"150px", overflow:"hidden", textOverflow:"ellipsis"}}>{w.source}</td>
                    <td>{w.price.toFixed(2)} €</td>
                    <td>{w.link ? <a href={w.link} target="_blank">Link 🔗</a> : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{margin:"20px 0 10px 0"}}>{T.gaps_h}</h3>
          {gaps.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>{T.col.id}</th><th>{T.col.dim}</th><th>{T.col.a}</th><th>{T.col.x}</th><th>{T.col.y}</th></tr></thead>
                <tbody>
                  {gaps.map((g, i) => (
                    <tr key={g.id}>
                      <td><b>Gap-{i+1}</b></td>
                      <td>{g.w} x {g.h}</td>
                      <td>{((g.w*g.h)/1000000).toFixed(2)}</td>
                      <td>{g.x}</td><td>{g.y}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div style={{padding:"15px", background:"#d4edda", color:"#155724", borderRadius:"4px"}}>{T.no_gaps}</div>}

        </div>
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: "flex", height: "100vh", overflow: "hidden" },
  sidebar: { width: "320px", background: "#ffffff", borderRight: "1px solid #e0e0e0", padding: "20px", overflowY: "auto", boxShadow: "2px 0 10px rgba(0,0,0,0.02)", zIndex: 100 },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", background: "#F4F6F8", overflowY: "auto" },
  card: { background: "#f8f9fa", padding: "15px", borderRadius: "6px", marginBottom: "15px", border: "1px solid #e9ecef" }
};
