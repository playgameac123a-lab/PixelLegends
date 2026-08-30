import { PixelIconCache } from './engine.js';
import { EVOLVED_WEAPONS } from './data.js';

// 輔助函式：正確複製 Canvas 影像
function cloneCanvas(oldCanvas) {
  if (!oldCanvas) return null;
  const newCanvas = oldCanvas.cloneNode(true);
  newCanvas.getContext('2d').drawImage(oldCanvas, 0, 0);
  return newCanvas;
}

export function renderAllPixelIcons() {
  document.querySelectorAll('.pixel-icon').forEach(el => {
    const iconName = el.getAttribute('data-icon');
    const canvas = PixelIconCache[iconName];
    if (canvas) {
      el.innerHTML = '';
      el.appendChild(cloneCanvas(canvas));
    }
  });
}

export function showScreen(screenId) {
  document.querySelectorAll('.screen-overlay, .modal-overlay').forEach(el => el.classList.remove('active'));
  if (screenId) {
    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
  }
}

export function updateHpUI(hp, maxHp) {
  const pct = Math.max(0, (hp / maxHp) * 100);
  const bar = document.getElementById('hpBar');
  if (!bar) return;
  bar.style.width = `${pct}%`;
  if (pct > 50) bar.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
  else if (pct > 25) bar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
  else bar.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
}

export function updateExpUI(exp, expNeeded, level) {
  const pct = Math.min(100, (exp / expNeeded) * 100);
  const expBar = document.getElementById('expBar');
  const lvlEl = document.getElementById('levelDisplay');
  if (expBar) expBar.style.width = `${pct}%`;
  if (lvlEl) lvlEl.innerText = `LV. ${level}`;
}

export function updateGoldUI(sessionGold) {
  const goldDisplay = document.getElementById('goldDisplay');
  if (goldDisplay) goldDisplay.innerHTML = `<i class="pixel-icon" data-icon="ui_gold"></i> ${sessionGold}`;
  const tgs = document.getElementById('talentGoldStatus');
  if (tgs) tgs.innerText = `目前金幣儲備：🪙 ${sessionGold}`;
  renderAllPixelIcons();
}

export function updateHUD(waveTimer, currentWave, MAX_WAVES, killCount) {
  const m = Math.floor(Math.max(0, waveTimer) / 60);
  const s = Math.floor(Math.max(0, waveTimer) % 60);
  const timeDisplay = document.getElementById('timeDisplay');
  const waveDisplay = document.getElementById('waveDisplay');
  const killDisplay = document.getElementById('killDisplay');
  if (timeDisplay) timeDisplay.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  if (waveDisplay) waveDisplay.innerText = `第 ${currentWave} / ${MAX_WAVES} 波`;
  if (killDisplay) killDisplay.innerHTML = `<i class="pixel-icon" data-icon="ui_skull"></i> ${killCount}`;
  renderAllPixelIcons();
}

export function updateEquipmentHUD(weaponsObj, passivesObj) {
  const container = document.getElementById('equipmentHud');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(weaponsObj).forEach(k => {
    const w = weaponsObj[k];
    if (w.level > 0) {
      const slot = document.createElement('div'); slot.className = 'equip-slot';
      const icon = cloneCanvas(PixelIconCache[w.evolved ? EVOLVED_WEAPONS[w.evolvesInto].iconKey : w.iconKey]);
      if (icon) slot.appendChild(icon);
      const badge = document.createElement('span');
      badge.className = `equip-level ${w.evolved ? 'evolved' : ''}`;
      badge.innerText = w.evolved ? 'MAX' : String(w.level);
      slot.appendChild(badge);
      container.appendChild(slot);
    }
  });
  Object.keys(passivesObj).forEach(k => {
    const p = passivesObj[k];
    if (p.level > 0) {
      const slot = document.createElement('div'); slot.className = 'equip-slot';
      const icon = cloneCanvas(PixelIconCache[p.iconKey]);
      if (icon) slot.appendChild(icon);
      const badge = document.createElement('span');
      badge.className = 'equip-level';
      badge.innerText = String(p.level);
      slot.appendChild(badge);
      container.appendChild(slot);
    }
  });
}

export function renderCharSelectUI(HEROES, previewKey, selectedKey, SpriteCanvasCache, onSelect) {
  const carousel = document.getElementById('heroCarouselContainer');
  if (!carousel) return;
  carousel.innerHTML = '';
  Object.keys(HEROES).forEach(k => {
    const h = HEROES[k];
    const card = document.createElement('div');
    card.className = `hero-tab-card ${previewKey === k ? 'active' : ''} ${!h.unlocked ? 'locked' : ''}`;
    const c = document.createElement('canvas');
    c.className = 'hero-tab-canvas'; c.width = 24; c.height = 30;
    const s = SpriteCanvasCache[`hero_${k}`];
    if (s) c.getContext('2d').drawImage(s, 0, 0, 24, 30);
    card.appendChild(c);
    const name = document.createElement('div');
    name.className = 'hero-tab-name';
    name.innerText = h.name.split(' ')[0];
    card.appendChild(name);
    if (!h.unlocked) {
      const lock = document.createElement('div');
      lock.className = 'hero-tab-name';
      lock.style.color = '#94a3b8';
      lock.innerText = '🔒';
      card.appendChild(lock);
    }
    if (h.unlocked) card.onclick = () => onSelect(k);
    carousel.appendChild(card);
  });
}

export function updateHeroStage(heroKey, HEROES, selectedKey, SpriteCanvasCache) {
  const h = HEROES[heroKey];
  document.getElementById('stageHeroName').innerText = h.name;
  document.getElementById('stageHeroWeapon').innerText = h.weaponName;
  document.getElementById('stageHeroHp').innerText = `生命 ${h.baseHp}`;
  document.getElementById('stageHeroSpeed').innerText = `移速 ${h.baseSpeed}`;
  document.getElementById('stageHeroTrait').innerText = h.unlocked ? h.traitDesc : `🔒 ${h.unlockReq}`;
  
  const pCanvas = document.getElementById('heroPreviewCanvas');
  if (pCanvas) {
    const pCtx = pCanvas.getContext('2d');
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    const sprite = SpriteCanvasCache[`hero_${heroKey}`];
    if (sprite) pCtx.drawImage(sprite, 0, 0, 24, 30);
  }
  
  const btn = document.getElementById('btnConfirmHero');
  if (h.unlocked) {
    btn.disabled = false; btn.innerText = selectedKey === heroKey ? '✨ 當前出戰' : '✅ 選擇出戰'; btn.className = 'action-btn emerald';
  } else {
    btn.disabled = true; btn.innerText = '🔒 尚未解鎖'; btn.className = 'action-btn secondary';
  }
}

export function renderLobbyCarousel(HEROES, currentKey, SpriteCanvasCache, onSelect) {
  const carousel = document.getElementById('lobbyHeroCarousel');
  if(!carousel) return;
  carousel.innerHTML = '';
  Object.keys(HEROES).forEach(k => {
    const h = HEROES[k];
    const card = document.createElement('div');
    card.className = `hero-tab-card ${currentKey === k ? 'active' : ''} ${!h.unlocked ? 'locked' : ''}`;
    const c = document.createElement('canvas');
    c.className = 'hero-tab-canvas'; c.width = 24; c.height = 30;
    const s = SpriteCanvasCache[`hero_${k}`];
    if (s) c.getContext('2d').drawImage(s, 0, 0, 24, 30);
    card.appendChild(c);
    const name = document.createElement('div');
    name.className = 'hero-tab-name';
    name.innerText = h.name.split(' ')[0];
    card.appendChild(name);
    if (!h.unlocked) {
      const lock = document.createElement('div');
      lock.className = 'hero-tab-name';
      lock.style.color = '#94a3b8';
      lock.innerText = '🔒';
      card.appendChild(lock);
    }
    if (h.unlocked) card.onclick = () => onSelect(k);
    carousel.appendChild(card);
  });
}

export function renderMapSelectUI(MAPS, selectedKey, onSelect) {
  const container = document.getElementById('mapListContainer');
  container.innerHTML = '';
  Object.keys(MAPS).forEach(k => {
    const m = MAPS[k];
    const card = document.createElement('div');
    card.className = `select-card ${selectedKey === k ? 'active' : ''}`;
    card.innerHTML = `<div class="select-card-header"><h4>${m.name}</h4></div><div class="select-card-traits">${m.desc}</div>`;
    card.onclick = () => onSelect(k);
    container.appendChild(card);
  });
}

export function renderTalentsUI(Talents, sessionGold, onBuy) {
  const list = document.getElementById('talentOptionsList');
  list.innerHTML = '';
  Object.keys(Talents).forEach(key => {
    const t = Talents[key];
    const cost = Math.round(t.baseCost * Math.pow(t.growth, t.level));
    const isMax = t.level >= t.max;
    const canAfford = sessionGold >= cost && !isMax;

    const card = document.createElement('div');
    card.className = 'skill-card'; card.style.opacity = isMax ? '0.7' : '1';

    const iconBox = document.createElement('div'); iconBox.className = 'skill-icon-box';
    const iconCanvas = cloneCanvas(PixelIconCache[t.iconKey]);
    if (iconCanvas) iconBox.appendChild(iconCanvas);

    const info = document.createElement('div');
    info.className = 'skill-info';
    info.innerHTML = `<h4>${t.name} (等級 ${t.level}/${t.max})</h4><p>${t.desc}</p>`;

    const btn = document.createElement('button');
    btn.className = `action-btn ${canAfford ? 'gold' : ''}`;
    btn.style.padding = '5px 10px'; btn.style.fontSize = '11px'; btn.style.margin = '0';
    btn.disabled = !canAfford || isMax;
    btn.innerText = isMax ? '已滿級' : `🪙 ${cost}`;
    if (canAfford && !isMax) btn.onclick = () => onBuy(key, cost);

    card.appendChild(iconBox);
    card.appendChild(info);
    card.appendChild(btn);
    list.appendChild(card);
  });
}

export function renderAchievementsUI(ACHIEVEMENTS) {
  const container = document.getElementById('achievementListContainer');
  container.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.style.borderColor = ach.unlocked ? '#a855f7' : '#1e293b';
    card.innerHTML = `
      <div class="skill-icon-box" style="font-size:16px;">${ach.unlocked ? '🏆' : '🔒'}</div>
      <div class="skill-info">
        <h4>${ach.title} <span style="font-size:10px; color:${ach.unlocked ? '#4ade80' : '#94a3b8'}">${ach.unlocked ? '【已達成】' : '【未達成】'}</span></h4>
        <p>${ach.desc}</p>
        <p style="color:#facc15; font-size:10px; margin-top:2px;">獎勵：${ach.reward}</p>
      </div>`;
    container.appendChild(card);
  });
}

export function renderUpgradeOptions(options, onSelect) {
  const list = document.getElementById('skillOptionsList');
  if (!list) return;
  list.innerHTML = '';
  options.forEach((opt, idx) => {
    const card = document.createElement('div');
    card.className = `skill-card ${opt.type === 'evolve' ? 'evolve' : ''}`;

    const iconBox = document.createElement('div'); iconBox.className = 'skill-icon-box';
    const iconCanvas = cloneCanvas(PixelIconCache[opt.iconKey] || PixelIconCache.wand);
    if (iconCanvas) iconBox.appendChild(iconCanvas);

    const info = document.createElement('div');
    info.className = 'skill-info';
    info.innerHTML = `<h4><span>[${idx + 1}] ${opt.name}</span></h4><p>${opt.desc}</p>`;

    card.appendChild(iconBox);
    card.appendChild(info);
    card.onclick = () => onSelect(opt);
    list.appendChild(card);
  });
}