export const MAPS = {
  dungeon: { id: 'dungeon', name: '深淵遺蹟 (護眼古石)', desc: '深沉暗灰板岩地磚與柔和石紋，怪物分佈均衡。', baseColor: '#090d16', tileColor1: '#0e1524', tileColor2: '#121a2c', borderAlpha: 0.08, particleType: 'dust', enemySpeed: 1.0, enemyHp: 1.0 },
  snowfield: { id: 'snowfield', name: '寒夜霜谷 (沉靜冰岩)', desc: '柔和深藍玄武岩與薄霧冰紋，暴雪使玩家移速 -10%，暴擊率 +25%。', baseColor: '#070f1a', tileColor1: '#0c1828', tileColor2: '#102035', borderAlpha: 0.09, particleType: 'snow', enemySpeed: 0.9, enemyHp: 1.2 },
  inferno: { id: 'inferno', name: '餘燼黑曜 (暗火焦土)', desc: '低飽和黑曜石層與柔和暗紅暗湧，金幣掉落翻倍！', baseColor: '#120808', tileColor1: '#1a0d0d', tileColor2: '#221111', borderAlpha: 0.08, particleType: 'ember', enemySpeed: 1.2, enemyHp: 1.35 }
};

export const HEROES = {
  knight: { id: 'knight', name: '聖殿騎士 亞瑟', icon: 'wand', baseHp: 120, baseSpeed: 3.5, startingWeapon: 'orbs', weaponName: '聖靈光球', unlocked: true, traitDesc: '【堅毅守護】生命上限 +20%，初始自帶【聖靈光球】。', colorMap: { 'H': '#1e293b', 'F': '#38bdf8', 'S': '#fde047', 'W': '#ffffff', 'A': '#94a3b8', 'B': '#0284c7', 'L': '#1e293b' } },
  mage: { id: 'mage', name: '秘法使者 艾琳', icon: 'wand', baseHp: 80, baseSpeed: 3.8, startingWeapon: 'wand', weaponName: '奧術飛彈', unlocked: true, traitDesc: '【奧術狂湧】冷卻 -15%，傷害 +10%，初始【奧術飛彈】。', colorMap: { 'H': '#581c87', 'F': '#c084fc', 'S': '#fde047', 'W': '#ffffff', 'A': '#e879f9', 'B': '#9333ea', 'L': '#3b0764' } },
  rogue: { id: 'rogue', name: '暗影行者 影刃', icon: 'daggers', baseHp: 95, baseSpeed: 4.3, startingWeapon: 'daggers', weaponName: '幻影飛刀', unlocked: true, traitDesc: '【疾影突襲】移速 +20%，拾取範圍 +30%，初始【幻影飛刀】。', colorMap: { 'H': '#064e3b', 'F': '#34d399', 'S': '#fde047', 'W': '#ffffff', 'A': '#6ee7b7', 'B': '#059669', 'L': '#022c22' } },
  storm: { id: 'storm', name: '風暴使徒 索爾', icon: 'thunder', baseHp: 100, baseSpeed: 3.6, startingWeapon: 'thunder', weaponName: '落雷術', unlocked: true, traitDesc: '【雷霆天罰】全域雷擊傷害 +30%，初始【落雷術】。', colorMap: { 'H': '#172554', 'F': '#facc15', 'S': '#fde047', 'W': '#ffffff', 'A': '#60a5fa', 'B': '#1d4ed8', 'L': '#0f172a' } },
  vampire: { id: 'vampire', name: '暗夜伯爵 弗拉德', icon: 'whip', baseHp: 110, baseSpeed: 3.7, startingWeapon: 'whip', weaponName: '血色荊棘', unlocked: false, unlockReq: '擊殺 500 隻魔物解鎖', traitDesc: '【血族汲取】擊殺敵人 5% 機率吸血 1 HP，初始【血色荊棘】。', colorMap: { 'H': '#450a0a', 'F': '#ef4444', 'S': '#e2e8f0', 'W': '#f87171', 'A': '#991b1b', 'B': '#7f1d1d', 'L': '#1c1917' } },
  ranger: { id: 'ranger', name: '森之巡者 萊拉', icon: 'bow', baseHp: 90, baseSpeed: 4.1, startingWeapon: 'bow', weaponName: '神聖長弓', unlocked: false, unlockReq: '生存突破第 5 波解鎖', traitDesc: '【精準射擊】全投射物穿透 +1，初始【神聖長弓】。', colorMap: { 'H': '#14532d', 'F': '#4ade80', 'S': '#fde047', 'W': '#ffffff', 'A': '#86efac', 'B': '#16a34a', 'L': '#052e16' } },
  alchemist: { id: 'alchemist', name: '煉金大師 帕拉塞', icon: 'flask', baseHp: 95, baseSpeed: 3.6, startingWeapon: 'flask', weaponName: '劇毒藥劑', unlocked: false, unlockReq: '累計獲得 300 金幣解鎖', traitDesc: '【劇毒擴散】範圍效果體積 +30%，初始【劇毒藥劑】。', colorMap: { 'H': '#312e81', 'F': '#a855f7', 'S': '#fde047', 'W': '#ffffff', 'A': '#c084fc', 'B': '#6366f1', 'L': '#1e1b4b' } },
  ignis: { id: 'ignis', name: '烈焰魔靈 艾格尼斯', icon: 'firering', baseHp: 100, baseSpeed: 3.7, startingWeapon: 'firering', weaponName: '烈焰之環', unlocked: false, unlockReq: '完成首次超武進化解鎖', traitDesc: '【烈火焚天】燃燒爆炸傷害 +25%，初始【烈焰之環】。', colorMap: { 'H': '#7c2d12', 'F': '#fb923c', 'S': '#fed7aa', 'W': '#ffffff', 'A': '#fdba74', 'B': '#ea580c', 'L': '#431407' } },
  frost: { id: 'frost', name: '極寒冰女 希瓦娜', icon: 'frost', baseHp: 85, baseSpeed: 3.7, startingWeapon: 'frost', weaponName: '極寒霜星', unlocked: false, unlockReq: '生存突破第 15 波解鎖', traitDesc: '【霜凍領域】攻擊緩速敵人 35%，初始【極寒霜星】。', colorMap: { 'H': '#083344', 'F': '#67e8f9', 'S': '#cffafe', 'W': '#ffffff', 'A': '#a5f3fc', 'B': '#06b6d4', 'L': '#164e63' } },
  cyborg: { id: 'cyborg', name: '殲滅機兵 雷克斯', icon: 'laser', baseHp: 130, baseSpeed: 3.4, startingWeapon: 'laser', weaponName: '離子射線', unlocked: false, unlockReq: '擊殺 1500 隻魔物解鎖', traitDesc: '【超限重武】所有武器彈幕發射數量 +1，初始【離子射線】。', colorMap: { 'H': '#334155', 'F': '#94a3b8', 'S': '#38bdf8', 'W': '#f43f5e', 'A': '#64748b', 'B': '#475569', 'L': '#0f172a' } },
  valkyrie: { id: 'valkyrie', name: '女武神 瓦爾基麗', icon: 'spear', baseHp: 115, baseSpeed: 3.9, startingWeapon: 'spear', weaponName: '聖芒長矛', unlocked: false, unlockReq: '生存突破第 30 波解鎖', traitDesc: '【天界神威】免疫碰撞硬直，護甲 +3，初始【聖芒長矛】。', colorMap: { 'H': '#713f12', 'F': '#facc15', 'S': '#fef08a', 'W': '#ffffff', 'A': '#fde047', 'B': '#ca8a04', 'L': '#422006' } },
  grim: { id: 'grim', name: '死靈術士 格里姆', icon: 'skull', baseHp: 90, baseSpeed: 3.5, startingWeapon: 'skull', weaponName: '幽冥厲鬼', unlocked: false, unlockReq: '擊敗第 50 波泰坦領主解鎖', traitDesc: '【幽魂召喚】擊殺敵人召喚自爆冤魂，初始【幽冥厲鬼】。', colorMap: { 'H': '#09090b', 'F': '#27272a', 'S': '#e4e4e7', 'W': '#a855f7', 'A': '#52525b', 'B': '#18181b', 'L': '#000000' } }
};

export const WEAPONS = {
  wand: { id: 'wand', name: '奧術飛彈', iconKey: 'wand', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '發射自動索敵的奧術飛彈', evolvesInto: 'arcane_gatling', requiredPassive: 'tome' },
  orbs: { id: 'orbs', name: '聖靈光球', iconKey: 'orbs', level: 0, maxLevel: 5, evolved: false, timer: 0, desc: '圍繞自身旋轉的光球，阻擋粉碎近敵', evolvesInto: 'death_scythe', requiredPassive: 'power' },
  daggers: { id: 'daggers', name: '幻影飛刀', iconKey: 'daggers', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '朝移動方向疾速投擲貫穿飛刀', evolvesInto: 'thousand_blades', requiredPassive: 'boots' },
  thunder: { id: 'thunder', name: '落雷術', iconKey: 'thunder', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '召喚天雷猛烈轟炸隨機敵人', evolvesInto: 'storm_judgement', requiredPassive: 'duplicator' },
  whip: { id: 'whip', name: '血色荊棘', iconKey: 'whip', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '橫向揮擊血鞭，撕裂前方敵人', evolvesInto: 'blood_tear', requiredPassive: 'heart' },
  bow: { id: 'bow', name: '神聖長弓', iconKey: 'bow', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '蓄力朝前方射出強大貫穿光箭', evolvesInto: 'celestial_arrow', requiredPassive: 'clover' },
  flask: { id: 'flask', name: '劇毒藥劑', iconKey: 'flask', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '向地面投擲毒瓶，產生持續腐蝕毒池', evolvesInto: 'toxic_plague', requiredPassive: 'candle' },
  firering: { id: 'firering', name: '烈焰之環', iconKey: 'firering', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '週期性釋放全方位火焰衝擊波', evolvesInto: 'hellfire_nova', requiredPassive: 'crown' },
  frost: { id: 'frost', name: '極寒霜星', iconKey: 'frost', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '向四周發射冰晶碎片，大幅緩速敵人', evolvesInto: 'absolute_zero', requiredPassive: 'armor' },
  laser: { id: 'laser', name: '離子射線', iconKey: 'laser', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '朝最近敵人持續掃射高能貫穿雷射', evolvesInto: 'hyper_beam', requiredPassive: 'greed_pass' },
  spear: { id: 'spear', name: '聖芒長矛', iconKey: 'spear', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '向四周穿刺出聖光長矛', evolvesInto: 'divine_lance', requiredPassive: 'power' },
  skull: { id: 'skull', name: '幽冥厲鬼', iconKey: 'skull', level: 0, maxLevel: 5, timer: 0, evolved: false, desc: '召喚遊蕩死靈，追擊自爆', evolvesInto: 'soul_cataclysm', requiredPassive: 'crown' }
};

export const EVOLVED_WEAPONS = {
  arcane_gatling: { name: '滅世奧術機槍', iconKey: 'wand', desc: '極速連射高爆飛彈，命中引發範圍烈焰爆炸！' },
  death_scythe: { name: '永恆死神旋刃', iconKey: 'orbs', desc: '超大範圍旋刃，命中造成雙倍暴擊與吸血！' },
  thousand_blades: { name: '萬刃千芒風暴', iconKey: 'daggers', desc: '360度全方位無間斷發射無限穿透撕裂刃！' },
  storm_judgement: { name: '滅世審判雷暴', iconKey: 'thunder', desc: '全場降下連環天罰雷暴，毀滅一切魔物！' },
  blood_tear: { name: '血淚魔皇鞭', iconKey: 'whip', desc: '雙向超大範圍抽擊，大額吸血生命！' },
  celestial_arrow: { name: '天堂裁決聖矢', iconKey: 'bow', desc: '光束巨矢穿透全螢幕，百發百中全暴擊！' },
  toxic_plague: { name: '湮滅毒瘴瘟疫', iconKey: 'flask', desc: '劇毒沼澤覆蓋全場，迅速溶解一切生命！' },
  hellfire_nova: { name: '紅蓮業火日蝕', iconKey: 'firering', desc: '全螢幕日蝕火環爆發，全場燃燒毀滅！' },
  absolute_zero: { name: '絕對零度結界', iconKey: 'frost', desc: '全屏持續冰凍凍結敵人，碎冰二次爆發！' },
  hyper_beam: { name: '超次元湮滅光束', iconKey: 'laser', desc: '直通天際的貫通巨型雷射，掃射噴發金幣！' },
  divine_lance: { name: '女武神審判光矛', iconKey: 'spear', desc: '八方無限穿刺光矛，附帶神聖破甲！' },
  soul_cataclysm: { name: '萬魂歸宗滅世劫', iconKey: 'skull', desc: '召喚整支死靈軍團席捲全場！' }
};

export const PASSIVES = {
  crown: { id: 'crown', name: '智慧王冠', iconKey: 'crown', level: 0, maxLevel: 5, desc: '經驗值獲取加成 +15%' },
  tome: { id: 'tome', name: '秘術魔典', iconKey: 'tome', level: 0, maxLevel: 5, desc: '所有武器冷卻縮減 -12%' },
  power: { id: 'power', name: '狂暴拳套', iconKey: 'power', level: 0, maxLevel: 5, desc: '提升所有武器傷害 +20%' },
  boots: { id: 'boots', name: '疾風之靴', iconKey: 'boots', level: 0, maxLevel: 5, desc: '提升移動速度 +15%' },
  magnet: { id: 'magnet', name: '引力戒指', iconKey: 'magnet', level: 0, maxLevel: 5, desc: '拾取寶石範圍 +35%' },
  heart: { id: 'heart', name: '巨人之心', iconKey: 'heart', level: 0, maxLevel: 5, desc: '最大生命 +30 並持續自愈' },
  clover: { id: 'clover', name: '幸運草', iconKey: 'clover', level: 0, maxLevel: 5, desc: '暴擊率 +15%，寶箱金幣加倍' },
  armor: { id: 'armor', name: '守護鋼甲', iconKey: 'armor', level: 0, maxLevel: 5, desc: '受到傷害減少 3 點 (最低 1)' },
  candle: { id: 'candle', name: '燭台護符', iconKey: 'candle', level: 0, maxLevel: 5, desc: '所有武器攻擊範圍與彈幕體積 +25%' },
  duplicator: { id: 'duplicator', name: '複製之戒', iconKey: 'duplicator', level: 0, maxLevel: 5, desc: '所有武器發射彈幕數量 +1' },
  greed_pass: { id: 'greed_pass', name: '貪婪錢袋', iconKey: 'greed_pass', level: 0, maxLevel: 5, desc: '金幣掉落量 +30%' }
};

export const Talents = {
  hp: { level: 0, max: 8, baseCost: 20, growth: 1.25, name: '生命鍛造', iconKey: 'heart', desc: '基礎生命上限 +12%', value: 0.12 },
  dmg: { level: 0, max: 8, baseCost: 25, growth: 1.28, name: '力量覺醒', iconKey: 'power', desc: '全武器基礎傷害 +10%', value: 0.10 },
  speed: { level: 0, max: 6, baseCost: 20, growth: 1.22, name: '神行之靴', iconKey: 'boots', desc: '移動速度 +6%', value: 0.06 },
  exp: { level: 0, max: 8, baseCost: 30, growth: 1.30, name: '啟迪之光', iconKey: 'crown', desc: '經驗值獲取加成 +10%', value: 0.10 },
  magnet: { level: 0, max: 6, baseCost: 15, growth: 1.20, name: '次元磁石', iconKey: 'magnet', desc: '寶石拾取範圍 +18%', value: 0.18 },
  cooldown: { level: 0, max: 6, baseCost: 35, growth: 1.30, name: '急速詠唱', iconKey: 'tome', desc: '冷卻時間縮減 +5%', value: 0.05 },
  greed: { level: 0, max: 6, baseCost: 25, growth: 1.25, name: '點金之術', iconKey: 'greed_pass', desc: '金幣拾取加成 +15%', value: 0.15 }
};

export const ACHIEVEMENTS = [
  { id: 'kill_100', title: '初出茅廬', desc: '單局擊殺 100 隻魔物', reward: '100 金幣', unlocked: false, check: (state) => state.killCount >= 100 },
  { id: 'kill_500', title: '獵魔專家', desc: '累計擊殺 500 隻魔物 (解鎖暗夜伯爵)', reward: '英雄【暗夜伯爵】', unlocked: false, check: (state) => state.totalKills >= 500, onUnlock: () => { HEROES.vampire.unlocked = true; } },
  { id: 'wave_5', title: '初試啼聲', desc: '生存突破第 5 波 (解鎖森之巡者)', reward: '英雄【森之巡者】', unlocked: false, check: (state) => state.currentWave >= 5, onUnlock: () => { HEROES.ranger.unlocked = true; } },
  { id: 'gold_300', title: '煉金狂熱', desc: '持有超過 300 金幣 (解鎖煉金大師)', reward: '英雄【煉金大師】', unlocked: false, check: (state) => state.sessionGold >= 300, onUnlock: () => { HEROES.alchemist.unlocked = true; } },
  { id: 'evolve_1', title: '超武覺醒', desc: '首次合成終極超武 (解鎖烈焰魔靈)', reward: '英雄【烈焰魔靈】', unlocked: false, check: (state) => state.hasEvolvedAny, onUnlock: () => { HEROES.ignis.unlocked = true; } },
  { id: 'wave_15', title: '冰原征服者', desc: '生存突破第 15 波 (解鎖極寒冰女)', reward: '英雄【極寒冰女】', unlocked: false, check: (state) => state.currentWave >= 15, onUnlock: () => { HEROES.frost.unlocked = true; } },
  { id: 'kill_1500', title: '機械狂潮', desc: '累計擊殺 1500 隻魔物 (解鎖殲滅機兵)', reward: '英雄【殲滅機兵】', unlocked: false, check: (state) => state.totalKills >= 1500, onUnlock: () => { HEROES.cyborg.unlocked = true; } },
  { id: 'wave_30', title: '英靈殿試煉', desc: '生存突破第 30 波 (解鎖女武神)', reward: '英雄【女武神】', unlocked: false, check: (state) => state.currentWave >= 30, onUnlock: () => { HEROES.valkyrie.unlocked = true; } },
  { id: 'wave_50', title: '泰坦屠戮者', desc: '擊敗第 50 波泰坦領主 (解鎖死靈術士)', reward: '英雄【死靈術士】', unlocked: false, check: (state) => state.currentWave >= 51, onUnlock: () => { HEROES.grim.unlocked = true; } }
];