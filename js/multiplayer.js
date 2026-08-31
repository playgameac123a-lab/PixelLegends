import { app } from './firebase-config.js';
import { getDatabase, ref, get, set, onValue, update, remove, onDisconnect, off } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const db = getDatabase(app);
let currentRoomRef = null;
let myPlayerRef = null;
let myPlayerId = null;
let currentRoomListener = null;

export async function joinRemoteRoom(roomCode, playerData, onRoomUpdate, isHost = false) {
  myPlayerId = playerData.id;

  if (currentRoomRef && currentRoomListener) {
    off(currentRoomRef, 'value', currentRoomListener);
  }

  currentRoomRef = ref(db, `rooms/${roomCode}`);
  myPlayerRef = ref(db, `rooms/${roomCode}/players/${playerData.id}`);

  const roomSnapshot = await get(currentRoomRef);

  if (isHost) {
    if (roomSnapshot.exists()) {
      return { ok: false, reason: 'ROOM_EXISTS' };
    }
    await set(currentRoomRef, { status: { isPlaying: false, mapKey: 'dungeon' }, players: {} });
  } else if (!roomSnapshot.exists()) {
    return { ok: false, reason: 'ROOM_NOT_FOUND' };
  }

  onDisconnect(myPlayerRef).remove();
  await set(myPlayerRef, playerData);

  currentRoomListener = onValue(currentRoomRef, (snapshot) => {
    const data = snapshot.val() || {};
    const players = data.players || {};
    const status = data.status || { isPlaying: false, mapKey: 'dungeon' };
    onRoomUpdate(players, status);
  });

  return { ok: true, roomCode };
}

export function handleRoomUpdate(playersData, localPeers) {
  const now = Date.now();
  Object.keys(playersData).forEach(id => {
    if (id === myPlayerId) return;
    const remoteData = playersData[id];
    if (!localPeers[id]) {
      localPeers[id] = { ...remoteData, currentX: remoteData.x, currentY: remoteData.y, targetX: remoteData.x, targetY: remoteData.y };
    } else {
      localPeers[id].targetX = remoteData.x; localPeers[id].targetY = remoteData.y;
      localPeers[id].hp = remoteData.hp; localPeers[id].maxHp = remoteData.maxHp || 100;
      localPeers[id].facingX = remoteData.facingX; localPeers[id].level = remoteData.level || 1;
      localPeers[id].lastSeen = now;
    }
  });
}

export function syncPlayerPosition(x, y, hp, facingX, level, maxHp) {
  if (!myPlayerRef) return;
  update(myPlayerRef, { x, y, hp, maxHp, facingX, level, lastSeen: Date.now() });
}

// 新增：同步大廳中的選角與準備狀態
export function syncLobbyState(isReady, heroKey) {
  if (!myPlayerRef) return;
  update(myPlayerRef, { isReady, heroKey });
}

// 新增：房主觸發開始遊戲
export function setRoomPlayingStatus(isPlaying, mapKey) {
  if (!currentRoomRef) return;
  update(currentRoomRef, { status: { isPlaying, mapKey } });
}

export function leaveRemoteRoom() {
  if (currentRoomRef && currentRoomListener) {
    off(currentRoomRef, 'value', currentRoomListener);
  }
  if (myPlayerRef) remove(myPlayerRef);
  currentRoomRef = null; myPlayerRef = null; myPlayerId = null; currentRoomListener = null;
}