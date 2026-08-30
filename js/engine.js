export const PixelIconCache = {};
export const SpriteCanvasCache = {};

export function createPixelSprite(matrix, colorMap, scale = 2) {
  const h = matrix.length, w = matrix[0].length;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const char = matrix[y][x];
      if (char !== '.' && colorMap[char]) {
        ctx.fillStyle = colorMap[char];
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  }
  return c;
}

export function initDarkPixelIcons() {
  PixelIconCache.wand = createPixelSprite(["......BB", ".....BMB", "....BMB.", "...BMB..", "..BBB...", ".S.S....", "S...S...", "........"], { 'B': '#38bdf8', 'M': '#e0f2fe', 'S': '#78350f' }, 3);
  PixelIconCache.orbs = createPixelSprite(["..BBBB..", ".BMMMMB.", "BMMMMMMB", "BMMMMMMB", "BMMMMMMB", ".BMMMMB.", "..BBBB.."], { 'B': '#4338ca', 'M': '#818cf8' }, 3);
  PixelIconCache.daggers = createPixelSprite([".....WW.", "....WKW.", "...WKW..", "..WKW...", ".DDD....", "D.D.....", "DD......"], { 'W': '#e2e8f0', 'K': '#94a3b8', 'D': '#334155' }, 3);
  PixelIconCache.heart = createPixelSprite([".RR..RR.", "RRRRRRRR", "RRRRRRRR", ".RRRRRR.", "..RRRR..", "...RR..."], { 'R': '#e11d48' }, 3);
  PixelIconCache.crown = createPixelSprite(["Y.Y.Y.Y.", "YYYYYYYY", "YYKKKKYY", "YYYYYYYY", ".YYYYYY."], { 'Y': '#f59e0b', 'K': '#b45309' }, 3);
  PixelIconCache.gold_coin = createPixelSprite([".YYYY.", "YYYYYY", "YYKKYY", "YYYYYY", ".YYYY."], { 'Y': '#facc15', 'K': '#ca8a04' }, 3);
  PixelIconCache.power = createPixelSprite([".RRRR...", "RRRRRR..", "RRRRRR..", ".RRRR...", ".RRRR..."], { 'R': '#ef4444' }, 3);
  PixelIconCache.boots = createPixelSprite(["...CC...", "..CCC...", ".CCCC...", "CCCCCCCC", ".CCCCCC."], { 'C': '#38bdf8' }, 3);
  PixelIconCache.magnet = createPixelSprite(["RR....BB", "RR....BB", "RR....BB", ".RR..BB.", "..RRBB.."], { 'R': '#ef4444', 'B': '#3b82f6' }, 3);
  PixelIconCache.tome = createPixelSprite([".BBBBBB.", "BPPBPPPB", "BPPBPPPB", "BPPBPPPB", ".BBBBBB."], { 'B': '#78350f', 'P': '#e0e7ff' }, 3);
  PixelIconCache.greed_pass = createPixelSprite(["..YY....", ".YYYY...", "YYYYYY..", "YYYYYY..", ".YYYY..."], { 'Y': '#fbbf24' }, 3);

  // UI Icons
  PixelIconCache.thunder = createPixelSprite(["....Y....", "...YYY...", "..Y.Y.Y..", ".Y..Y..Y.", "....Y....", "...Y.Y...", "..Y...Y..", ".Y.....Y."], { 'Y': '#facc15' }, 3);
  PixelIconCache.whip = createPixelSprite(["...K....", "..KKK...", ".KWWWK..", "..K.K...", "...K....", "...K....", "...K....", "..K.K..."], { 'K': '#7f1d1d', 'W': '#fca5a5' }, 3);
  PixelIconCache.bow = createPixelSprite(["...B....", "..BB....", ".BBBB...", "..BB....", "...B....", "...B....", "..B.B...", ".B...B.."], { 'B': '#fef08a' }, 3);
  PixelIconCache.flask = createPixelSprite(["..GGG..", ".GPPPG.", ".GPPPG.", "..GPG..", "..GPG..", "..GGG..", ".G...G.", ".G...G."], { 'G': '#22c55e', 'P': '#a78bfa' }, 3);
  PixelIconCache.firering = createPixelSprite(["..RRRR..", ".RWWWWR.", "RWWGGWWR", "RWWGGWWR", ".RWWWWR.", "..RRRR.."], { 'R': '#fb923c', 'W': '#fef3c7', 'G': '#ef4444' }, 3);
  PixelIconCache.frost = createPixelSprite(["..B.B..", ".BBBBB.", "BB.B.BB", ".BBBBB.", "..B.B..", ".B...B.", "B.....B"], { 'B': '#a5f3fc' }, 3);
  PixelIconCache.laser = createPixelSprite(["..W..", ".WWW.", "WWWWW", ".WWW.", "..W.."], { 'W': '#38bdf8' }, 3);
  PixelIconCache.spear = createPixelSprite(["..P..", "..P..", "..P..", "..P..", "..P..", "..P..", ".PPP.", "..P.."], { 'P': '#fef3c7' }, 3);
  PixelIconCache.skull = createPixelSprite([".BBB.", "BWWWB", "BWWWB", ".BWB.", ".BWB.", "..B.."], { 'B': '#e2e8f0', 'W': '#94a3b8' }, 3);
  PixelIconCache.clover = createPixelSprite([".L.L.", "LLLLL", ".L.L.", "L...L", ".L.L.", "..L.."], { 'L': '#4ade80' }, 3);
  PixelIconCache.armor = createPixelSprite([".CCC.", "CCCCC", "CWWWC", "CWWWC", ".CWC.", "..C.."], { 'C': '#94a3b8', 'W': '#e2e8f0' }, 3);
  PixelIconCache.candle = createPixelSprite(["..C..", ".CCC.", "..C..", "..C..", ".C.C.", ".C.C.", "..C.."], { 'C': '#facc15' }, 3);
  PixelIconCache.duplicator = createPixelSprite([".RRR.", "R...R", "R.R.R", "R...R", ".RRR.", "..R.."], { 'R': '#c084fc' }, 3);

  PixelIconCache.ui_play = createPixelSprite(["...WWW..", "..WWWW..", "..WWW...", ".YYW....", "YYYY....", ".YY....."], {'W': '#e2e8f0', 'Y': '#facc15'}, 2);
  PixelIconCache.ui_skull = createPixelSprite([".WWWW.", "WKKWKW", "WWWWWW", ".WWWW.", ".W..W."], {'W': '#c084fc', 'K': '#3b0764'}, 2);
  PixelIconCache.ui_gold = PixelIconCache.gold_coin;
  PixelIconCache.ui_map = createPixelSprite(["GG.GGG", "GGBBGG", "GGGGGG", "G.GG.G"], {'G': '#16a34a', 'B': '#38bdf8'}, 3);
  PixelIconCache.ui_shield = createPixelSprite(["SSSSSS", "SBBbbs", "SBBbbs", ".SBbs.", "..Ss.."], {'S': '#94a3b8', 'B': '#3b82f6', 'b': '#1d4ed8', 's': '#64748b'}, 3);
  PixelIconCache.ui_sword = createPixelSprite([".......W", "......WW", "S....WW.", ".S..WW..", "..SWW...", "..WWS...", ".WW..S..", "WW....S."], {'W': '#e2e8f0', 'S': '#facc15'}, 2);
  PixelIconCache.ui_ready = createPixelSprite([".......G", "......GG", ".....GG.", "G...GG..", "GG.GG...", ".GGG....", "..G....."], {'G': '#22c55e'}, 2);
  PixelIconCache.ui_host = createPixelSprite(["Y..Y..Y.", "YY.YY.YY", "YYYYYYYY", "YYYYYYYY", ".YYYYYY.", ".RRRRRR."], {'Y': '#facc15', 'R': '#dc2626'}, 2);
  PixelIconCache.ui_exit = createPixelSprite([".WWWWW..", ".WBBBWW.", ".WBBBBW.", ".WBBYBW.", ".WBBBBW.", ".WBBBBW.", ".WWWWWW."], {'W': '#94a3b8', 'B': '#78350f', 'Y': '#facc15'}, 2);
  PixelIconCache.ui_hero = createPixelSprite(["..WW..", ".WYYW.", "WWYYWW", "WBBBBW", ".WBBW.", "..WW.."], {'W': '#ffffff', 'Y': '#facc15', 'B': '#38bdf8'}, 2);
  PixelIconCache.ui_globe = createPixelSprite([".BBBB.", "BGGBGB", "BBGGBB", "BBBGGB", ".BBBB."], {'B': '#3b82f6', 'G': '#22c55e'}, 3);
  PixelIconCache.ui_temple = createPixelSprite(["..YY..", ".YYYY.", "WWWWWW", "W.WW.W", "W.WW.W", "WWWWWW"], {'Y': '#facc15', 'W': '#e2e8f0'}, 2);
  PixelIconCache.ui_trophy = createPixelSprite(["YYYYYY", ".YYYY.", "..YY..", "..YY..", ".YYYY."], {'Y': '#facc15'}, 3);
  PixelIconCache.ui_pause = createPixelSprite(["WW..WW", "WW..WW", "WW..WW", "WW..WW"], {'W': '#ffffff'}, 3);
  PixelIconCache.ui_audio = createPixelSprite(["...W..", "..WW..", ".WWW..", "WWWWWW", "WWWWWW", ".WWW..", "..WW..", "...W.."], {'W': '#ffffff'}, 2);
  PixelIconCache.ui_alert = createPixelSprite(["..YY..", ".YYYY.", "YYRRYY", "YYRRYY", "YYYYYY", "YYRRYY", ".YYYY."], {'Y': '#facc15', 'R': '#ef4444'}, 2);
  PixelIconCache.ui_lock = createPixelSprite([".YYYY.", "Y....Y", "WWWWWW", "W.WW.W", "W.WW.W", "WWWWWW"], {'Y': '#94a3b8', 'W': '#cbd5e1'}, 2);
}

export function initSprites(HEROES) {
  const heroMatrix = ["..HHHH..", ".HFFFFH.", "HFFSSFFH", "HFSWWSSF", "HFFSSFFH", ".HABBAH.", "HAABBBAH", "A.ABBA.A", "..LLLL..", "..L..L.."];
  Object.keys(HEROES).forEach(k => { SpriteCanvasCache[`hero_${k}`] = createPixelSprite(heroMatrix, HEROES[k].colorMap, 3); });
  SpriteCanvasCache.bat = createPixelSprite(["W......W", "WW.EE.WW", "WWWEEWWW", ".WEEEEW.", "..RRRR..", ".EEEEEE.", "..E..E.."], { 'W': '#475569', 'E': '#64748b', 'R': '#ef4444' }, 3);
  SpriteCanvasCache.archer = createPixelSprite(["..WW..", ".WGGW.", "WGGGGW", ".WSSW.", ".WSSW.", "..SS.."], { 'W': '#f8fafc', 'G': '#22c55e', 'S': '#4b5563' }, 3);
  SpriteCanvasCache.brute = createPixelSprite([".RRRR.", "RWWWWR", "RWGGWR", ".WGGW.", ".WWWW.", "..RR.."], { 'R': '#7c2d12', 'W': '#f3f4f6', 'G': '#b91c1c' }, 3);
  SpriteCanvasCache.imp = createPixelSprite([".PPPP.", "PYYYYP", ".PYYP.", ".Y..Y.", "..PP.."], { 'P': '#a855f7', 'Y': '#facc15' }, 3);
  SpriteCanvasCache.lich = createPixelSprite([".BBBB.", "BWWWWB", "BWBWB.", ".WWW.", ".B.B.", "..B.."], { 'B': '#67e8f9', 'W': '#e2e8f0' }, 3);
  SpriteCanvasCache.ghost = createPixelSprite([".GGG.", "GWWWG", "GWWWG", ".WGW.", ".W.W.", "..G.."], { 'G': '#cbd5e1' }, 3);
  SpriteCanvasCache.gargoyle = createPixelSprite([".RRR.", "RWWWR", "RWGWR", ".WWW.", ".G.G.", "..R.."], { 'R': '#9ca3af', 'W': '#f8fafc', 'G': '#94a3b8' }, 3);
  SpriteCanvasCache.peerPlayer = createPixelSprite(heroMatrix, { 'H': '#047857', 'F': '#10b981', 'S': '#fde047', 'W': '#ffffff', 'A': '#6ee7b7', 'B': '#059669', 'L': '#064e3b' }, 3);
}

export function drawMap(ctx, camera, screenWidth, screenHeight, mapConfig) {
  const tileSize = 60;
  const startTileX = Math.floor(camera.x / tileSize);
  const endTileX = Math.ceil((camera.x + screenWidth) / tileSize);
  const startTileY = Math.floor(camera.y / tileSize);
  const endTileY = Math.ceil((camera.y + screenHeight) / tileSize);

  ctx.fillStyle = mapConfig.baseColor;
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  for (let tx = startTileX; tx <= endTileX; tx++) {
    for (let ty = startTileY; ty <= endTileY; ty++) {
      const posX = tx * tileSize;
      const posY = ty * tileSize;
      const hash = Math.sin(tx * 12.9898 + ty * 78.233) * 43758.5453;
      const rand = hash - Math.floor(hash);

      ctx.fillStyle = rand > 0.55 ? mapConfig.tileColor1 : mapConfig.tileColor2;
      ctx.fillRect(posX, posY, tileSize, tileSize);
      
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(0, 0, 0, ${mapConfig.borderAlpha * 3})`;
      ctx.strokeRect(posX, posY, tileSize, tileSize);
      
      if (rand > 0.8) {
        ctx.fillStyle = `rgba(255, 255, 255, ${mapConfig.borderAlpha * 0.5})`;
        ctx.beginPath(); ctx.arc(posX + 15, posY + 15, 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(posX + 40, posY + 45, 4, 4);
      }
    }
  }
}

export let audioCtx = null;
export let isAudioEnabled = true;

export function initAudio() {
  if (!audioCtx) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    } catch (e) {}
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

export function playSound(type) {
  if (!isAudioEnabled || !audioCtx) return;
  const now = audioCtx.currentTime;
  const createTone = (t, startF, endF, dur, vol) => {
    const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = t; osc.frequency.setValueAtTime(startF, now);
    if (endF !== startF) osc.frequency.exponentialRampToValueAtTime(Math.max(10, endF), now + dur);
    gain.gain.setValueAtTime(vol, now); gain.gain.linearRampToValueAtTime(0, now + dur);
    osc.start(now); osc.stop(now + dur);
  };
  if (type === 'hit') createTone('triangle', 150, 30, 0.05, 0.06);
  if (type === 'coin') createTone('sine', 987, 1318, 0.12, 0.06);
  if (type === 'gem') createTone('sine', 850 + Math.random() * 150, 1300, 0.05, 0.03);
  if (type === 'levelup') createTone('square', 440, 880, 0.15, 0.08);
}

export function toggleAudio() {
  initAudio();
  isAudioEnabled = !isAudioEnabled;
  return isAudioEnabled;
}