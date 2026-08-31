import { MAPS, HEROES, WEAPONS, PASSIVES, Talents, ACHIEVEMENTS, EVOLVED_WEAPONS } from './data.js';
import { initDarkPixelIcons, initSprites, drawMap, SpriteCanvasCache, initAudio, playSound, toggleAudio } from './engine.js';
import { renderAllPixelIcons, showScreen, updateHpUI, updateExpUI, updateGoldUI, updateHUD, updateEquipmentHUD, renderCharSelectUI, updateHeroStage, renderMapSelectUI, renderTalentsUI, renderAchievementsUI, renderUpgradeOptions, renderLobbyCarousel } from './ui.js';
import { initAuth, loginWithGoogle, saveCloudData, currentUser } from './auth.js';
import { joinRemoteRoom, handleRoomUpdate, syncPlayerPosition, syncLobbyState, setRoomPlayingStatus, leaveRemoteRoom, updateRoomStatus } from './multiplayer.js';

let gameState = 'MENU', lastTime = performance.now();
const camera = { x: 0, y: 0 };
let player = {}, enemies = [], bullets = [], enemyProjectiles = [], gems = [], particles = [], floatingTexts = [], lightningStrikes = [], groundZones = [];
let sessionGold = 120, totalKills = 0, killCount = 0, highestWave = 1, currentWave = 1, waveTimer = 40;
let sharedPartyExp = 0, sharedPartyGold = 0, sharedRevivesRemaining = 1, sharedDrops = [], sharedChallengeFailed = false;
let enemySpawnCounter = 0, hasEvolvedAny = false;
let selectedHeroKey = 'knight', previewHeroKey = 'knight', selectedMapKey = 'dungeon';

let isMultiplayer = false, isRoomHost = false, isMyReady = false, currentRoomCode = '';
let lobbyPlayers = {}, peers = {}, syncTimer = 0;
let myPeerId = 'hero_' + Math.random().toString(36).substring(2, 6);
let myName = '勇者#' + myPeerId.substring(5);

const keys = { w: false, a: false, s: false, d: false, 1: false, 2: false, 3: false };
const joystick = { active: false, startX: 0, startY: 0, dx: 0, dy: 0, maxR: 45, deadZone: 5 };

window.onload = () => {
  initDarkPixelIcons();
  initSprites(HEROES);
  renderAllPixelIcons();
  bindUIEvents();
  bindJoystick();
  
  const raw = localStorage.getItem('RAGNAROK_SAVE');
  if (raw) applyCloudData(JSON.parse(raw));

  initAuth((user, cloudData) => {
    const loginBtn = document.getElementById('btnGoogleLogin');
    const loginText = document.getElementById('loginText');
    if (user) {
      myName = user.displayName || myName;
      myPeerId = user.uid;
      loginText.innerText = `已登入: ${myName}`;
      loginBtn.onclick = null;
      if (cloudData) applyCloudData(cloudData);
    } else {
      loginText.innerText = `Google 帳號登入 (雲端存檔)`;
      loginBtn.onclick = loginWithGoogle;
    }
    renderAllPixelIcons();
  });

  window.addEventListener('keydown', e => { 
    if(keys.hasOwnProperty(e.key)) keys[e.key] = true; 
    initAudio(); 
    if (gameState === 'UPGRADE' && (e.key === '1' || e.key === '2' || e.key === '3')) {
      const idx = parseInt(e.key) - 1;
      const cards = document.querySelectorAll('#skillOptionsList .skill-card');
      if (cards[idx]) cards[idx].click();
    }
  });
  window.addEventListener('keyup', e => { if(keys.hasOwnProperty(e.key)) keys[e.key] = false; });
  
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
};

function applyCloudData(data) {
  if (data.gold !== undefined) sessionGold = data.gold;
  if (data.highestWave !== undefined) highestWave = data.highestWave;
  if (data.totalKills !== undefined) totalKills = data.totalKills;
  if (data.hasEvolvedAny !== undefined) hasEvolvedAny = data.hasEvolvedAny;
  if (data.selectedHeroKey) selectedHeroKey = data.selectedHeroKey;
  if (data.selectedMapKey) selectedMapKey = data.selectedMapKey;
  if (data.talents) Object.keys(data.talents).forEach(k => { if(Talents[k]) Talents[k].level = data.talents[k]; });
  if (data.unlockedHeroes) Object.keys(data.unlockedHeroes).forEach(k => { if(HEROES[k]) HEROES[k].unlocked = data.unlockedHeroes[k]; });
  if (data.unlockedAchs) {
    data.unlockedAchs.forEach(savedAch => {
      const match = ACHIEVEMENTS.find(a => a.id === savedAch.id);
      if (match) match.unlocked = savedAch.unlocked;
    });
  }
}

function saveGameProgress() {
  const saveData = {
    gold: sessionGold, highestWave, totalKills, hasEvolvedAny, selectedHeroKey, selectedMapKey,
    talents: Object.keys(Talents).reduce((a, k) => ({...a, [k]: Talents[k].level}), {}),
    unlockedHeroes: Object.keys(HEROES).reduce((a, k) => ({...a, [k]: HEROES[k].unlocked}), {}),
    unlockedAchs: ACHIEVEMENTS.map(a => ({ id: a.id, unlocked: a.unlocked }))
  };
  localStorage.setItem('RAGNAROK_SAVE', JSON.stringify(saveData));
  if (currentUser) saveCloudData(saveData);
}

function checkAchievements() {
  const state = { killCount, totalKills, currentWave, sessionGold, hasEvolvedAny };
  ACHIEVEMENTS.forEach(ach => {
    if (!ach.unlocked && ach.check(state)) {
      ach.unlocked = true;
      if (ach.onUnlock) ach.onUnlock();
      floatingTexts.push({ x: player.x, y: player.y - 60, text: `🏆 成就解鎖：${ach.title}`, color: '#facc15', size: 18, vy: -1.2, life: 2.5 });
      playSound('levelup'); saveGameProgress();
    }
  });
}

function bindJoystick() {
  const zone = document.getElementById('joystickZone'), base = document.getElementById('joystickBase'), stick = document.getElementById('joystickStick');
  zone.addEventListener('touchstart', e => {
    if (gameState !== 'PLAYING') return;
    const t = e.touches[0];
    joystick.active = true; joystick.startX = t.clientX; joystick.startY = t.clientY; joystick.dx = 0; joystick.dy = 0;
    base.style.left = `${joystick.startX}px`; base.style.top = `${joystick.startY}px`;
    stick.style.left = `${joystick.startX}px`; stick.style.top = `${joystick.startY}px`;
    base.style.display = 'block'; stick.style.display = 'block';
  }, { passive: false });
  zone.addEventListener('touchmove', e => {
    if (!joystick.active || gameState !== 'PLAYING') return;
    const t = e.touches[0], dx = t.clientX - joystick.startX, dy = t.clientY - joystick.startY, dist = Math.hypot(dx, dy);
    if (dist < joystick.deadZone) { joystick.dx = 0; joystick.dy = 0; } 
    else {
      const clamped = Math.min(dist, joystick.maxR), angle = Math.atan2(dy, dx);
      joystick.dx = Math.cos(angle) * (clamped / joystick.maxR); joystick.dy = Math.sin(angle) * (clamped / joystick.maxR);
      stick.style.left = `${joystick.startX + Math.cos(angle) * clamped}px`; stick.style.top = `${joystick.startY + Math.sin(angle) * clamped}px`;
    }
  }, { passive: false });
  const resetJoy = () => { joystick.active = false; joystick.dx = 0; joystick.dy = 0; base.style.display = 'none'; stick.style.display = 'none'; };
  zone.addEventListener('touchend', resetJoy); zone.addEventListener('touchcancel', resetJoy);
}

function bindUIEvents() {
  document.getElementById('btnGoogleLogin').onclick = loginWithGoogle;
  document.getElementById('btnMenuPlay').onclick = () => { isMultiplayer = false; initAudio(); startGame(); };
  
  document.getElementById('btnMenuChar').onclick = () => {
    previewHeroKey = selectedHeroKey;
    const refreshHeroUI = (k) => { previewHeroKey = k; updateHeroStage(k, HEROES, selectedHeroKey, SpriteCanvasCache); renderCharSelectUI(HEROES, previewHeroKey, selectedHeroKey, SpriteCanvasCache, refreshHeroUI); };
    refreshHeroUI(previewHeroKey); showScreen('charSelectScreen');
  };
  document.getElementById('btnConfirmHero').onclick = () => {
    if (HEROES[previewHeroKey].unlocked) { selectedHeroKey = previewHeroKey; playSound('coin'); saveGameProgress(); showScreen('mainMenuScreen'); }
  };
  document.getElementById('btnBackFromChar').onclick = () => showScreen('mainMenuScreen');

  document.getElementById('btnMenuMap').onclick = () => {
    const refreshMapUI = (k) => { selectedMapKey = k; saveGameProgress(); renderMapSelectUI(MAPS, selectedMapKey, refreshMapUI); };
    refreshMapUI(selectedMapKey); showScreen('mapSelectScreen');
  };
  document.getElementById('btnBackFromMap').onclick = () => showScreen('mainMenuScreen');

  document.getElementById('btnMenuTalent').onclick = () => {
    const refreshTalentUI = (k, cost) => { sessionGold -= cost; Talents[k].level++; playSound('coin'); updateGoldUI(sessionGold); saveGameProgress(); renderTalentsUI(Talents, sessionGold, refreshTalentUI); };
    renderTalentsUI(Talents, sessionGold, refreshTalentUI); updateGoldUI(sessionGold); showScreen('talentModal');
  };
  document.getElementById('closeTalentBtn').onclick = () => showScreen('mainMenuScreen');

  document.getElementById('btnMenuAchievements').onclick = () => { renderAchievementsUI(ACHIEVEMENTS); showScreen('achievementModal'); };
  document.getElementById('closeAchievementBtn').onclick = () => showScreen('mainMenuScreen');

  document.getElementById('btnMenuMulti').onclick = () => showScreen('multiMatchScreen');
  document.getElementById('btnBackFromMatch').onclick = () => showScreen('mainMenuScreen');
  document.getElementById('btnHostCreateRoom').onclick = () => joinLobby(Math.random().toString(36).substring(2, 8).toUpperCase(), true);
  document.getElementById('btnGuestJoinRoom').onclick = () => joinLobby(document.getElementById('joinRoomCodeInput').value.trim().toUpperCase(), false);
  
  document.getElementById('btnGuestToggleReady').onclick = () => { 
    isMyReady = !isMyReady; 
    syncLobbyState(isMyReady, selectedHeroKey); 
    showLobbyUI();
  };
  document.getElementById('btnHostStartGame').onclick = () => { 
    if (isRoomHost) { 
      setRoomPlayingStatus(true, selectedMapKey);
      isMultiplayer = true; startGame(); 
    } 
  };
  document.getElementById('btnLeaveLobby').onclick = () => {
    isMultiplayer = false; isRoomHost = false; isMyReady = false; currentRoomCode = '';
    peers = {}; lobbyPlayers = {};
    leaveRemoteRoom(); showScreen('mainMenuScreen');
  };

  const audioToggleBtn = document.getElementById('audioToggleBtn');
  audioToggleBtn.onclick = () => {
    const isEnabled = toggleAudio();
    audioToggleBtn.innerHTML = isEnabled ? '<i class="pixel-icon" data-icon="ui_audio"></i>' : '🔇';
    renderAllPixelIcons();
  };

  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.onclick = () => {
    if (gameState === 'PLAYING') { gameState = 'PAUSED'; pauseBtn.innerHTML = '▶️'; }
    else if (gameState === 'PAUSED') { gameState = 'PLAYING'; pauseBtn.innerHTML = `<i class="pixel-icon" data-icon="ui_pause"></i>`; lastTime = performance.now(); renderAllPixelIcons(); }
  };
  document.getElementById('restartBtn').onclick = () => { showScreen(null); startGame(); };
  document.getElementById('endBackMenuBtn').onclick = () => {
    document.getElementById('hud').style.display = 'none'; document.getElementById('minimapWrapper').style.display = 'none';
    showScreen('mainMenuScreen'); gameState = 'MENU';
  };
}

function getPartySize() {
  return isMultiplayer ? Math.max(1, Object.keys(lobbyPlayers || {}).length || 1) : 1;
}

function updatePartyReviveDisplay() {
  const reviveEl = document.getElementById('partyReviveDisplay');
  if (!reviveEl) return;
  const value = isMultiplayer ? Math.max(0, sharedRevivesRemaining) : 0;
  reviveEl.innerText = `復活：${value}`;
  reviveEl.style.color = value > 0 ? '#facc15' : '#f87171';
}

function triggerPartyFailure() {
  if (sharedChallengeFailed) return;
  sharedChallengeFailed = true;
  const endTitle = document.getElementById('endTitle');
  const endDesc = document.getElementById('endDesc');
  if (endTitle) endTitle.innerText = '挑戰失敗';
  if (endDesc) endDesc.innerHTML = `隊伍共享復活次數已耗盡<br>所有玩家已返回主選單`;
  showScreen('endModal');
  setTimeout(() => {
    sharedChallengeFailed = false;
    showScreen('mainMenuScreen');
    gameState = 'MENU';
    document.getElementById('hud').style.display = 'none';
    document.getElementById('minimapWrapper').style.display = 'none';
    if (currentRoomCode) {
      isMultiplayer = false; isRoomHost = false; isMyReady = false; currentRoomCode = '';
      peers = {}; lobbyPlayers = {};
      leaveRemoteRoom();
    }
  }, 1800);
}

function syncPartyRoomState(force = false) {
  if (!isMultiplayer || !currentRoomCode) return;
  const partySize = getPartySize();
  const nextRevives = Math.max(0, force ? partySize : Number(sharedRevivesRemaining || partySize));
  const payload = {
    isPlaying: true,
    mapKey: selectedMapKey,
    revivesRemaining: nextRevives,
    partyExp: Number(sharedPartyExp || player.exp || 0),
    partyGold: Number(sharedPartyGold || sessionGold || 0),
    drops: Array.isArray(sharedDrops) ? sharedDrops.slice(-60) : [],
    challengeFailed: sharedChallengeFailed
  };
  updateRoomStatus(payload);
}

function joinLobby(code, asHost) {
  if(!code) return;
  initAudio(); currentRoomCode = code; isRoomHost = asHost; isMyReady = asHost;

  const localSelf = { id: myPeerId, name: myName, heroKey: selectedHeroKey, isHost: asHost, isReady: asHost, x: 0, y: 0, hp: 100, maxHp: 100, facingX: 1, level: 1 };
  lobbyPlayers = { [myPeerId]: localSelf };
  showLobbyUI();

  joinRemoteRoom(code, localSelf, (playersData, status) => {
    lobbyPlayers = playersData || { [myPeerId]: localSelf };
    if (status && typeof status.revivesRemaining === 'number') sharedRevivesRemaining = status.revivesRemaining;
    if (status && typeof status.partyExp === 'number') sharedPartyExp = status.partyExp;
    if (status && typeof status.partyGold === 'number') sharedPartyGold = status.partyGold;
    if (status && Array.isArray(status.drops)) sharedDrops = status.drops;
    if (status && typeof status.challengeFailed === 'boolean') sharedChallengeFailed = status.challengeFailed;
    if (typeof sharedPartyGold === 'number') sessionGold = sharedPartyGold;
    if (sharedChallengeFailed) {
      triggerPartyFailure();
      return;
    }
    if (status && status.isPlaying && gameState !== 'PLAYING') {
      selectedMapKey = status.mapKey || 'dungeon';
      isMultiplayer = true;
      startGame();
    } else {
      handleRoomUpdate(playersData, peers);
      if (gameState === 'MENU') showLobbyUI();
    }
    updatePartyReviveDisplay();
  }, asHost).then((result) => {
    if (!result || !result.ok) {
      if (result && result.reason === 'ROOM_NOT_FOUND') {
        alert('此房間代碼不存在，請確認代碼後再加入。');
      } else if (result && result.reason === 'ROOM_EXISTS') {
        alert('此房間代碼已存在，請換另一個代碼。');
      } else if (result && result.reason === 'PERMISSION_DENIED') {
        alert('Firebase 資料庫權限被拒絕，請在 Firebase Realtime Database 設定 allow read, write: true（測試模式）後再試一次。');
      } else {
        alert('加入房間失敗，請重試。');
      }
      showScreen('multiMatchScreen');
      return;
    }
  }).catch((error) => {
    console.error('join room failed:', error);
    alert('加入房間失敗，請重試。');
    showScreen('multiMatchScreen');
  });
}

function showLobbyUI() {
  showScreen('multiLobbyScreen');
  document.getElementById('lobbyRoomCodeText').innerText = currentRoomCode;
  
  // 渲染大廳選角區
  renderLobbyCarousel(HEROES, selectedHeroKey, SpriteCanvasCache, (k) => {
    selectedHeroKey = k;
    if (lobbyPlayers[myPeerId]) lobbyPlayers[myPeerId].heroKey = k;
    syncLobbyState(isMyReady, selectedHeroKey);
    showLobbyUI(); // 重新渲染大廳
  });

  const hostBtn = document.getElementById('btnHostStartGame'), guestBtn = document.getElementById('btnGuestToggleReady');
  if (isRoomHost) {
    hostBtn.style.display = 'block'; guestBtn.style.display = 'none';
    const allReady = Object.values(lobbyPlayers).every(p => p.isHost || p.isReady);
    hostBtn.disabled = !allReady; hostBtn.innerHTML = allReady ? '<i class="pixel-icon" data-icon="ui_sword"></i> 開始戰鬥' : '⏳ 等待隊員準備...';
  } else {
    hostBtn.style.display = 'none'; guestBtn.style.display = 'block';
    guestBtn.innerHTML = isMyReady ? '<i class="pixel-icon" data-icon="ui_exit"></i> 取消準備' : '<i class="pixel-icon" data-icon="ui_ready"></i> 準備就緒';
  }
  renderAllPixelIcons();
  
  const container = document.getElementById('lobbyPlayerList'); container.innerHTML = '';
  document.getElementById('lobbyPlayerCount').innerText = Object.keys(lobbyPlayers).length;
  Object.values(lobbyPlayers).forEach(p => {
    const card = document.createElement('div'); card.className = `lobby-player-card ${p.isHost ? 'host' : (p.isReady ? 'ready' : '')}`;
    const cvs = document.createElement('canvas'); cvs.width = 24; cvs.height = 30; cvs.style.width = '32px'; cvs.style.height = '32px';
    const sprite = SpriteCanvasCache[`hero_${p.heroKey}`];
    if(sprite) cvs.getContext('2d').drawImage(sprite, 0, 0, 24, 30);
    const nameEl = document.createElement('div');
    nameEl.style.fontSize = '11px'; nameEl.style.fontWeight = 'bold'; nameEl.style.color = '#f8fafc';
    nameEl.innerText = p.name.split(' ')[0];
    const tag = p.isHost ? '👑 房主' : (p.isReady ? '🟢 已準備' : '🟡 準備中');
    const tagEl = document.createElement('span');
    tagEl.className = `lobby-status-tag ${p.isHost ? 'host' : (p.isReady ? 'ready' : 'waiting')}`;
    tagEl.innerText = tag;
    card.appendChild(cvs); card.appendChild(nameEl); card.appendChild(tagEl);
    container.appendChild(card);
  });
}

function startGame() {
  showScreen(null);
  const hud = document.getElementById('hud');
  const minimap = document.getElementById('minimapWrapper');
  const pauseBtn = document.getElementById('pauseBtn');
  if (hud) hud.style.display = 'flex';
  if (minimap) minimap.style.display = 'block';
  if (pauseBtn) pauseBtn.innerHTML = '<i class="pixel-icon" data-icon="ui_pause"></i>';
  const endModal = document.getElementById('endModal');
  const upgradeModal = document.getElementById('upgradeModal');
  if (endModal) endModal.classList.remove('active');
  if (upgradeModal) upgradeModal.classList.remove('active');
  peers = {};

  enemies = []; bullets = []; enemyProjectiles = []; gems = []; particles = []; floatingTexts = []; groundZones = []; lightningStrikes = [];
  killCount = 0; currentWave = 1; waveTimer = 40; enemySpawnCounter = 0;

  const hero = HEROES[selectedHeroKey];
  const hpBase = hero.baseHp * (1 + Talents.hp.level * Talents.hp.value);
  player = { 
    x: 0, y: 0, size: 24, hp: hpBase, maxHp: hpBase, speed: hero.baseSpeed * (1 + Talents.speed.level * Talents.speed.value), 
    level: 1, exp: 0, expNeeded: 5, facingX: 1, facingY: 0, invulnerableTimer: 0, attackPulse: 0,
    damageMult: 1 + Talents.dmg.level * Talents.dmg.value,
    cooldownMult: 1 - Talents.cooldown.level * Talents.cooldown.value,
    orbAngle: 0, laserTarget: null
  };

  Object.keys(WEAPONS).forEach(k => { WEAPONS[k].level = (k === hero.startingWeapon ? 1 : 0); WEAPONS[k].evolved = false; WEAPONS[k].timer = 0; });
  Object.keys(PASSIVES).forEach(k => PASSIVES[k].level = 0);

  if (isMultiplayer) {
    sharedPartyExp = player.exp;
    sharedPartyGold = sessionGold;
    sharedRevivesRemaining = Math.max(1, getPartySize());
    sharedDrops = [];
    sharedChallengeFailed = false;
    syncPartyRoomState(true);
  }
  updatePartyReviveDisplay();
  updateHpUI(player.hp, player.maxHp); updateExpUI(player.exp, player.expNeeded, player.level);
  updateGoldUI(sessionGold); updateEquipmentHUD(WEAPONS, PASSIVES);
  document.getElementById('heroBadge').innerText = hero.name.split(' ')[0];

  gameState = 'PLAYING';
  lastTime = performance.now();
}

function spawnEnemy() {
  const map = MAPS[selectedMapKey] || MAPS.dungeon;
  const angle = Math.random() * Math.PI * 2, dist = Math.max(window.innerWidth, window.innerHeight) * 0.65 + 50;
  const types = ['bat'];
  if (currentWave >= 2) types.push('archer');
  if (currentWave >= 4) types.push('brute', 'imp');
  if (currentWave >= 7) types.push('lich', 'ghost');
  if (currentWave >= 12) types.push('gargoyle');
  const type = types[Math.floor(Math.random() * types.length)];
  const hpConfig = { bat: 20, archer: 38, brute: 120, imp: 28, lich: 85, ghost: 45, gargoyle: 95 };
  const speedConfig = { bat: 2.2, archer: 1.4, brute: 1.1, imp: 2.6, lich: 1.2, ghost: 2.8, gargoyle: 1.5 };
  let hp = (hpConfig[type] || 25) * (1 + currentWave * 0.28) * map.enemyHp;

  enemies.push({ x: player.x + Math.cos(angle)*dist, y: player.y + Math.sin(angle)*dist, type, hp, maxHp: hp, speed: (speedConfig[type] || 1.5) * map.enemySpeed, radius: (type === 'brute' || type === 'lich') ? 18 : 12, damage: 12 + Math.floor(currentWave * 1.5), shootTimer: 0, slowTimer: 0, poisonTimer: 0 });
}

function damageEnemy(e, dmg, color = '#fff') {
  e.hp -= dmg;
  floatingTexts.push({ x: e.x, y: e.y - 10, text: Math.round(dmg), color, size: 14, life: 0.6, vy: -1.2 });
  playSound('hit');
  if (e.hp <= 0 && !e.dead) {
    e.dead = true; killCount++; totalKills++;
    const goldBonus = (1 + Talents.greed.level * Talents.greed.value) * (1 + PASSIVES.greed_pass.level * 0.3);
    const drop = Math.random() < 0.2 ? { x: e.x + 10, y: e.y, type: 'coin', val: Math.round(5 * goldBonus) } : { x: e.x, y: e.y, type: 'gem', val: (e.type==='brute' || e.type==='lich') ? 4 : 1 };
    gems.push({ ...drop, id: `${Date.now()}-${Math.random()}` });
    if (isMultiplayer) {
      sharedDrops = [...sharedDrops, { ...drop, id: `${Date.now()}-${Math.random()}` }].slice(-60);
      syncPartyRoomState(true);
    }
    checkAchievements();
  }
}

function addExp(amount) {
  if (isMultiplayer) {
    sharedPartyExp += amount;
    player.exp = sharedPartyExp;
    syncPartyRoomState(true);
  } else {
    player.exp += amount;
  }
  playSound('gem');
  if (player.exp >= player.expNeeded) {
    player.exp -= player.expNeeded; player.level++; player.expNeeded = Math.round(player.expNeeded * 1.4 + 3);
    showUpgradeMenu();
  }
  updateExpUI(player.exp, player.expNeeded, player.level);
}

function showEndScreen() {
  const endTitle = document.getElementById('endTitle');
  const endDesc = document.getElementById('endDesc');
  endTitle.innerText = '戰鬥結束';
  endDesc.innerHTML = `擊殺數：${killCount}<br>最高波次：${highestWave}<br>本局金幣：${sessionGold}`;
  showScreen('endModal');
}

function showUpgradeMenu() {
  gameState = 'UPGRADE'; playSound('levelup');
  const options = [];
  Object.keys(WEAPONS).forEach(k => {
    const w = WEAPONS[k];
    if (w.level >= w.maxLevel && !w.evolved && PASSIVES[w.requiredPassive]?.level >= 1) {
      const evo = EVOLVED_WEAPONS[w.evolvesInto];
      options.push({ type: 'evolve', id: k, name: evo.name, iconKey: evo.iconKey, desc: evo.desc, apply: () => { w.evolved = true; hasEvolvedAny = true; } });
    } else if (w.level > 0 && w.level < w.maxLevel && !w.evolved) {
      options.push({ type: 'weapon', id: k, name: `${w.name} (LV ${w.level + 1})`, iconKey: w.iconKey, desc: '提升威力與射速', apply: () => w.level++ });
    } else if (w.level === 0) {
      options.push({ type: 'weapon', id: k, name: w.name, iconKey: w.iconKey, desc: w.desc, apply: () => w.level++ });
    }
  });
  Object.keys(PASSIVES).forEach(k => {
    const p = PASSIVES[k];
    if (p.level < p.maxLevel) options.push({ type: 'passive', id: k, name: `${p.name} (LV ${p.level + 1})`, iconKey: p.iconKey, desc: p.desc, apply: () => p.level++ });
  });

  const selected = options.sort(() => 0.5 - Math.random()).slice(0, 3);
  if (selected.length === 0) selected.push({ type: 'gold', name: '諸神賜福', iconKey: 'gold_coin', desc: '獲取 150 金幣', apply: () => { sessionGold += 150; updateGoldUI(sessionGold); } });
  
  renderUpgradeOptions(selected, (opt) => {
    opt.apply(); updateEquipmentHUD(WEAPONS, PASSIVES); saveGameProgress(); checkAchievements();
    showScreen(null); gameState = 'PLAYING'; lastTime = performance.now();
  });
  showScreen('upgradeModal');
}

function updateWeapons(dt) {
  const dmgBonus = player.damageMult * (1 + PASSIVES.power.level * 0.2), cdBonus = player.cooldownMult * Math.max(0.35, 1 - PASSIVES.tome.level * 0.12);
  const extra = PASSIVES.duplicator.level, area = 1 + PASSIVES.candle.level * 0.25;

  const w = WEAPONS.wand;
  if (w.level > 0) {
    w.timer += dt;
    if (w.timer >= (w.evolved?0.11:Math.max(0.18, 0.75-w.level*0.1))*cdBonus && enemies.length > 0) {
      w.timer = 0; player.attackPulse = 0.18; const t = enemies[0], a = Math.atan2(t.y-player.y, t.x-player.x);
      const cnt = (w.evolved?3:(1+Math.floor(w.level/2))) + extra;
      for(let i=0; i<cnt; i++) bullets.push({ x: player.x, y: player.y, vx: Math.cos(a+(i*0.16))*9, vy: Math.sin(a+(i*0.16))*9, radius: (w.evolved?7:5)*area, color: w.evolved?'#f59e0b':'#38bdf8', damage: (w.evolved?48:20+w.level*8)*dmgBonus, pierce: w.evolved?3:1, life: 1.8 });
    }
  }
  const o = WEAPONS.orbs;
  if (o.level > 0) {
    player.orbAngle += (o.evolved?4.5:2.5) * dt; o.timer += dt;
    if(o.timer >= 0.18) {
      o.timer = 0; player.attackPulse = 0.14; const cnt = (o.evolved?6:2+o.level)+extra, rad = (o.evolved?110:75)*area;
      for(let i=0; i<cnt; i++) {
        const ox = player.x + Math.cos(player.orbAngle + i*(Math.PI*2/cnt))*rad, oy = player.y + Math.sin(player.orbAngle + i*(Math.PI*2/cnt))*rad;
        enemies.forEach(e => { if(Math.hypot(e.x-ox, e.y-oy) < 16*area + e.radius) damageEnemy(e, (o.evolved?42:15+o.level*5)*dmgBonus, o.evolved?'#facc15':'#818cf8'); });
      }
    }
  }
  const d = WEAPONS.daggers;
  if (d.level > 0) {
    d.timer += dt;
    if (d.timer >= (d.evolved?0.22:Math.max(0.28, 1.0-d.level*0.14))*cdBonus) {
      d.timer = 0; player.attackPulse = 0.18; const a = Math.atan2(player.facingY||0, player.facingX||1), cnt = (d.evolved?14:1+d.level)+extra;
      for(let i=0; i<cnt; i++) {
        const ang = d.evolved ? (i/14)*Math.PI*2 : a + (i - (cnt-1)/2)*0.12;
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(ang)*12, vy: Math.sin(ang)*12, radius: (d.evolved?6:4)*area, color: d.evolved?'#a855f7':'#e2e8f0', damage: (d.evolved?42:18+d.level*6)*dmgBonus, pierce: d.evolved?999:2+Math.floor(d.level/2), life: 1.5 });
      }
    }
  }
  const t = WEAPONS.thunder;
  if (t.level > 0) {
    t.timer += dt;
    if (t.timer >= (t.evolved?0.55:Math.max(0.7, 2.0-t.level*0.25))*cdBonus && enemies.length > 0) {
      t.timer = 0; player.attackPulse = 0.2; const cnt = (t.evolved?9:1+Math.floor(t.level/2))+extra;
      [...enemies].sort(()=>0.5-Math.random()).slice(0,cnt).forEach(e => { damageEnemy(e, (t.evolved?140:50+t.level*22)*dmgBonus, '#38bdf8'); lightningStrikes.push({ x: e.x, y: e.y, life: 0.18 }); });
    }
  }
  const wW = WEAPONS.whip;
  if (wW.level > 0) {
    wW.timer += dt;
    if (wW.timer >= (wW.evolved ? 0.42 : Math.max(0.52, 1.2 - wW.level * 0.12)) * cdBonus) {
      wW.timer = 0; player.attackPulse = 0.22;
      const angle = Math.atan2(player.facingY || 0, player.facingX || 1);
      [...enemies].forEach(e => {
        const dx = e.x - player.x, dy = e.y - player.y;
        const dist = Math.hypot(dx, dy);
        const targetAngle = Math.atan2(dy, dx);
        if (dist < (wW.evolved ? 170 : 120) && Math.abs(Math.atan2(Math.sin(targetAngle - angle), Math.cos(targetAngle - angle))) < (wW.evolved ? 1.2 : 0.8)) {
          damageEnemy(e, (wW.evolved ? 150 : 30 + wW.level * 16) * dmgBonus, '#f87171');
          lightningStrikes.push({ x: e.x, y: e.y, life: 0.14 });
        }
      });
    }
  }
  const b = WEAPONS.bow;
  if (b.level > 0) {
    b.timer += dt;
    if (b.timer >= (b.evolved?0.45:1.1-b.level*0.12)*cdBonus) {
      b.timer = 0; player.attackPulse = 0.18; const a = Math.atan2(player.facingY||0, player.facingX||1);
      bullets.push({ x: player.x, y: player.y, vx: Math.cos(a)*15, vy: Math.sin(a)*15, radius: (b.evolved?9:5)*area, color: '#fde047', damage: (b.evolved?120:45+b.level*18)*dmgBonus, pierce: b.evolved?999:2+b.level, life: 1.8 });
    }
  }
  const f = WEAPONS.flask;
  if (f.level > 0) {
    f.timer += dt;
    const poisonRange = (f.evolved ? 120 : 80) * area;
    if (f.timer >= (f.evolved ? 1.0 : Math.max(1.3, 2.2 - f.level * 0.2)) * cdBonus) {
      f.timer = 0;
      const target = [...enemies].sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0];
      if (target) {
        groundZones.push({ x: target.x, y: target.y, radius: poisonRange, type: 'poison', damage: (f.evolved ? 26 : 12 + f.level * 7) * dmgBonus, life: 4.2, color: 'rgba(34,197,94,0.28)' });
        lightningStrikes.push({ x: target.x, y: target.y, life: 0.12 });
      }
    }
  }
  const fr = WEAPONS.firering;
  if (fr.level > 0) {
    fr.timer += dt;
    if (fr.timer >= (fr.evolved?1.0:2.2-fr.level*0.2)*cdBonus) {
      fr.timer = 0; const rng = (fr.evolved?240:130)*area;
      enemies.forEach(e => { if(Math.hypot(e.x-player.x, e.y-player.y) < rng) damageEnemy(e, (fr.evolved?95:30+fr.level*12)*dmgBonus, '#f97316'); });
    }
  }
  const frost = WEAPONS.frost;
  if (frost.level > 0) {
    frost.timer += dt;
    if (frost.timer >= (frost.evolved ? 0.9 : Math.max(1.2, 2.0 - frost.level * 0.15)) * cdBonus) {
      frost.timer = 0;
      const radius = frost.evolved ? 160 : 95;
      enemies.forEach(e => {
        if (Math.hypot(e.x - player.x, e.y - player.y) < radius) {
          damageEnemy(e, (frost.evolved ? 88 : 18 + frost.level * 10) * dmgBonus, '#67e8f9');
          e.slowTimer = Math.max(e.slowTimer || 0, frost.evolved ? 2.0 : 1.2);
        }
      });
    }
  }
  const laser = WEAPONS.laser;
  if (laser.level > 0) {
    laser.timer += dt;
    if (laser.timer >= (laser.evolved ? 0.18 : Math.max(0.35, 0.9 - laser.level * 0.08)) * cdBonus && enemies.length > 0) {
      laser.timer = 0; player.attackPulse = 0.16;
      const target = enemies.reduce((best, e) => {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (!best || d < best.dist) return { e, dist: d };
        return best;
      }, null);
      if (target) {
        const ang = Math.atan2(target.e.y - player.y, target.e.x - player.x);
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(ang) * 18, vy: Math.sin(ang) * 18, radius: laser.evolved ? 9 : 6, color: '#38bdf8', damage: (laser.evolved ? 150 : 35 + laser.level * 15) * dmgBonus, pierce: laser.evolved ? 9 : 4, life: 1.5, type: 'laser' });
      }
    }
  }
  const spear = WEAPONS.spear;
  if (spear.level > 0) {
    spear.timer += dt;
    if (spear.timer >= (spear.evolved ? 0.5 : Math.max(0.8, 1.7 - spear.level * 0.12)) * cdBonus) {
      spear.timer = 0; player.attackPulse = 0.2;
      const angles = spear.evolved ? Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2) : [-0.9, -0.3, 0.3, 0.9];
      angles.forEach((a) => {
        bullets.push({ x: player.x, y: player.y, vx: Math.cos(a) * 12, vy: Math.sin(a) * 12, radius: spear.evolved ? 9 : 5.5, color: '#facc15', damage: (spear.evolved ? 130 : 28 + spear.level * 12) * dmgBonus, pierce: spear.evolved ? 6 : 2, life: 1.4 });
      });
    }
  }
  const skull = WEAPONS.skull;
  if (skull.level > 0) {
    skull.timer += dt;
    if (skull.timer >= (skull.evolved ? 0.9 : Math.max(1.3, 2.2 - skull.level * 0.16)) * cdBonus && enemies.length > 0) {
      skull.timer = 0; player.attackPulse = 0.16;
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      if (target) {
        bullets.push({ x: player.x, y: player.y, vx: (target.x - player.x) / Math.max(1, Math.hypot(target.x - player.x, target.y - player.y)) * 10, vy: (target.y - player.y) / Math.max(1, Math.hypot(target.x - player.x, target.y - player.y)) * 10, radius: skull.evolved ? 10 : 6, color: '#c084fc', damage: (skull.evolved ? 110 : 24 + skull.level * 14) * dmgBonus, pierce: 2, life: 1.6, type: 'skull' });
      }
    }
  }
}

function update(dt) {
  let mx = 0, my = 0;
  if (joystick.active) { mx = joystick.dx; my = joystick.dy; } 
  else {
    if (keys.w) my -= 1; if (keys.s) my += 1;
    if (keys.a) mx -= 1; if (keys.d) mx += 1;
    if (mx !== 0 && my !== 0) { mx *= Math.SQRT1_2; my *= Math.SQRT1_2; }
  }
  if (mx !== 0 || my !== 0) { player.facingX = mx; player.facingY = my; }
  
  const curSpd = player.speed * (1 + PASSIVES.boots.level * 0.15);
  player.x += mx * curSpd * 60 * dt; player.y += my * curSpd * 60 * dt;
  camera.x = player.x - window.innerWidth / 2; camera.y = player.y - window.innerHeight / 2;
  if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;
  if (player.attackPulse > 0) player.attackPulse = Math.max(0, player.attackPulse - dt);
  if (PASSIVES.heart.level > 0) player.hp = Math.min(player.maxHp, player.hp + PASSIVES.heart.level * 1.5 * dt);

  if (isMultiplayer) {
    Object.keys(peers).forEach(id => {
      const p = peers[id];
      if (p.targetX !== undefined && p.targetY !== undefined) {
        const dx = p.targetX - p.currentX, dy = p.targetY - p.currentY;
        const dist = Math.hypot(dx, dy);
        if (dist > 120) {
          p.currentX = p.targetX; p.currentY = p.targetY;
        } else {
          const lerp = 0.18;
          p.currentX += dx * lerp;
          p.currentY += dy * lerp;
        }
        p.attackPulse = Math.max(0, (p.attackPulse || 0) - dt * 2.2);
      }
    });
    syncTimer += dt;
    if (syncTimer >= 0.05) { syncPlayerPosition(player.x, player.y, player.hp, player.facingX, player.level, player.maxHp, player.attackPulse); syncTimer = 0; }
  }

  const mag = 100 * (1 + PASSIVES.magnet.level * 0.35);
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i], d = Math.hypot(player.x - g.x, player.y - g.y);
    if (d < mag) { const a = Math.atan2(player.y - g.y, player.x - g.x); g.x += Math.cos(a)*10*60*dt; g.y += Math.sin(a)*10*60*dt; }
    if (d < 20) {
      if (g.type === 'coin') {
        const newGold = (isMultiplayer ? sharedPartyGold : sessionGold) + g.val;
        if (isMultiplayer) {
          sharedPartyGold = newGold;
          sessionGold = newGold;
          sharedDrops = sharedDrops.filter(drop => drop.id !== g.id);
          syncPartyRoomState(true);
        } else {
          sessionGold += g.val;
        }
        playSound('coin'); updateGoldUI(sessionGold);
      } else {
        addExp(g.val * (1 + PASSIVES.crown.level * 0.15));
        if (isMultiplayer) {
          sharedDrops = sharedDrops.filter(drop => drop.id !== g.id);
          syncPartyRoomState(true);
        }
      }
      gems.splice(i, 1);
    }
  }

  if (isMultiplayer && Array.isArray(sharedDrops)) {
    sharedDrops.forEach(drop => {
      const exists = gems.some(g => g.id === drop.id);
      if (!exists) {
        gems.push({ ...drop, id: drop.id, x: drop.x, y: drop.y, val: drop.val, type: drop.type });
      }
    });
  }

  updateWeapons(dt);

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]; b.x += b.vx*60*dt; b.y += b.vy*60*dt; b.life -= dt;
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) { damageEnemy(e, b.damage, b.color); b.pierce--; if (b.pierce <= 0) { hit = true; break; } }
    }
    if (hit || b.life <= 0) bullets.splice(i, 1);
  }

  enemySpawnCounter += dt;
  if (enemySpawnCounter >= Math.max(0.15, 0.9 - currentWave*0.01) && enemies.length < 150) { spawnEnemy(); enemySpawnCounter = 0; }
  
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    if (e.dead) { enemies.splice(i, 1); continue; }
    const dist = Math.hypot(player.x - e.x, player.y - e.y), a = Math.atan2(player.y - e.y, player.x - e.x);
    if (e.type === 'archer') {
      if (dist > 200) { e.x += Math.cos(a)*e.speed*60*dt; e.y += Math.sin(a)*e.speed*60*dt; }
      else if (dist < 140) { e.x -= Math.cos(a)*e.speed*60*dt; e.y -= Math.sin(a)*e.speed*60*dt; }
      e.shootTimer += dt;
      if(e.shootTimer > 2) { e.shootTimer = 0; enemyProjectiles.push({ x: e.x, y: e.y, vx: Math.cos(a)*4.5, vy: Math.sin(a)*4.5, radius: 5, color: '#ef4444', damage: 14, life: 3 }); }
    } else if (e.type === 'imp') {
      e.x += Math.cos(a)*e.speed*60*dt; e.y += Math.sin(a)*e.speed*60*dt;
      if (dist < 40) { e.dead = true; if(player.invulnerableTimer<=0) { player.hp -= 28; player.invulnerableTimer=0.4; } }
    } else {
      e.x += Math.cos(a)*e.speed*60*dt; e.y += Math.sin(a)*e.speed*60*dt;
    }
    
    if (dist < player.size/2 + e.radius && player.invulnerableTimer <= 0) {
      player.hp -= Math.max(1, e.damage - PASSIVES.armor.level*3); player.invulnerableTimer = 0.45;
      updateHpUI(player.hp, player.maxHp); playSound('hit');
      if (player.hp <= 0) {
        if (isMultiplayer) {
          const partySize = Math.max(1, getPartySize());
          if (sharedRevivesRemaining > 0) {
            sharedRevivesRemaining = Math.max(0, sharedRevivesRemaining - 1);
            player.hp = player.maxHp * 0.6;
            player.x = 0; player.y = 0; player.invulnerableTimer = 2.5;
            floatingTexts.push({ x: player.x, y: player.y - 24, text: `復活！剩餘 ${sharedRevivesRemaining} 次`, color: '#facc15', size: 16, life: 1.5, vy: -1.5 });
            updateHpUI(player.hp, player.maxHp);
            updatePartyReviveDisplay();
            syncPartyRoomState(true);
            return;
          }
          triggerPartyFailure();
          return;
        }
        gameState = 'GAMEOVER'; showEndScreen(); saveGameProgress();
      }
    }
  }

  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = enemyProjectiles[i]; ep.x += ep.vx*60*dt; ep.y += ep.vy*60*dt; ep.life -= dt;
    if (Math.hypot(ep.x - player.x, ep.y - player.y) < ep.radius + player.size/2 && player.invulnerableTimer <= 0) {
      player.hp -= Math.max(1, ep.damage - PASSIVES.armor.level*3); player.invulnerableTimer = 0.4; updateHpUI(player.hp, player.maxHp);
      enemyProjectiles.splice(i, 1);
      if (player.hp <= 0) {
        if (isMultiplayer) {
          if (sharedRevivesRemaining > 0) {
            sharedRevivesRemaining = Math.max(0, sharedRevivesRemaining - 1);
            player.hp = player.maxHp * 0.6;
            player.x = 0; player.y = 0; player.invulnerableTimer = 2.5;
            floatingTexts.push({ x: player.x, y: player.y - 24, text: `復活！剩餘 ${sharedRevivesRemaining} 次`, color: '#facc15', size: 16, life: 1.5, vy: -1.5 });
            updateHpUI(player.hp, player.maxHp);
            updatePartyReviveDisplay();
            syncPartyRoomState(true);
            continue;
          }
          triggerPartyFailure();
          return;
        }
        gameState = 'GAMEOVER'; showEndScreen();
      }
      continue;
    }
    if (ep.life <= 0) enemyProjectiles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) { floatingTexts[i].y += floatingTexts[i].vy*60*dt; floatingTexts[i].life -= dt; if (floatingTexts[i].life <= 0) floatingTexts.splice(i, 1); }
  for (let i = lightningStrikes.length - 1; i >= 0; i--) { lightningStrikes[i].life -= dt; if (lightningStrikes[i].life <= 0) lightningStrikes.splice(i, 1); }

  waveTimer -= dt;
  if (waveTimer <= 0) { currentWave++; waveTimer = 40; if (currentWave > highestWave) highestWave = currentWave; saveGameProgress(); playSound('levelup'); }
  updateHUD(waveTimer, currentWave, 100, killCount);
}

function drawMinimap() {
  const canvas = document.getElementById('minimapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const range = 260;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(11, 17, 32, 0.92)';
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, Math.min(w, h) / 2 - 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  const worldMinX = player.x - range;
  const worldMaxX = player.x + range;
  const worldMinY = player.y - range;
  const worldMaxY = player.y + range;
  const scaleX = (w - 12) / (worldMaxX - worldMinX || 1);
  const scaleY = (h - 12) / (worldMaxY - worldMinY || 1);

  const toMini = (x, y) => ({
    x: ((x - worldMinX) * scaleX) + 6,
    y: ((y - worldMinY) * scaleY) + 6
  });

  const drawDot = (x, y, color, radius = 2.2) => {
    const p = toMini(x, y);
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  enemies.forEach(e => {
    if (e.dead) return;
    const dx = e.x - player.x, dy = e.y - player.y;
    if (Math.abs(dx) <= range && Math.abs(dy) <= range) drawDot(e.x, e.y, '#ef4444', 2.6);
  });

  gems.forEach(g => {
    if (Math.abs(g.x - player.x) <= range && Math.abs(g.y - player.y) <= range) {
      drawDot(g.x, g.y, g.type === 'coin' ? '#facc15' : '#38bdf8', g.type === 'coin' ? 2.8 : 2.4);
    }
  });

  const playerPos = toMini(player.x, player.y);
  ctx.beginPath();
  ctx.arc(playerPos.x, playerPos.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '9px monospace';
  ctx.fillText(`Gold ${sessionGold}`, 6, 12);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`EXP ${Math.round((player.exp / player.expNeeded) * 100)}%`, 6, 24);
}

function draw() {
  const canvas = document.getElementById('gameCanvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (gameState !== 'PLAYING') return;

  ctx.save(); ctx.translate(-camera.x, -camera.y);
  drawMap(ctx, camera, canvas.width, canvas.height, MAPS[selectedMapKey] || MAPS.dungeon);
  gems.forEach(g => { ctx.beginPath(); ctx.arc(g.x, g.y, g.type==='coin'?4.5:4, 0, Math.PI*2); ctx.fillStyle = g.type==='coin'?'#facc15':'#38bdf8'; ctx.fill(); });
  groundZones.forEach(z => {
    ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fillStyle = z.color; ctx.fill();
  });

  if (isMultiplayer) {
    const now = Date.now();
    Object.keys(peers).forEach(pid => {
      const p = peers[pid];
      if (now - p.lastSeen < 3000 && p.currentX !== undefined) {
        ctx.save(); ctx.translate(p.currentX, p.currentY);
        if (p.facingX < 0) ctx.scale(-1, 1);
        const spr = SpriteCanvasCache[`hero_${p.heroKey}`] || SpriteCanvasCache.peerPlayer;
        if (spr) ctx.drawImage(spr, -spr.width / 2, -spr.height / 2);
        if ((p.attackPulse || 0) > 0.02) {
          const pulse = p.attackPulse || 0;
          ctx.beginPath();
          ctx.arc(0, 0, 18 + pulse * 40, -0.7, 0.7);
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.3 + pulse * 1.2})`;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.scale(p.facingX < 0 ? -1 : 1, 1);
        ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#10b981'; ctx.textAlign = 'center'; ctx.fillText(p.name.split(' ')[0], 0, -22);
        ctx.restore();
      }
    });
  }

  enemies.forEach(e => {
    ctx.save(); ctx.translate(e.x, e.y);
    const spr = SpriteCanvasCache[e.type] || SpriteCanvasCache.bat;
    if(spr) ctx.drawImage(spr, -spr.width/2, -spr.height/2);
    if (e.slowTimer > 0) {
      ctx.beginPath(); ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(103,232,249,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    }
    if (e.poisonTimer > 0) {
      ctx.beginPath(); ctx.arc(0, 0, e.radius + 4, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(34,197,94,0.7)'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(-e.radius, -e.radius-8, e.radius*2, 4);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-e.radius, -e.radius-8, (e.hp/e.maxHp)*e.radius*2, 4);
    ctx.restore();
  });

  ctx.save(); ctx.translate(player.x, player.y);
  if(player.invulnerableTimer > 0 && Math.floor(Date.now()/80)%2===0) ctx.globalAlpha = 0.4;
  if (player.facingX < 0) ctx.scale(-1, 1);
  const hSpr = SpriteCanvasCache[`hero_${selectedHeroKey}`];
  if(hSpr) ctx.drawImage(hSpr, -hSpr.width/2, -hSpr.height/2);

  const o = WEAPONS.orbs;
  if (o.level > 0) {
    ctx.scale(player.facingX < 0 ? -1 : 1, 1);
    const cnt = (o.evolved?6:2+o.level)+PASSIVES.duplicator.level, rad = (o.evolved?110:75)*(1+PASSIVES.candle.level*0.25);
    for(let i=0; i<cnt; i++) {
      ctx.beginPath(); ctx.arc(Math.cos(player.orbAngle + i*(Math.PI*2/cnt))*rad, Math.sin(player.orbAngle + i*(Math.PI*2/cnt))*rad, o.evolved?10:7, 0, Math.PI*2); ctx.fillStyle = o.evolved?'#facc15':'#818cf8'; ctx.fill();
    }
  }
  ctx.restore();

  bullets.forEach(b => { ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2); ctx.fillStyle = b.color; ctx.fill(); });
  enemyProjectiles.forEach(ep => { ctx.beginPath(); ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI*2); ctx.fillStyle = ep.color; ctx.fill(); });
  lightningStrikes.forEach(l => { ctx.beginPath(); ctx.moveTo(l.x, l.y-280); ctx.lineTo(l.x-12, l.y-140); ctx.lineTo(l.x, l.y); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 4; ctx.stroke(); });
  floatingTexts.forEach(ft => { ctx.font = `bold ${ft.size||14}px 'Courier New'`; ctx.textAlign = 'center'; ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x, ft.y); });

  ctx.restore();
  drawMinimap();
}

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  if (gameState === 'PLAYING') update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}