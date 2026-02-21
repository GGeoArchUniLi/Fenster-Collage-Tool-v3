from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import random
import uuid
import re
try:
    from duckduckgo_search import DDGS
except ImportError:
    pass

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

class Window(BaseModel):
    id: str
    pos_label: str
    w: int
    h: int
    x: int = 0
    y: int = 0
    price: float
    color: str
    source: str
    link: str
    type: str = "Fenster"
    is_pinned: bool = False
    rotated: bool = False
    force: bool = False
    visible: bool = True

class ClusterReq(BaseModel):
    wall_w: int
    wall_h: int
    windows: list[Window]
    symmetry: bool
    chaos: int
    seed: int
    lock_pinned: bool
    toggle_gaps: bool

def check_overlap(x, y, w, h, placed):
    for p in placed:
        if not (x + w <= p['x'] or x >= p['x'] + p['w'] or y + h <= p['y'] or y >= p['y'] + p['h']):
            return True
    return False

@app.post("/api/cluster")
def generate_cluster(req: ClusterReq):
    random.seed(req.seed)
    placed_items = []
    fixed_x, fixed_y = [], []
    
    active_windows = [w for w in req.windows if w.visible]
    pinned = [w for w in active_windows if w.is_pinned]
    unpinned = [w for w in active_windows if not w.is_pinned]
    
    # 1. Gepinnte Fenster platzieren (mit KI Korrektur)
    for win in pinned:
        eff_w, eff_h = (win.h, win.w) if win.rotated else (win.w, win.h)
        target_x = max(0, min(win.x, req.wall_w - eff_w))
        target_y = max(0, min(win.y, req.wall_h - eff_h))
        
        if not check_overlap(target_x, target_y, eff_w, eff_h, placed_items):
            fx, fy = target_x, target_y
        else:
            fx, fy = target_x, target_y
            min_dist = float('inf')
            for r in range(0, req.wall_h - eff_h + 1, 50):
                for c in range(0, req.wall_w - eff_w + 1, 50):
                    if not check_overlap(c, r, eff_w, eff_h, placed_items):
                        dist = (c - target_x)**2 + (r - target_y)**2
                        if dist < min_dist:
                            min_dist = dist; fx = c; fy = r
        
        placed_items.append({"id": win.id, "x": fx, "y": fy, "w": eff_w, "h": eff_h, "rotated": win.rotated})
        fixed_x.append(fx + eff_w / 2); fixed_y.append(fy + eff_h / 2)

    cx = sum(fixed_x)/len(fixed_x) if fixed_x else req.wall_w / 2
    cy = sum(fixed_y)/len(fixed_y) if fixed_y else req.wall_h / 2

    # 2. KI Gravity für freie Fenster
    unpinned = sorted(unpinned, key=lambda i: (i.w * i.h) * random.uniform(1.0 - (req.chaos/100), 1.0 + (req.chaos/100)), reverse=True)
    step = 200 if req.wall_w > 15000 or req.wall_h > 15000 else 100

    for win in unpinned:
        eff_w, eff_h = (win.h, win.w) if win.rotated else (win.w, win.h)
        best_pos = None; min_score = float('inf')
        for y in range(0, req.wall_h - eff_h + 1, step):
            for x in range(0, req.wall_w - eff_w + 1, step):
                if not check_overlap(x, y, eff_w, eff_h, placed_items):
                    score = (x + eff_w/2 - cx)**2 + (y + eff_h/2 - cy)**2
                    if req.symmetry: score += min(abs(x + eff_w/2 - cx), abs(y + eff_h/2 - cy)) * 5000
                    if score < min_score:
                        min_score = score; best_pos = {"id": win.id, "x": x, "y": y, "w": eff_w, "h": eff_h, "rotated": win.rotated}
        if best_pos: placed_items.append(best_pos)

    # 3. Exakter Zuschnitt (0% Lücken, 0% Überlappung)
    xs = sorted(list(set([0, req.wall_w] + [p['x'] for p in placed_items] + [p['x'] + p['w'] for p in placed_items])))
    ys = sorted(list(set([0, req.wall_h] + [p['y'] for p in placed_items] + [p['y'] + p['h'] for p in placed_items])))
    grid = np.zeros((len(ys)-1, len(xs)-1), dtype=bool)
    
    for p in placed_items:
        x1, x2 = xs.index(p['x']), xs.index(p['x'] + p['w'])
        y1, y2 = ys.index(p['y']), ys.index(p['y'] + p['h'])
        grid[y1:y2, x1:x2] = True

    gaps = []
    for r in range(len(ys)-1):
        for c in range(len(xs)-1):
            if not grid[r, c]:
                if req.toggle_gaps:
                    ch = 0
                    while r + ch < len(ys)-1 and not grid[r + ch, c]: ch += 1
                    cw, valid = 0, True
                    while c + cw < len(xs)-1 and valid:
                        for ir in range(r, r + ch):
                            if grid[ir, c + cw]: valid = False; break
                        if valid: cw += 1
                    grid[r:r+ch, c:c+cw] = True
                    gaps.append({"id": uuid.uuid4().hex, "x": int(xs[c]), "y": int(ys[r]), "w": int(xs[c+cw]-xs[c]), "h": int(ys[r+ch]-ys[r])})
                else:
                    cw = 0
                    while c + cw < len(xs)-1 and not grid[r, c + cw]: cw += 1
                    ch, valid = 0, True
                    while r + ch < len(ys)-1 and valid:
                        for ic in range(c, c + cw):
                            if grid[r + ch, ic]: valid = False; break
                        if valid: ch += 1
                    grid[r:r+ch, c:c+cw] = True
                    gaps.append({"id": uuid.uuid4().hex, "x": int(xs[c]), "y": int(ys[r]), "w": int(xs[c+cw]-xs[c]), "h": int(ys[r+ch]-ys[r])})

    return {"windows": placed_items, "gaps": gaps}

@app.get("/api/search")
def search(land: str, plz: str, radius: int, reuse: bool = True, new: bool = False):
    materials = []
    queries = []
    if reuse: queries.append((f"site:ebay.de OR site:kleinanzeigen.de Fenster gebraucht {plz} {land}", '#4682b4'))
    if new: queries.append((f"Fenster neu kaufen {plz} {land}", '#add8e6'))
    
    try:
        with DDGS() as ddgs:
            for query, color in queries:
                results = list(ddgs.text(query, max_results=15))
                for res in results:
                    match = re.search(r'(\d{3,4})\s*[xX*]\s*(\d{3,4})', res['title'] + " " + res['body'])
                    if match:
                        w, h = int(match.group(1)), int(match.group(2))
                        if 300 <= w <= 30000 and 300 <= h <= 30000:
                            price_match = re.search(r'(\d{1,5})[.,]?\d*\s*[€|EUR]', res['title'] + " " + res['body'])
                            price = float(price_match.group(1)) if price_match else float(int((w * h) / 20000) + random.randint(10, 50))
                            materials.append({
                                'id': uuid.uuid4().hex, 'w': w, 'h': h, 'type': 'Fenster', 'color': color, 
                                'price': price, 'source': res['title'][:25] + '...', 'link': res['href']
                            })
    except Exception:
        pass

    if len(materials) < 3: 
        fallback = [(1200, 1400, '#4682b4', 85.0), (2000, 2100, '#add8e6', 350.0), (800, 600, '#4682b4', 40.0)]
        for w, h, col, pr in fallback * 4:
            materials.append({'id': uuid.uuid4().hex, 'w': w, 'h': h, 'type': 'Fenster', 'color': col, 'price': pr, 'source': 'Notfall-Reserve', 'link': ''})
            
    return {"results": materials}
