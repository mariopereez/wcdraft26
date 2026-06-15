


═══════════════════════════════════════════════════
//  MUNDIAL DRAFT 2026 — app.js
//  Lógica completa de la aplicación
// ═══════════════════════════════════════════════════════════

// Prevenir pinch-to-zoom táctil de forma nativa
document.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault();
  }
}, { passive: false });

document.addEventListener('gesturestart', function (event) {
  event.preventDefault();
});

// ── CONSTANTS ──────────────────────────────────────────────
const FOOTBALL_API_URL = 'https://api.football-data.org/v4/competitions/WC/matches';
const FOOTBALL_DATA_TOKEN_KEY = 'mundial_fd_token_2026';
const CACHE_TTL = 10 * 60 * 1000;
const INAUGURAL_DATE = new Date('2026-06-11T18:00:00Z');
const INAUGURAL_LABEL = 'México vs Sudáfrica · 11 Jun 2026';

const ALL_MULTS_CONFIG = {
  3: [1, 1.5, 2.5],
  4: [1, 1.25, 1.75, 2.5],
  5: [1, 1.25, 1.5, 2, 2.5],
  6: [1, 1.25, 1.5, 2, 2.5, 3]
};
const TIER_DARK = ["#e63946","#f4a261","#e9c46a","#2ec4b6","#4895ef","#b185db"];
// FIX 8: Colores asignados por jugador (no por ronda/multiplicador)
const PLAYER_COLORS = ["#4895ef","#2ec4b6","#f5c518","#f4a261","#b185db","#e63946","#e9c46a","#25a69a","#ff6b6b","#a8dadc","#457b9d","#e76f51","#06d6a0","#118ab2","#ffd166","#ef476f"];
function getPlayerColor(playerName) {
  const idx = PARTICIPANTES.indexOf(playerName);
  return PLAYER_COLORS[idx >= 0 ? idx % PLAYER_COLORS.length : 0];
}
function getPlayerBadgeStyle(playerName) {
  const hex = getPlayerColor(playerName);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `background:rgba(${r},${g},${b},0.12);color:${hex};border:1px solid rgba(${r},${g},${b},0.32);`;
}
const STAGE_PRIORITY = { final:10, third:9, semi:8, r4:7, r8:6, r16:5, GROUP_STAGE:1, OTHER:0 };
const KNOCKOUT_STAGE_ALIASES = {
  r16:  ['PLAYOFF','LAST_32','ROUND_OF_32','LAST_32_FINALS','ROUND_OF_32_FINALS'],
  r8:   ['LAST_16','ROUND_OF_16','LAST_16_FINALS'],
  r4:   ['QUARTER_FINALS','QUARTER_FINAL'],
  semi: ['SEMI_FINALS','SEMI_FINAL'],
  final:['FINAL'],
  third:['THIRD_PLACE']
};
const BRACKET_ROUNDS = [
  { key:'r16',  label:'Dieciseisavos', slots:16 },
  { key:'r8',   label:'Octavos',       slots:8  },
  { key:'r4',   label:'Cuartos',       slots:4  },
  { key:'semi', label:'Semis',         slots:2  },
  { key:'final',label:'Final',         slots:1  }
];
const GRUPOS_WC2026 = {
  "A":["México","Sudáfrica","Corea del Sur","República Checa"],
  "B":["Canadá","Bosnia y Herzegovina","Catar","Suiza"],
  "C":["Brasil","Marruecos","Haití","Escocia"],
  "D":["Estados Unidos","Paraguay","Australia","Turquía"],
  "E":["Alemania","Curazao","Costa de Marfil","Ecuador"],
  "F":["Países Bajos","Japón","Túnez","Suecia"],
  "G":["Bélgica","Egipto","Nueva Zelanda","Irán"],
  "H":["España","Cabo Verde","Arabia Saudita","Uruguay"],
  "I":["Francia","Senegal","Noruega","Iraq"],
  "J":["Argentina","Argelia","Austria","Jordania"],
  "K":["Portugal","Uzbekistán","Colombia","RD del Congo"],
  "L":["Inglaterra","Croacia","Ghana","Panamá"]
};
const ALL_TEAMS = ["Alemania","Arabia Saudita","Argelia","Argentina","Australia","Austria","Bosnia y Herzegovina","Brasil","Bélgica","Cabo Verde","Catar","Canadá","Colombia","Corea del Sur","Costa de Marfil","Croacia","Curazao","Ecuador","Egipto","Escocia","España","Estados Unidos","Francia","Ghana","Haití","Inglaterra","Irán","Iraq","Japón","Jordania","Marruecos","México","Noruega","Nueva Zelanda","Panamá","Paraguay","Países Bajos","Portugal","RD del Congo","República Checa","Senegal","Sudáfrica","Suecia","Suiza","Turquía","Túnez","Uzbekistán","Uruguay"];
const FLAG_CODES = {"Alemania":"de","Arabia Saudita":"sa","Argelia":"dz","Argentina":"ar","Australia":"au","Austria":"at","Bosnia y Herzegovina":"ba","Brasil":"br","Bélgica":"be","Cabo Verde":"cv","Catar":"qa","Canadá":"ca","Colombia":"co","Corea del Sur":"kr","Costa de Marfil":"ci","Croacia":"hr","Curazao":"cw","Ecuador":"ec","Egipto":"eg","Escocia":"gb-sct","España":"es","Estados Unidos":"us","Francia":"fr","Ghana":"gh","Haití":"ht","Inglaterra":"gb-eng","Irán":"ir","Iraq":"iq","Japón":"jp","Jordania":"jo","Marruecos":"ma","México":"mx","Noruega":"no","Nueva Zelanda":"nz","Panamá":"pa","Paraguay":"py","Países Bajos":"nl","Portugal":"pt","RD del Congo":"cd","República Checa":"cz","Senegal":"sn","Sudáfrica":"za","Suecia":"se","Suiza":"ch","Turquía":"tr","Túnez":"tn","Uzbekistán":"uz","Uruguay":"uy","Chile":"cl","Perú":"pe"};
const TEAM_MAP = {"Alemania":"Germany","Arabia Saudita":"Saudi Arabia","Argelia":"Algeria","Argentina":"Argentina","Australia":"Australia","Austria":"Austria","Bosnia y Herzegovina":"Bosnia and Herzegovina","Brasil":"Brazil","Bélgica":"Belgium","Cabo Verde":"Cape Verde","Catar":"Qatar","Canadá":"Canada","Colombia":"Colombia","Corea del Sur":"Korea Republic","Costa de Marfil":"Côte d'Ivoire","Croacia":"Croatia","Curazao":"Curaçao","Ecuador":"Ecuador","Egipto":"Egypt","Escocia":"Scotland","España":"Spain","Estados Unidos":"USA","Francia":"France","Ghana":"Ghana","Haití":"Haiti","Inglaterra":"England","Irán":"Iran","Iraq":"Iraq","Japón":"Japan","Jordania":"Jordan","Marruecos":"Morocco","México":"Mexico","Noruega":"Norway","Nueva Zelanda":"New Zealand","Panamá":"Panama","Paraguay":"Paraguay","Países Bajos":"Netherlands","Portugal":"Portugal","RD del Congo":"DR Congo","República Checa":"Czech Republic","Senegal":"Senegal","Sudáfrica":"South Africa","Suecia":"Sweden","Suiza":"Switzerland","Turquía":"Türkiye","Túnez":"Tunisia","Uzbekistán":"Uzbekistan","Uruguay":"Uruguay","Chile":"Chile","Perú":"Peru"};
const TEAM_MAP_INV = {};
Object.entries(TEAM_MAP).forEach(([es, en]) => TEAM_MAP_INV[en] = es);
const FLAGS = {"Alemania":"🇩🇪","Arabia Saudita":"🇸🇦","Argelia":"🇩🇿","Argentina":"🇦🇷","Australia":"🇦🇺","Austria":"🇦🇹","Bosnia y Herzegovina":"🇧🇦","Brasil":"🇧🇷","Bélgica":"🇧🇪","Cabo Verde":"🇨🇻","Catar":"🇶🇦","Canadá":"🇨🇦","Colombia":"🇨🇴","Corea del Sur":"🇰🇷","Costa de Marfil":"🇨🇮","Croacia":"🇭🇷","Curazao":"🇨🇼","Ecuador":"🇪🇨","Egipto":"🇪🇬","Escocia":"🏴󠁧󠁢󠁳󠁣󠁴󠁿","España":"🇪🇸","Estados Unidos":"🇺🇸","Francia":"🇫🇷","Ghana":"🇬🇭","Haití":"🇭🇹","Inglaterra":"🏴󠁧󠁢󠁥󠁮󠁧󠁿","Irán":"🇮🇷","Iraq":"🇮🇶","Japón":"🇯🇵","Jordania":"🇯🇴","Marruecos":"🇲🇦","México":"🇲🇽","Noruega":"🇳🇴","Nueva Zelanda":"🇳🇿","Panamá":"🇵🇦","Paraguay":"🇵🇾","Países Bajos":"🇳🇱","Portugal":"🇵🇹","RD del Congo":"🇨🇩","República Checa":"🇨🇿","Senegal":"🇸🇳","Sudáfrica":"🇿🇦","Suecia":"🇸🇪","Suiza":"🇨🇭","Turquía":"🇹🇷","Túnez":"🇹🇳","Uzbekistán":"🇺🇿","Uruguay":"🇺🇾","Chile":"🇨🇱","Perú":"🇵🇪"};
const KIT_URLS = {"España":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/2024_Spain_home_kit.svg/100px-2024_Spain_home_kit.svg.png","Francia":"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/2024_France_home_kit.svg/100px-2024_France_home_kit.svg.png","Alemania":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Germany_2024_Home_Kit.svg/100px-Germany_2024_Home_Kit.svg.png","Inglaterra":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/England_2024_home_kit.svg/100px-England_2024_home_kit.svg.png","Brasil":"https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Brazil_2022_home_kit.svg/100px-Brazil_2022_home_kit.svg.png","Argentina":"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Argentina_2022_home_kit.svg/100px-Argentina_2022_home_kit.svg.png","Portugal":"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Portugal_2022_home_kit.svg/100px-Portugal_2022_home_kit.svg.png","Países Bajos":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Netherlands_2022_home_kit.svg/100px-Netherlands_2022_home_kit.svg.png","Bélgica":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Belgium_2022_home_kit.svg/100px-Belgium_2022_home_kit.svg.png","Croacia":"https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Croatia_2022_home_kit.svg/100px-Croatia_2022_home_kit.svg.png","Uruguay":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Uruguay_2022_home_kit.svg/100px-Uruguay_2022_home_kit.svg.png","México":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Mexico_2022_home_kit.svg/100px-Mexico_2022_home_kit.svg.png","Marruecos":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Morocco_2022_home_kit.svg/100px-Morocco_2022_home_kit.svg.png","Senegal":"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Senegal_2022_home_kit.svg/100px-Senegal_2022_home_kit.svg.png","Japón":"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Japan_2022_home_kit.svg/100px-Japan_2022_home_kit.svg.png","Corea del Sur":"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/South_Korea_2022_home_kit.svg/100px-South_Korea_2022_home_kit.svg.png","Australia":"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Australia_2022_home_kit.svg/100px-Australia_2022_home_kit.svg.png","Estados Unidos":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/USA_2022_home_kit.svg/100px-USA_2022_home_kit.svg.png","Canadá":"https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Canada_2022_home_kit.svg/100px-Canada_2022_home_kit.svg.png","Ecuador":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Ecuador_2022_home_kit.svg/100px-Ecuador_2022_home_kit.svg.png","Ghana":"https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Ghana_2022_home_kit.svg/100px-Ghana_2022_home_kit.svg.png","Suiza":"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Switzerland_2022_home_kit.svg/100px-Switzerland_2022_home_kit.svg.png","Irán":"https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Iran_2022_home_kit.svg/100px-Iran_2022_home_kit.svg.png"};
const VENUE_MAP = [{key:"MetLife",city:"Nueva York/Nueva Jersey"},{key:"SoFi",city:"Los Ángeles"},{key:"AT&T",city:"Dallas"},{key:"Levi",city:"San Francisco"},{key:"Lumen",city:"Seattle"},{key:"Hard Rock",city:"Miami"},{key:"Mercedes",city:"Atlanta"},{key:"NRG",city:"Houston"},{key:"Lincoln",city:"Philadelphia"},{key:"Arrowhead",city:"Kansas City"},{key:"Gillette",city:"Boston"},{key:"Azteca",city:"Ciudad de México"},{key:"Akron",city:"Guadalajara"},{key:"BBVA",city:"Monterrey"},{key:"BMO",city:"Toronto"},{key:"BC Place",city:"Vancouver"}];
const PAGE_BG_PHOTOS = {
  home:          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/2022_FIFA_World_Cup_Final_Mbappe_header.jpg/1280px-2022_FIFA_World_Cup_Final_Mbappe_header.jpg',
  draft:         'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Zinedine_Zidane_at_the_2006_World_Cup.jpg/1280px-Zinedine_Zidane_at_the_2006_World_Cup.jpg',
  resultados:    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Ronaldo_Brazil_1998.jpg/1280px-Ronaldo_Brazil_1998.jpg',
  grupos:        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Luka_Modric_%282018%29.jpg/1280px-Luka_Modric_%282018%29.jpg',
  clasificacion: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg/1280px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
  predicciones:  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kylian_Mbapp%C3%A9_2019.jpg/1280px-Kylian_Mbapp%C3%A9_2019.jpg',
  yo:            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg/1280px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg',
  reglas:        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Zinedine_Zidane_at_the_2006_World_Cup.jpg/1280px-Zinedine_Zidane_at_the_2006_World_Cup.jpg'
};
const GROUP_MATCH_SLOTS = [{day:0,hour:18,minute:0},{day:0,hour:21,minute:0},{day:1,hour:18,minute:0},{day:1,hour:21,minute:0},{day:4,hour:18,minute:0},{day:4,hour:21,minute:0}];
const KNOCKOUT_SLOTS = {r16:{startDay:17,count:16},r8:{startDay:23,count:8},r4:{startDay:28,count:4},semi:{startDay:33,count:2},third:{startDay:37,count:1},final:{startDay:38,count:1}};
const SUPER_ADMIN_EMAILS = ['javier.sacramento.castells@gmail.com','sergioredalb@gmail.com','marioutebo05@gmail.com'];
const GROUP_PAIRINGS = [[0,1],[2,3],[0,2],[3,1],[0,3],[1,2]];

// ── STATE ──────────────────────────────────────────────────
let currentUser = null, currentProfile = null;
let currentPartidaId = null, currentPartidaConfig = null, currentPartidaJugadores = {};
let PARTICIPANTES = [], PARTICIPANTES_BY_UID = {}, MULTS = [];
let draft = {}, results = {}, draftState = { phase:'pending', orders:[], currentPick:0 };
let calActiveFilter = 'all', calSearchVal = '', resFilter = 'all', resSearch = '';
let resTabActive = 'todos', todosFilter = 'all', todosSearch = '';
let draftTestMode = false, draftTestPlayer = null, draftSearchSel = null;
let clasExpandedPlayer = null, predFilterActive = 'pending', simSelections = {};
let _yoLastHash = '', _partidaListeners = [], _salaListeners = [];
let adminMatchesData = null, adminTab = 'groups';
let avatarCache = {}, matches = [];
let lastConfirmedPickIndex = -1;

// ── PWA INSTALL LOGIC ──────────────────────────────────────

// ── LOCALIZATION (i18n) ────────────────────────────────────
let currentLang = localStorage.getItem('app_lang') || (navigator.language.startsWith('es') ? 'es' : 'en');
if (!window.translations) window.translations = { es: {}, en: {} };

window.tr = function(key) {
  const langDict = window.translations[currentLang] || window.translations['es'];
  return langDict[key] || window.translations['es'][key] || key;
};

window.updateLanguageUI = function() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = window.tr(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = window.tr(el.getAttribute('data-i18n-placeholder'));
  });
};

window.setLanguage = function(lang) {
        currentLang = lang;
        localStorage.setItem('app_lang', lang);
        alert(window.tr('lang_alert'));
        location.reload();
      };

let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const a = document.querySelector('.page.active');
  if(a && a.id === 'page-yo') { _yoLastHash = ''; renderYo(); }
});
window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  const a = document.querySelector('.page.active');
  if(a && a.id === 'page-yo') { _yoLastHash = ''; renderYo(); }
});
async function doInstallApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      _yoLastHash = '';
      renderYo();
    }
  }
}


// ── SUPERCELL TIPS & ROTATION ──────────────────────────────
const SUPERCELL_TIPS = [
  "Consejo: Piensa bien en qué ronda colocas tus multiplicadores. Un ×3.0 en la final puede cambiarlo todo.",
  window.tr("tip_1"),
  "Consejo: Puedes cambiar tu apodo en el menú 'Yo' para que tus amigos te reconozcan mejor.",
  "Consejo: En la pestaña 'Grupos' puedes ver la clasificación en directo de cada grupo del Mundial.",
  window.tr("tip_2"),
  "Consejo: El modo de draft de serpentina equilibra las cosas: quien elige último en la ronda 1 elige primero en la ronda 2.",
  "Consejo: Invita a más amigos compartiendo el código de invitación del torneo.",
  "Consejo: No pongas todos tus favoritos al inicio, el draft estratégico premia la paciencia."
];
let tipInterval = null;
function startTipRotation() {
  const el = document.getElementById('supercell-tip-text');
  if(!el) return;
  el.style.opacity = '1';
  el.textContent = SUPERCELL_TIPS[Math.floor(Math.random() * SUPERCELL_TIPS.length)];
  if(tipInterval) clearInterval(tipInterval);
  tipInterval = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = SUPERCELL_TIPS[Math.floor(Math.random() * SUPERCELL_TIPS.length)];
      el.style.opacity = '1';
    }, 300);
  }, 4000);
}
function stopTipRotation() {
  if(tipInterval) {
    clearInterval(tipInterval);
    tipInterval = null;
  }
}

// ── GENERIC HELPERS ────────────────────────────────────────
function isSamePlayer(p1, p2) {
  if(!p1 || !p2) return false;
  return p1.trim().toLowerCase() === p2.trim().toLowerCase();
}

function pad(n) { return String(n).padStart(2,'0'); }
function nameES(n) { return TEAM_MAP_INV[n] || n; }
function formatDate(u) { return new Date(u).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES',{weekday:'short',day:'numeric',month:'short'}); }
function formatTime(u) { return new Date(u).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})+'h'; }
function formatDay(u)  { return new Date(u).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }
function isToday(u)    { return new Date(u).toDateString() === new Date().toDateString(); }
function setStatus(t, msg) { const b = document.getElementById('status-bar'); if(!b) return; b.className = t==='ok'?'':t; document.getElementById('status-text').textContent = msg; }
function showMsg(id, type, text) { const el = document.getElementById(id); if(!el) return; el.className = 'msg '+type; el.textContent = text; }
function clearMsg(id) { const el = document.getElementById(id); if(!el) return; el.className = 'msg'; el.textContent = ''; }
function genCodigo() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

function flagImg(t, size) {
  const code = FLAG_CODES[t];
  if(!code) return `<span style="font-size:${size==='xl'?'1.5rem':size==='lg'?'1.2rem':'1rem'}">${FLAGS[t]||'🏳️'}</span>`;
  const cls = `flag-img${size==='xl'?' flag-img-xl':size==='lg'?' flag-img-lg':size==='md'?' flag-img-md':''}`;
  const url = code.includes('-') ? `https://flagcdn.com/${code}.svg` : `https://flagcdn.com/w40/${code}.png`;
  return `<img class="${cls}" src="${url}" alt="${t}" onerror="this.outerHTML='<span>${FLAGS[t]||'🏳️'}</span>'" loading="lazy">`;
}
function ownerTag(od) { if(!od) return ''; return `<span class="owner-pill" style="${getPlayerBadgeStyle(od.owner)}">${od.owner}</span>`; }
function getMyTeams() {
  const s = new Set();
  const myName = getCurrentPlayerName();
  const key = findMyDraftKey(myName);
  (draft[key]||[]).forEach(t => { if(t) s.add(t); });
  return s;
}
function findMyDraftKey(myName) {
  if(!myName) return null;
  // Exacto
  if(draft[myName] !== undefined) return myName;
  // Case-insensitive
  const lower = myName.toLowerCase().trim();
  const found = Object.keys(draft).find(k => k.toLowerCase().trim() === lower);
  if(found) return found;
  // Por UID en PARTICIPANTES_BY_UID
  if(currentUser) {
    const nameByUid = PARTICIPANTES_BY_UID[currentUser.uid];
    if(nameByUid && draft[nameByUid] !== undefined) return nameByUid;
  }
  // Fallback: primer participante que coincida en displayName
  const match = PARTICIPANTES.find(p => p.toLowerCase().trim() === lower);
  return match || myName;
}
function getOwnerData(team) { for(const p of PARTICIPANTES) { const i = (draft[p]||[]).indexOf(team); if(i >= 0) return {owner:p, idx:i}; } return null; }
function isSuperAdmin() { return currentUser && SUPER_ADMIN_EMAILS.includes(currentUser.email); }
function isAdmin() { return (currentPartidaConfig && currentUser && currentPartidaConfig.adminUid === currentUser.uid) || isSuperAdmin(); }
function getCurrentPlayerName() {
  if (window._demoMode) return 'Tú (Demo)';
  if (typeof currentUser !== 'undefined' && currentUser && typeof currentPartidaJugadores !== 'undefined' && currentPartidaJugadores[currentUser.uid]) {
    const j = currentPartidaJugadores[currentUser.uid];
    return j.displayName || j.email || '—';
  }
  return typeof currentProfile !== 'undefined' && currentProfile ? (currentProfile.displayName || currentProfile.email || '—') : '—';
}

// ── AVATAR HELPERS ─────────────────────────────────────────
function getAvatar(name) { return avatarCache[name] || localStorage.getItem('avatar_'+name) || null; }
async function setAvatarAndSync(name, dataUrl) {
  avatarCache[name] = dataUrl; localStorage.setItem('avatar_'+name, dataUrl);
  if(!currentPartidaId) return;
  try { await window._setDoc(window._doc(window._db, `partidas/${currentPartidaId}/avatars`, 'data'), {[name]:dataUrl}, {merge:true}); } catch(e) {}
}
async function loadAvatarsFromFirebase() {
  if(!currentPartidaId) return;
  try {
    PARTICIPANTES.forEach(n => { const l = localStorage.getItem('avatar_'+n); if(l) avatarCache[n] = l; });
    const snap = await window._getDoc(window._doc(window._db, `partidas/${currentPartidaId}/avatars`, 'data'));
    if(snap.exists()) { const d = snap.data(); PARTICIPANTES.forEach(n => { if(d[n]) { avatarCache[n] = d[n]; localStorage.setItem('avatar_'+n, d[n]); } }); }
    const u = window._onSnapshot(window._doc(window._db, `partidas/${currentPartidaId}/avatars`, 'data'), s => {
      if(s.exists()) { const d = s.data(); PARTICIPANTES.forEach(n => { if(d[n]) { avatarCache[n] = d[n]; localStorage.setItem('avatar_'+n, d[n]); } }); updateNavAvatar(); refreshCurrentPage(); }
    });
    _partidaListeners.push(u);
  } catch(e) {}
}
function avatarEl(name, cls='', size=40) {
  const src = getAvatar(name); const init = (name||'?').slice(0,2).toUpperCase();
  if(src) return `<img src="${src}" class="${cls}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0" alt="${name}">`;
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--surf2);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:${Math.round(size*.38)}px;color:var(--muted);flex-shrink:0">${init}</div>`;
}
function updateNavAvatar() { if(!currentProfile) return; const w = document.getElementById('nav-avatar-wrap'); if(w) w.innerHTML = avatarEl(currentProfile.displayName,'',30); }
function resizeAndUploadAvatar(name, file, onDone) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas'), out = 300, crop = Math.min(img.width, img.height);
      const sx = img.width > img.height ? (img.width-crop)/2 : 0;
      const sy = img.height > img.width ? (img.height-crop)*.18 : (img.height-crop)/2;
      canvas.width = out; canvas.height = out;
      const ctx = canvas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, Math.max(0,sy), crop, crop, 0, 0, out, out);
      const dataUrl = canvas.toDataURL('image/jpeg',.72);
      setAvatarAndSync(name, dataUrl).then(() => { if(onDone) onDone(dataUrl); });
    }; img.src = ev.target.result;
  }; reader.readAsDataURL(file);
}

// ── AUTH ───────────────────────────────────────────────────
function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active')); btn.classList.add('active');
  document.getElementById('auth-login').style.display    = tab==='login'    ? 'flex' : 'none';
  document.getElementById('auth-register').style.display = tab==='register' ? 'flex' : 'none';
  clearMsg('login-msg'); clearMsg('reg-msg');
}
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if(!email || !pass) { showMsg('login-msg','error','Rellena email y contraseña'); return; }
  const btn = document.getElementById('login-btn'); btn.disabled = true; btn.textContent = 'Entrando…';
  try { await window._signInWithEmailAndPassword(window._auth, email, pass); }
  catch(e) {
    btn.disabled = false; btn.textContent = 'Entrar';
    const msgs = {'auth/user-not-found':'No existe esta cuenta','auth/wrong-password':'Contraseña incorrecta','auth/invalid-email':'Email no válido','auth/too-many-requests':'Demasiados intentos','auth/invalid-credential':'Email o contraseña incorrectos'};
    showMsg('login-msg','error', msgs[e.code]||'Error al iniciar sesión');
  }
}
async function doForgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  if(!email) { showMsg('login-msg','error','Escribe tu email primero'); return; }
  try { await window._sendPasswordResetEmail(window._auth, email); showMsg('login-msg','success','📧 Email enviado. Revisa tu bandeja.'); }
  catch(e) { showMsg('login-msg','error','No se pudo enviar.'); }
}
async function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  if(!name||name.length<2)  { showMsg('reg-msg','error','Nombre mínimo 2 caracteres'); return; }
  if(!email)                 { showMsg('reg-msg','error','Escribe tu email'); return; }
  if(pass.length<6)          { showMsg('reg-msg','error','Contraseña mínimo 6 caracteres'); return; }
  if(pass !== pass2)         { showMsg('reg-msg','error','Las contraseñas no coinciden'); return; }
  const btn = document.getElementById('reg-btn'); btn.disabled = true; btn.textContent = 'Creando…';
  try {
    const cred = await window._createUserWithEmailAndPassword(window._auth, email, pass);
    await window._updateProfile(cred.user, {displayName: name});
    await window._setDoc(window._doc(window._db,'usuarios',cred.user.uid), {displayName:name, email, createdAt:Date.now()});
  } catch(e) {
    btn.disabled = false; btn.textContent = 'Crear cuenta';
    const msgs = {'auth/email-already-in-use':'Email ya en uso','auth/invalid-email':'Email no válido','auth/weak-password':'Contraseña débil'};
    showMsg('reg-msg','error', msgs[e.code]||'Error al crear cuenta');
  }
}
async function doLogout() {
  if(!confirm('¿Cerrar sesión?')) return;
  unsubscribeAll();
  if(currentUser) try { localStorage.removeItem('profile_'+currentUser.uid); } catch(e) {}
  await window._signOut(window._auth);
}
function showChangeNickname() {
  const modal = document.getElementById('nickname-modal'); if(!modal) return;
  const input = document.getElementById('nickname-input'); if(input) input.value = currentProfile?.displayName||'';
  clearMsg('nickname-msg'); modal.classList.remove('hidden'); modal.style.display = 'flex';
  setTimeout(() => { if(input) input.focus(); }, 100);
}
function closeChangeNickname() { const modal = document.getElementById('nickname-modal'); if(modal) { modal.classList.add('hidden'); modal.style.display='none'; } }
async function doChangeNickname() {
  const input = document.getElementById('nickname-input');
  const newName = (input?.value||'').trim();
  if(!newName||newName.length<2)  { showMsg('nickname-msg','error','Mínimo 2 caracteres'); return; }
  if(newName.length>20)            { showMsg('nickname-msg','error','Máximo 20 caracteres'); return; }
  const btn = document.getElementById('nickname-save-btn'); if(btn) { btn.disabled=true; btn.textContent='Guardando…'; }
  try {
    const oldName = currentProfile?.displayName;
    
    // Check for active drafts BEFORE saving anything
    const snap = await window._getDoc(window._doc(window._db, 'usuarios', currentUser.uid));
    let userData = null;
    if(snap.exists()) {
      userData = snap.data();
      const misPartidas = userData.partidas || {};
      for(const partidaId of Object.keys(misPartidas)) {
        try {
          const dsSnap = await window._getDoc(window._doc(window._db, `partidas/${partidaId}/draftState`, 'data'));
          if(dsSnap.exists() && dsSnap.data().phase === 'active') {
            showMsg('nickname-msg','error','Hay un draft activo en curso. No puedes cambiar tu apodo ahora.');
            return;
          }
        } catch(e) {}
      }
    }

    await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid), {displayName:newName}, {merge:true});
    await window._updateProfile(currentUser, {displayName:newName});
    
    if(oldName && oldName !== newName) {
      // Sync nickname locally for avatar
      const av = localStorage.getItem('avatar_' + oldName);
      if(av) {
        localStorage.setItem('avatar_' + newName, av);
        avatarCache[newName] = av;
      }
      
      // Sync nickname in database
      if(userData) {
        const misPartidas = userData.partidas || {};
        for(const partidaId of Object.keys(misPartidas)) {
          try {
            // 1. Update name in jugadores
            await window._setDoc(window._doc(window._db, `partidas/${partidaId}/jugadores`, currentUser.uid), {displayName:newName}, {merge:true});
            
            // 2. Rename key in draft
            const draftRef = window._doc(window._db, `partidas/${partidaId}/draft`, 'data');
            const dSnap = await window._getDoc(draftRef);
            if(dSnap.exists()) {
              const dData = dSnap.data();
              if(dData[oldName] !== undefined) {
                dData[newName] = dData[oldName];
                delete dData[oldName];
                await window._setDoc(draftRef, dData);
              }
            }
            
            // 3. Rename key in avatars
            const avatarsRef = window._doc(window._db, `partidas/${partidaId}/avatars`, 'data');
            const aSnap = await window._getDoc(avatarsRef);
            if(aSnap.exists()) {
              const aData = aSnap.data();
              if(aData[oldName] !== undefined) {
                aData[newName] = aData[oldName];
                delete aData[oldName];
                await window._setDoc(avatarsRef, aData);
              }
            }
            
            // 4. Rename player in draftState
            const dsRef = window._doc(window._db, `partidas/${partidaId}/draftState`, 'data');
            const dsStateSnap = await window._getDoc(dsRef);
            if(dsStateSnap.exists()) {
              const dsData = dsStateSnap.data();
              let dsUpdated = false;
              if (dsData.orders && Array.isArray(dsData.orders)) {
                dsData.orders.forEach(o => {
                  if (o.player === oldName) {
                    o.player = newName;
                    dsUpdated = true;
                  }
                });
              }
              if (dsUpdated) {
                await window._setDoc(dsRef, dsData);
              }
            }
          } catch(syncErr) {
            console.error('Error sincronizando apodo en torneo ' + partidaId, syncErr);
          }
        }
      }
    }
    
    if(currentProfile) currentProfile.displayName = newName;
    localStorage.setItem('profile_'+currentUser.uid, JSON.stringify({...currentProfile, displayName:newName}));
    const navN = document.getElementById('nav-name'); if(navN) navN.textContent = newName;
    updateNavAvatar(); showMsg('nickname-msg','success','✅ Apodo actualizado');
    setTimeout(() => closeChangeNickname(), 1200);
  } catch(e) { showMsg('nickname-msg','error','Error al guardar: '+e.message); }
  finally { if(btn) { btn.disabled=false; btn.textContent='Guardar'; } }
}

// ── AUTH CALLBACKS (llamados desde index.html / firebase-init) ──
window._onAuthReady = function(user, profile) {
  // Cancelar timeout de auth (Firebase respondió correctamente)
  if(window._authTimeout) { clearTimeout(window._authTimeout); window._authTimeout=null; }
  const ls = document.getElementById('loading-screen');
  if(ls) ls.style.display = 'none';
  currentUser = user; currentProfile = profile;
  const urlParams = new URLSearchParams(window.location.search);

  // Deep-link: ?join=XXXX → Lobby con código autocompletado
  const joinCode = urlParams.get('join');
  if(joinCode) {
    showScreen('lobby');
    loadLobby().then(() => {
      showJoinPartida();
      const jc = document.getElementById('join-codigo');
      if(jc) jc.value = joinCode;
    });
    return;
  }

  // Sin apodo configurado: pedir apodo una vez antes de entrar
  if(profile && profile.displayName && profile.displayName.includes('@') && !localStorage.getItem('apodo_set_'+user.uid)) {
    showScreen('lobby');
    loadLobby().then(() => { setTimeout(() => showChangeNickname(), 600); });
    return;
  }

  // ── ACCESO DIRECTO AL ÚLTIMO TORNEO (UX PWA) ──
  // Si el usuario tiene un último torneo guardado, entrar directamente sin lobby.
  // El usuario puede volver al lobby desde la pestaña "Yo".
  const lastPartidaId = localStorage.getItem('last_partida_id');
  if(lastPartidaId && lastPartidaId !== '__DEMO__') {
    enterApp(lastPartidaId).catch(() => {
      // El torneo ya no existe o hay error: limpiar y mostrar lobby
      localStorage.removeItem('last_partida_id');
      showScreen('lobby');
      loadLobby();
    });
    return;
  }

  // Sin torneo guardado → Lobby normal
  showScreen('lobby');
  loadLobby();
};

window._onSignedOut = function() {
  currentUser = null; currentProfile = null; currentPartidaId = null;
  unsubscribeAll();
  // Ocultar loading si estaba visible
  const ls = document.getElementById('loading-screen');
  if(ls) ls.style.display = 'none';
  showScreen('auth');
  const le = document.getElementById('login-email');
  const lp = document.getElementById('login-pass');
  if(le) le.value = '';
  if(lp) lp.value = '';
  clearMsg('login-msg'); clearMsg('reg-msg');
};

// ── SCREEN MANAGEMENT ──────────────────────────────────────
function showScreen(name) {
  ['auth','lobby','sala'].forEach(s => {
    const el = document.getElementById('screen-'+s);
    if(el) el.classList.toggle('hidden', s !== name);
  });
  const nav = document.getElementById('main-nav');
  const app = document.getElementById('main-app');
  const sb  = document.getElementById('status-bar');
  const bNav = document.getElementById('bottom-nav');
  const isMobile = window.innerWidth <= 768;
  if(name === 'app') {
    if(nav)  nav.style.display  = isMobile ? 'none' : 'flex';
    if(bNav) bNav.style.display = isMobile ? 'flex' : 'none';
    if(app)  app.style.display  = 'block';
    if(sb)   sb.style.display   = 'flex';
    ['auth','lobby','sala'].forEach(s => { const el = document.getElementById('screen-'+s); if(el) el.classList.add('hidden'); });
  } else {
    if(nav)  nav.style.display  = 'none';
    if(bNav) bNav.style.display = 'none';
    if(app)  app.style.display  = 'none';
    if(sb)   sb.style.display   = 'none';
  }
}
function unsubscribeAll() {
  _salaListeners.forEach(u => u()); _salaListeners = [];
  _partidaListeners.forEach(u => u()); _partidaListeners = [];
  if (window.unsubPorra) { window.unsubPorra(); window.unsubPorra = null; }
  if (window.unsubPreds) { window.unsubPreds(); window.unsubPreds = null; }
}

// ── LOADING SCREEN ─────────────────────────────────────────
function showLoadingScreen() {
  const ls = document.getElementById('loading-screen');
  if(!ls) return;
  ls.style.display='flex'; ls.classList.remove('hidden'); ls.style.opacity='1';
  // Mensajes animados
  const msgs = ['Conectando con el servidor…','Cargando equipos…','Preparando el torneo…','Cargando partidos…','Casi listo…'];
  let i = 0;
  setLoadingMsg(msgs[i]);
  if(window._loadingMsgInterval) clearInterval(window._loadingMsgInterval);
  window._loadingMsgInterval = setInterval(() => {
    i = (i + 1) % msgs.length;
    setLoadingMsg(msgs[i]);
  }, 1400);
}
function setLoadingMsg(msg) {
  const el = document.getElementById('loading-msg');
  if(el) el.textContent = msg;
}
function hideLoadingScreen() {
  if(window._loadingMsgInterval) { clearInterval(window._loadingMsgInterval); window._loadingMsgInterval=null; }
  const ls = document.getElementById('loading-screen');
  if(ls) { ls.classList.add('hidden'); setTimeout(()=>ls.style.display='none',500); }
}

// ── COUNTDOWN ──────────────────────────────────────────────
function cdHtml(d,h,m,s,numC,unitC,sepC) {
  const lbl = `style="font-family:'Barlow Condensed';font-size:.58rem;letter-spacing:2px;color:var(--muted);text-transform:uppercase"`;
  return `<div class="${unitC}"><div class="${numC}">${pad(d)}</div><div ${lbl}>días</div></div><div class="${sepC}">:</div><div class="${unitC}"><div class="${numC}">${pad(h)}</div><div ${lbl}>horas</div></div><div class="${sepC}">:</div><div class="${unitC}"><div class="${numC}">${pad(m)}</div><div ${lbl}>min</div></div><div class="${sepC}">:</div><div class="${unitC}"><div class="${numC}">${pad(s)}</div><div ${lbl}>seg</div></div>`;
}
function updateCountdowns() {
  const diff = INAUGURAL_DATE - new Date();
  if(diff <= 0) {
    const done = `<div style="font-family:'Bebas Neue';font-size:1.3rem;color:var(--gold)">¡EN JUEGO! 🎉</div>`;
    ['hero-cd','loading-cd'].forEach(id => { const e = document.getElementById(id); if(e) e.innerHTML = done; });
    const ml = document.getElementById('hero-cd-match'); if(ml) ml.textContent = ''; return;
  }
  const dd=Math.floor(diff/86400000), hh=Math.floor((diff%86400000)/3600000), mm=Math.floor((diff%3600000)/60000), ss=Math.floor((diff%60000)/1000);
  const heroEl = document.getElementById('hero-cd');   if(heroEl) heroEl.innerHTML = cdHtml(dd,hh,mm,ss,'hcd-num','hcd-unit','hcd-sep');
  const loadEl = document.getElementById('loading-cd'); if(loadEl) loadEl.innerHTML = cdHtml(dd,hh,mm,ss,'cd-num','cd-unit','cd-sep');
  const ml = document.getElementById('hero-cd-match'); if(ml) ml.textContent = '⚽ '+INAUGURAL_LABEL;
}
function startCountdown() { updateCountdowns(); setInterval(updateCountdowns, 1000); }

// ── NAV & PAGE ROUTING ─────────────────────────────────────
function setPageBg(id) {
  const url = PAGE_BG_PHOTOS[id];
  const el  = document.getElementById('page-bg-layer');
  if(el && url) el.style.backgroundImage = `url('${url}')`;
  else if(el)   el.style.backgroundImage = 'none';
}
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-'+id); if(page) page.classList.add('active');
  if(btn) btn.classList.add('active');
  // Sincronizar bottom nav
  const bnav = document.querySelector(`#bottom-nav .bnav-item[data-page="${id}"]`);
  if(bnav) bnav.classList.add('active');
  setPageBg(id);
  if(id === 'yo') { _yoLastHash = ''; renderYo(); return; }
  if(id === 'admin') { renderAdminPanel(); return; }
  const renders = { home:renderHome, draft:renderDraft, resultados:renderResults, clasificacion:renderClasificacion, grupos:renderGrupos };
  if(renders[id]) renders[id]();
}
function refreshCurrentPage() {
  const a = document.querySelector('.page.active'); if(!a) return;
  const id = a.id.replace('page-','');
  if(id === 'yo') { renderYo(); return; }
  if(id === 'admin') { renderAdminPanel(); return; }
  const renders = { home:renderHome, draft:renderDraft, resultados:renderResults, clasificacion:renderClasificacion, grupos:renderGrupos };
  if(renders[id]) renders[id]();
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { window.updateLanguageUI(); startCountdown(); });

// ── DEMO MODE ──────────────────────────────────────────────
function enterDemoMode() {
  currentPartidaId = '__DEMO__';
  currentPartidaConfig = { nombre:'🎮 Torneo Demo', adminUid:'__DEMO__', adminName:'Demo Admin', estado:'activa', codigo:'DEMO01', jugadoresCount:5, maxJugadores:8, seleccionesPorJugador:6, createdAt:Date.now() };
  currentPartidaJugadores = { 'demo1':{uid:'demo1',displayName:'Tú (Demo)'}, 'demo2':{uid:'demo2',displayName:'Carlos'}, 'demo3':{uid:'demo3',displayName:'Laura'}, 'demo4':{uid:'demo4',displayName:'Sergio'}, 'demo5':{uid:'demo5',displayName:'María'} };
  rebuildParticipantes();
  if(currentProfile) currentProfile._demoName = 'Tú (Demo)';
  draft = {
    'Tú (Demo)': ['España','Brasil','Argentina','Japón','Marruecos','Austria'],
    'Carlos':    ['Francia','Portugal','Alemania','Senegal','Colombia','Canadá'],
    'Laura':     ['Inglaterra','Bélgica','Croacia','Australia','Ecuador','Ghana'],
    'Sergio':    ['Países Bajos','Uruguay','Estados Unidos','Corea del Sur','Polonia','Túnez'],
    'María':     ['México','Suiza','Irán','Egipto','Noruega','Jordania'],
  };
  results = {};
  ALL_TEAMS.forEach(t => results[t] = {pg:0,pe:0,pd:0,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  const setR = (t,d) => Object.assign(results[t], d);
  setR('España',      {pg:3,pe:0,pd:0,r16:1,r8:1,r4:1,semi:1,final:0,ganador:0,bronce:0});
  setR('Brasil',      {pg:2,pe:1,pd:0,r16:1,r8:1,r4:1,semi:1,final:1,ganador:1,bronce:0});
  setR('Argentina',   {pg:2,pe:0,pd:1,r16:1,r8:1,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Francia',     {pg:2,pe:1,pd:0,r16:1,r8:1,r4:1,semi:1,final:1,ganador:0,bronce:0});
  setR('Portugal',    {pg:2,pe:0,pd:1,r16:1,r8:1,r4:1,semi:0,final:0,ganador:0,bronce:0});
  setR('Alemania',    {pg:2,pe:0,pd:1,r16:1,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Inglaterra',  {pg:1,pe:2,pd:0,r16:1,r8:1,r4:1,semi:1,final:0,ganador:0,bronce:1});
  setR('Bélgica',     {pg:1,pe:1,pd:1,r16:1,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Croacia',     {pg:1,pe:1,pd:1,r16:1,r8:1,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Japón',       {pg:2,pe:0,pd:1,r16:1,r8:1,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Marruecos',   {pg:1,pe:1,pd:1,r16:1,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Países Bajos',{pg:2,pe:1,pd:0,r16:1,r8:1,r4:1,semi:0,final:0,ganador:0,bronce:0});
  setR('Uruguay',     {pg:2,pe:0,pd:1,r16:1,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Senegal',     {pg:1,pe:1,pd:1,r16:1,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('México',      {pg:1,pe:1,pd:1,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  setR('Austria',     {pg:0,pe:1,pd:2,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0});
  draftState = {phase:'complete', orders:[], currentPick:30};
  predictions = {};
  const FD = new Date('2026-06-11T18:00:00Z');
  const mdate = (d,h) => { const dt = new Date(FD); dt.setUTCDate(dt.getUTCDate()+d); dt.setUTCHours(h,0,0,0); return dt.toISOString(); };
  matches = [
    {id:'d1',homeTeam:{name:'Mexico'},awayTeam:{name:'South Africa'},utcDate:mdate(0,18),status:'FINISHED',stage:'GROUP_STAGE',group:'GROUP_A',score:{winner:'HOME_TEAM',fullTime:{home:2,away:0}}},
    {id:'d2',homeTeam:{name:'Spain'},awayTeam:{name:'Brazil'},utcDate:mdate(1,18),status:'FINISHED',stage:'GROUP_STAGE',group:'GROUP_H',score:{winner:'HOME_TEAM',fullTime:{home:3,away:1}}},
    {id:'d3',homeTeam:{name:'France'},awayTeam:{name:'Argentina'},utcDate:mdate(2,21),status:'FINISHED',stage:'GROUP_STAGE',group:'GROUP_I',score:{winner:'HOME_TEAM',fullTime:{home:2,away:1}}},
    {id:'d4',homeTeam:{name:'Germany'},awayTeam:{name:'England'},utcDate:mdate(3,18),status:'FINISHED',stage:'GROUP_STAGE',group:'GROUP_E',score:{winner:'AWAY_TEAM',fullTime:{home:1,away:2}}},
    {id:'d5',homeTeam:{name:'Spain'},awayTeam:{name:'Japan'},utcDate:mdate(5,18),status:'FINISHED',stage:'GROUP_STAGE',group:'GROUP_H',score:{winner:'HOME_TEAM',fullTime:{home:1,away:0}}},
    {id:'d6',homeTeam:{name:'Brazil'},awayTeam:{name:'France'},utcDate:mdate(6,21),status:'SCHEDULED',stage:'SEMI_FINALS',score:{winner:null,fullTime:{home:null,away:null}}},
    {id:'d7',homeTeam:{name:'Spain'},awayTeam:{name:'England'},utcDate:mdate(7,18),status:'SCHEDULED',stage:'SEMI_FINALS',score:{winner:null,fullTime:{home:null,away:null}}},
    {id:'d8',homeTeam:{name:'Brazil'},awayTeam:{name:'Spain'},utcDate:mdate(10,18),status:'SCHEDULED',stage:'FINAL',score:{winner:null,fullTime:{home:null,away:null}}},
  ].map(m => ({...m, homeTeam:{name:TEAM_MAP_INV[m.homeTeam.name]||m.homeTeam.name}, awayTeam:{name:TEAM_MAP_INV[m.awayTeam.name]||m.awayTeam.name}}));
  MULTS = ALL_MULTS_CONFIG[6];
  const navP = document.getElementById('nav-partida-name'); if(navP) navP.textContent = '🎮 MODO DEMO';
  const navN = document.getElementById('nav-name');         if(navN) navN.textContent = 'Tú (Demo)';
  const heroN = document.getElementById('hero-partida-name'); if(heroN) heroN.textContent = '🎮 TORNEO DEMO';
  const saBadge = document.getElementById('nav-superadmin-badge'); if(saBadge) saBadge.style.display = 'none';
  window._demoMode = true;
  showScreen('app'); renderHome();
  const sb = document.getElementById('status-bar');
  if(sb) { sb.className='warn'; sb.style.display='flex'; document.getElementById('status-text').textContent='👁️ MODO DEMO · Datos ficticios · Para salir ve a "← ${window.tr("yo_my_tournaments")}"'; }
}

// ── LOBBY ──────────────────────────────────────────────────
async function loadLobby() {
  const name = currentProfile?.displayName || '—';
  const el = document.getElementById('lobby-welcome'); if(el) el.textContent = `¡Hola, ${name}!`;
  hideCreateJoin(); await loadMisPartidas();
  return true;
}
async function loadMisPartidas() {
  const list = document.getElementById('partidas-list'); if(!list) return;
  list.innerHTML = '<div class="skeleton" style="height:56px"></div><div class="skeleton" style="height:56px;margin-top:.4rem"></div>';
  try {
    const snap = await window._getDoc(window._doc(window._db,'usuarios',currentUser.uid));
    const userData = snap.exists() ? snap.data() : {};
    const misPartidas = userData.partidas || {};
    const ids = Object.keys(misPartidas);
    if(ids.length === 0) { list.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--muted);font-family:Barlow Condensed;font-size:.88rem">No tienes torneos aún.<br>¡Crea uno o únete con un código!</div>'; return; }
    const staleIds = [];
    const rows = await Promise.all(ids.map(async id => {
      try {
        const cfg = await window._getDoc(window._doc(window._db,'partidas',id,'config','data'));
        if(!cfg.exists()) { staleIds.push(id); return null; }
        const data = cfg.data();
        if(data.estado === 'eliminada') { staleIds.push(id); return null; }
        return { id, config:data, rol:misPartidas[id].rol||'jugador' };
      } catch(e) { return null; }
    }));
    if(staleIds.length > 0) {
      try { const cleaned = {...misPartidas}; staleIds.forEach(id => delete cleaned[id]); await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid), {partidas:cleaned}, {merge:true}); } catch(e) {}
    }
    const valid = rows.filter(Boolean).sort((a,b) => (b.config.createdAt||0)-(a.config.createdAt||0));
    if(valid.length === 0) { list.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--muted);font-family:Barlow Condensed;font-size:.85rem">No tienes torneos activos.<br>¡Crea uno o únete con un código!</div>'; return; }
    list.innerHTML = valid.map(({id, config, rol}) => {
      const icon = config.estado==='activa'?'⚽':config.estado==='completada'?'🏆':'⏳';
      const estadoBadge = config.estado==='activa'?'badge-activa':config.estado==='completada'?'badge-completa':'badge-esperando';
      const estadoTxt   = config.estado==='activa'?'Activa':config.estado==='completada'?'Completada':'Esperando';
      return `<div class="partida-row" onclick="enterPartida('${id}')">
        <div class="partida-row-icon">${icon}</div>
        <div class="partida-row-info"><div class="partida-row-name">${config.nombre}</div><div class="partida-row-meta">${window.tr("lobby_code_label")}: <strong>${config.codigo||'—'}</strong> · ${config.jugadoresCount||1}/${config.maxJugadores} ${window.tr("lobby_players")} · ${config.seleccionesPorJugador} ${window.tr("lobby_picks")}</div></div>
        <div class="partida-row-badges"><span class="badge ${rol==='admin'?'badge-admin':'badge-jugador'}">${rol==='admin'?'Admin':'Jugador'}</span><span class="badge ${estadoBadge}">${estadoTxt}</span></div>
      </div>`;
    }).join('');
  } catch(e) { list.innerHTML = '<div style="color:var(--red);font-family:Barlow Condensed;font-size:.82rem;text-align:center;padding:1rem">Error al cargar torneos.</div>'; }
}
function showCreatePartida() { document.getElementById('lobby-create-form').style.display='block'; document.getElementById('lobby-join-form').style.display='none'; document.getElementById('lobby-mis-partidas').style.display='none'; }
function showJoinPartida()   { document.getElementById('lobby-join-form').style.display='block'; document.getElementById('lobby-create-form').style.display='none'; document.getElementById('lobby-mis-partidas').style.display='none'; }
function hideCreateJoin()    { document.getElementById('lobby-create-form').style.display='none'; document.getElementById('lobby-join-form').style.display='none'; document.getElementById('lobby-mis-partidas').style.display='block'; clearMsg('create-msg'); clearMsg('join-msg'); }

async function doCreatePartida() {
  const nombre = document.getElementById('create-nombre').value.trim();
  const maxJ   = parseInt(document.getElementById('create-jugadores').value)||8;
  const sels   = parseInt(document.getElementById('create-selecciones').value)||6;
  if(!nombre) { showMsg('create-msg','error','Escribe un nombre para el torneo'); return; }
  if(maxJ<2||maxJ>16) { showMsg('create-msg','error','Entre 2 y 16 jugadores'); return; }
  const btn = document.getElementById('create-btn'); btn.disabled=true; btn.textContent='Creando…';
  try {
    const codigo    = genCodigo();
    const partidaId = 'p_'+currentUser.uid.slice(0,8)+'_'+Date.now();
    const config    = { nombre, maxJugadores:maxJ, seleccionesPorJugador:sels, adminUid:currentUser.uid, adminName:currentProfile.displayName, estado:'activa', codigo, createdAt:Date.now(), jugadoresCount:1 };
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'config','data'), config);
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'draft','data'), {[currentProfile.displayName]:Array(sels).fill('')});
    const emptyResults = {};
    ALL_TEAMS.forEach(t => { emptyResults[t] = {pg:0,pe:0,pd:0,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0}; });
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'results','data'), emptyResults);
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'draftState','data'), {phase:'pending',orders:[],currentPick:0});
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'jugadores',currentUser.uid), {displayName:currentProfile.displayName, joinedAt:Date.now(), uid:currentUser.uid});
    await window._setDoc(window._doc(window._db,'codigos',codigo), {partidaId, createdAt:Date.now()});
    await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid), {partidas:{[partidaId]:{rol:'admin',nombre}}}, {merge:true});
    btn.disabled=false; btn.textContent='Crear torneo';
    enterPartida(partidaId);
  } catch(e) { btn.disabled=false; btn.textContent='Crear torneo'; showMsg('create-msg','error','Error al crear. Intenta de nuevo.'); }
}
async function doJoinPartida() {
  const codigo = document.getElementById('join-codigo').value.trim().toUpperCase();
  if(codigo.length !== 6) { showMsg('join-msg','error','El código tiene exactamente 6 caracteres'); return; }
  const btn = document.getElementById('join-btn'); btn.disabled=true; btn.textContent='Buscando…';
  try {
    const codigoSnap = await window._getDoc(window._doc(window._db,'codigos',codigo));
    if(!codigoSnap.exists()) { showMsg('join-msg','error','Código no encontrado.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    const {partidaId} = codigoSnap.data();
    if(!partidaId) { showMsg('join-msg','error','Código inválido.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    const cfg = await window._getDoc(window._doc(window._db,'partidas',partidaId,'config','data'));
    if(!cfg.exists()) { try{await window._deleteDoc(window._doc(window._db,'codigos',codigo));}catch(e){} showMsg('join-msg','error','Este torneo ya no existe.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    const config = cfg.data();
    if(config.estado === 'eliminada') { showMsg('join-msg','error','Este torneo ha sido eliminado.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    const jugSnapPre = await window._getDoc(window._doc(window._db,'partidas',partidaId,'jugadores',currentUser.uid));
    if(jugSnapPre.exists()) {
      await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid), {partidas:{[partidaId]:{rol:config.adminUid===currentUser.uid?'admin':'jugador',nombre:config.nombre}}},{merge:true});
      btn.disabled=false; btn.textContent='Unirse al torneo'; enterPartida(partidaId); return;
    }
    if(config.estado === 'eliminada' || config.estado === 'completada') { showMsg('join-msg','warn','Este torneo ya no admite nuevos jugadores.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    const dsSnap = await window._getDoc(window._doc(window._db,'partidas',partidaId,'draftState','data'));
    if(dsSnap.exists() && dsSnap.data().phase !== 'pending') { showMsg('join-msg','warn','El draft ya ha comenzado, no puedes unirte.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    if(config.jugadoresCount >= config.maxJugadores) { showMsg('join-msg','error','El torneo está lleno.'); btn.disabled=false; btn.textContent='Unirse al torneo'; return; }
    btn.textContent = 'Uniéndose…';
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'jugadores',currentUser.uid), {displayName:currentProfile.displayName, joinedAt:Date.now(), uid:currentUser.uid});
    await window._setDoc(window._doc(window._db,'partidas',partidaId,'draft','data'), {[currentProfile.displayName]:Array(config.seleccionesPorJugador).fill('')}, {merge:true});
    await window._updateDoc(window._doc(window._db,'partidas',partidaId,'config','data'), {jugadoresCount:(config.jugadoresCount||1)+1});
    await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid), {partidas:{[partidaId]:{rol:'jugador',nombre:config.nombre}}},{merge:true});
    btn.disabled=false; btn.textContent='Unirse al torneo'; enterPartida(partidaId);
  } catch(e) { btn.disabled=false; btn.textContent='Unirse al torneo'; showMsg('join-msg','error','Error al unirse: '+e.message); }
}

async function enterPartida(partidaId) {
  currentPartidaId = partidaId;
  const blacklist = JSON.parse(localStorage.getItem('deleted_partidas')||'[]');
  if(blacklist.includes(partidaId)) {
    try { const uSnap = await window._getDoc(window._doc(window._db,'usuarios',currentUser.uid)); if(uSnap.exists()) { const mp={...(uSnap.data().partidas||{})}; delete mp[partidaId]; await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid),{partidas:mp},{merge:true}); } } catch(e) {}
    currentPartidaId = null; await loadLobby(); return;
  }
  try {
    const cfg = await window._getDoc(window._doc(window._db,'partidas',partidaId,'config','data'));
    if(!cfg.exists()||cfg.data().estado==='eliminada') {
      const bl = JSON.parse(localStorage.getItem('deleted_partidas')||'[]'); if(!bl.includes(partidaId)){bl.push(partidaId);localStorage.setItem('deleted_partidas',JSON.stringify(bl));}
      try { const uSnap=await window._getDoc(window._doc(window._db,'usuarios',currentUser.uid)); if(uSnap.exists()){const mp={...(uSnap.data().partidas||{})};delete mp[partidaId];await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid),{partidas:mp},{merge:true});} } catch(e) {}
      currentPartidaId = null; await loadLobby(); return;
    }
  } catch(e) {}
  showScreen('sala'); loadSala(partidaId);
}

// ── SALA DE ESPERA ─────────────────────────────────────────
async function loadSala(partidaId) {
  _salaListeners.forEach(u => u()); _salaListeners = [];
  const cfg = await window._getDoc(window._doc(window._db,'partidas',partidaId,'config','data'));
  if(!cfg.exists()) { alert('Este torneo ya no existe.'); goBackToLobby(); return; }
  currentPartidaConfig = cfg.data();
  if(currentPartidaConfig.estado === 'eliminada') { alert('Este torneo ha sido eliminado.'); goBackToLobby(); return; }
  if(currentPartidaConfig.estado === 'activa' || currentPartidaConfig.estado === 'completada') { enterApp(partidaId); return; }
  
  startTipRotation();
  
  const jugSnap = await window._getDocs(window._collection(window._db,'partidas',partidaId,'jugadores'));
  currentPartidaJugadores = {}; jugSnap.forEach(d => { currentPartidaJugadores[d.id] = d.data(); });
  renderSala();
  const u1 = window._onSnapshot(window._doc(window._db,'partidas',partidaId,'config','data'), snap => {
    if(!snap.exists()) { alert('Este torneo ha sido eliminado.'); goBackToLobby(); return; }
    currentPartidaConfig = snap.data();
    if(currentPartidaConfig.estado==='eliminada') { alert('Este torneo ha sido eliminado.'); goBackToLobby(); return; }
    if(currentPartidaConfig.estado==='activa'||currentPartidaConfig.estado==='completada') { _salaListeners.forEach(u=>u()); _salaListeners=[]; enterApp(partidaId); return; }
    renderSala();
  });
  const u2 = window._onSnapshot(window._collection(window._db,'partidas',partidaId,'jugadores'), snap => {
    currentPartidaJugadores = {}; snap.forEach(d => { currentPartidaJugadores[d.id] = d.data(); }); renderSala();
  });
  _salaListeners.push(u1, u2);
}
function renderSala() {
  try {
    if(!currentPartidaConfig) return;
    if(!currentUser) return;
    const cfg = currentPartidaConfig;
    const maxJ = cfg.maxJugadores || 2;
    const el = document.getElementById('sala-nombre'); if(el) el.textContent = cfg.nombre || '';
    const cEl= document.getElementById('sala-codigo-txt'); if(cEl) cEl.textContent = cfg.codigo || '';
    const jugadores = Object.values(currentPartidaJugadores || {});
    const list = document.getElementById('sala-jugadores-list');
    if(list) {
      list.innerHTML = jugadores.map(j => {
        const isMe = j.uid === currentUser.uid;
        const isOwner = j.uid === cfg.adminUid;
        const badgeClass = isOwner ? 'role-admin' : 'role-jugador';
        const badgeText = isOwner ? 'Admin' : 'Jugador';
        return `<div class="sala-jugador-circle-wrap">
          <div class="sala-jugador-circle-avatar">
            ${avatarEl(j.displayName || '?', '', 48)}
            <span class="sala-jugador-circle-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="sala-jugador-circle-name ${isMe ? 'is-me' : ''}">${j.displayName || '?'}</div>
        </div>`;
      }).join('');
    }
    // Update progress bar
    const pct = Math.min(100, Math.max(0, (jugadores.length / maxJ) * 100));
    const barFill = document.getElementById('supercell-bar-fill');
    if(barFill) barFill.style.width = `${pct}%`;
    const barText = document.getElementById('supercell-bar-text');
    if(barText) {
      barText.textContent = jugadores.length >= maxJ
        ? `¡SALA COMPLETA! (${jugadores.length}/${maxJ})`
        : `BUSCANDO JUGADORES (${jugadores.length}/${maxJ})`;
    }
    const adminArea = document.getElementById('sala-admin-actions');
    if(adminArea) {
      if(isAdmin()) {
        adminArea.style.display = 'flex';
        const startBtn = document.getElementById('sala-start-btn');
        if(startBtn) startBtn.disabled = jugadores.length < 2;
      } else {
        adminArea.style.display = 'none';
      }
    }
  } catch (err) {
    console.error('Error in renderSala():', err);
  }
}
async function copyCodigo() {
  const codigo = currentPartidaConfig?.codigo||'';
  try { await navigator.clipboard.writeText(codigo); alert(`¡Código copiado! Compártelo: ${codigo}`); }
  catch(e) { alert(`Código de invitación: ${codigo}`); }
}
async function sharePartida(codigo) {
  const url = window.location.origin + window.location.pathname + '?join=' + codigo;
  const text = `¡Únete a mi Mundial Draft 2026! ${window.tr("lobby_code_label")}: ${codigo}\nEnlace: ${url}`;
  if(navigator.share) {
    try { await navigator.share({title:'Mundial Draft 2026', text}); return; } catch(e){}
  }
  try { await navigator.clipboard.writeText(text); alert('¡Enlace copiado al portapapeles!'); }
  catch(e) { alert(`Comparte este enlace:\n${url}`); }
}
async function doStartDraft() { if(!isAdmin()||!currentPartidaId) return; await window._updateDoc(window._doc(window._db,'partidas',currentPartidaId,'config','data'),{estado:'activa'}); }
async function doDeletePartida() {
  if(!isAdmin()) return;
  if(!confirm('¿Eliminar este torneo permanentemente?')) return;
  const delBtn = document.querySelector('[onclick="doDeletePartida()"]'); if(delBtn){delBtn.disabled=true;delBtn.textContent='Eliminando…';}
  try {
    await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'config','data'),{estado:'eliminada'},{merge:true});
    const bl=JSON.parse(localStorage.getItem('deleted_partidas')||'[]'); if(!bl.includes(currentPartidaId)){bl.push(currentPartidaId);localStorage.setItem('deleted_partidas',JSON.stringify(bl));}
    const codigo=currentPartidaConfig?.codigo; if(codigo){try{await window._deleteDoc(window._doc(window._db,'codigos',codigo));}catch(e2){}}
    try { const uSnap=await window._getDoc(window._doc(window._db,'usuarios',currentUser.uid)); if(uSnap.exists()){const mp={...(uSnap.data().partidas||{})};delete mp[currentPartidaId];await window._setDoc(window._doc(window._db,'usuarios',currentUser.uid),{partidas:mp},{merge:true});} } catch(e3) {}
    goBackToLobby();
  } catch(e) { if(delBtn){delBtn.disabled=false;delBtn.textContent='🗑️ Eliminar torneo';} alert('Error al eliminar: '+e.message); }
}
function goBackToLobby() {
  window._demoMode = false;
  _salaListeners.forEach(u=>u()); _salaListeners=[];
  unsubscribeAll();
  
  stopTipRotation();
  
  currentPartidaId=null; currentPartidaConfig=null; currentPartidaJugadores={};
  showScreen('lobby'); loadLobby();
}

// ── ENTER APP ──────────────────────────────────────────────
async function enterApp(partidaId) {
  _salaListeners.forEach(u=>u()); _salaListeners=[];
  unsubscribeAll(); currentPartidaId = partidaId;
  if(partidaId !== '__DEMO__') {
    localStorage.setItem('last_partida_id', partidaId);
  }
  
  stopTipRotation();
  
  showLoadingScreen();
  try {
    const cfgSnap = await window._getDoc(window._doc(window._db,'partidas',partidaId,'config','data'));
    if(!cfgSnap.exists()) throw new Error('Torneo no encontrado');
    currentPartidaConfig = cfgSnap.data();
    if(window.unsubPreds) { window.unsubPreds(); window.unsubPreds = null; }
    window._predicciones = {};
    if(partidaId !== '__DEMO__') {
      window.unsubPreds = window._onSnapshot(window._collection(window._db, 'partidas', partidaId, 'predicciones'), snap => {
        window._predicciones = {};
        snap.forEach(d => window._predicciones[d.id] = d.data());
        if (typeof getRanking === 'function') {
          try { renderHome(); renderYo(); renderSala(); } catch(e){}
        }
      });
    }
    if(currentPartidaConfig.estado==='eliminada') { hideLoadingScreen(); alert('Este torneo ha sido eliminado.'); goBackToLobby(); return; }
    const jugSnap = await window._getDocs(window._collection(window._db,'partidas',partidaId,'jugadores'));
    currentPartidaJugadores = {}; jugSnap.forEach(d=>{currentPartidaJugadores[d.id]=d.data();});
    rebuildParticipantes();
    const draftSnap = await window._getDoc(window._doc(window._db,'partidas',partidaId,'draft','data'));
    draft = draftSnap.exists() ? draftSnap.data() : {};
    PARTICIPANTES.forEach(n => {
      if(!draft[n]) draft[n] = Array(currentPartidaConfig.seleccionesPorJugador).fill('');
    });
    const resSnap = await window._getDoc(window._doc(window._db,'partidas',partidaId,'results','data'));
    results = {}; ALL_TEAMS.forEach(t=>{results[t]={pg:0,pe:0,pd:0,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0};});
    if(resSnap.exists()){const d=resSnap.data();ALL_TEAMS.forEach(t=>{if(d[t])results[t]={...results[t],...d[t]};});}
    const dsSnap = await window._getDoc(window._doc(window._db,'partidas',partidaId,'draftState','data'));
    draftState = {phase:'pending',orders:[],currentPick:0}; if(dsSnap.exists()) draftState={...draftState,...dsSnap.data()};
    setupPartidaListeners(partidaId);
    await loadAvatarsFromFirebase(); updateNavAvatar();
    await loadMatches();
    const navP=document.getElementById('nav-partida-name'); if(navP) navP.textContent=currentPartidaConfig.nombre;
    const navN=document.getElementById('nav-name');         if(navN) navN.textContent=currentProfile.displayName;
    const heroN=document.getElementById('hero-partida-name'); if(heroN) heroN.textContent=currentPartidaConfig.nombre.toUpperCase();
    const saBadge=document.getElementById('nav-superadmin-badge'); if(saBadge) saBadge.style.display=isSuperAdmin()?'block':'none';
    setLoadingMsg('Todo listo');
    setTimeout(() => {
      hideLoadingScreen();
      showScreen('app');

      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      const validPages = ['home', 'draft', 'resultados', 'grupos', 'clasificacion', 'yo', 'reglas', 'admin'];
      const targetPage = (pageParam && validPages.includes(pageParam)) ? pageParam : 'home';

      const btn = document.querySelector(`.tab-btn[onclick*="'${targetPage}'"]`) || 
                  document.querySelector(`.bnav-item[data-page="${targetPage}"]`);
      
      const adminNavTab = document.getElementById('nav-admin-tab');
      if (adminNavTab) adminNavTab.style.display = isSuperAdmin() ? 'block' : 'none';
      const adminBnavTab = document.getElementById('bnav-admin-tab');
      if (adminBnavTab) adminBnavTab.style.display = isSuperAdmin() ? 'flex' : 'none';

      showPage(targetPage, btn);
    }, 400);
  } catch(e) { hideLoadingScreen(); showScreen('lobby'); await loadLobby(); showMsg('join-msg','error','Error al cargar el torneo: '+e.message); }
}
function rebuildParticipantes() {
  PARTICIPANTES = Object.values(currentPartidaJugadores).map(j=>j.displayName||j.email||'—');
  PARTICIPANTES_BY_UID = {};
  Object.entries(currentPartidaJugadores).forEach(([uid,j])=>{PARTICIPANTES_BY_UID[uid]=j.displayName;});
  MULTS = ALL_MULTS_CONFIG[currentPartidaConfig.seleccionesPorJugador] || ALL_MULTS_CONFIG[6];
}
function setupPartidaListeners(partidaId) {
  const u1=window._onSnapshot(window._doc(window._db,'partidas',partidaId,'draft','data'),s=>{if(s.exists()){draft=s.data()||{};refreshCurrentPage();}});
  const u2=window._onSnapshot(window._doc(window._db,'partidas',partidaId,'results','data'),s=>{if(s.exists()){const d=s.data();ALL_TEAMS.forEach(t=>{if(d[t])results[t]={...results[t],...d[t]};});refreshCurrentPage();}});
  const u3=window._onSnapshot(window._doc(window._db,'partidas',partidaId,'draftState','data'),s=>{if(s.exists()){draftState={...draftState,...s.data()};refreshCurrentPage();}});
  const u5=window._onSnapshot(window._collection(window._db,'partidas',partidaId,'jugadores'),s=>{currentPartidaJugadores={};s.forEach(d=>{currentPartidaJugadores[d.id]=d.data();});rebuildParticipantes();refreshCurrentPage();});
  
  const u6 = window._onSnapshot(window._doc(window._db, 'cache', 'admin_matches'), s => {
    if (s.exists()) {
      adminMatchesData = s.data();
      matches = applyAdminDataToMatches(adminMatchesData);
      autoSyncFromMatches();
      if (document.getElementById('page-admin')?.classList.contains('active')) renderAdminPanel();
    }
  });

  _partidaListeners=[u1,u2,u3,u5,u6];
}

// ── FIRESTORE WRITE HELPERS ────────────────────────────────
async function pushResults()    { if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'results','data'),results,{merge:true});}catch(e){console.error('Error pushResults:', e); alert('Error al guardar resultados en el servidor.');} }
async function pushDraft()      { if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'draft','data'),draft,{merge:true});}catch(e){console.error('Error pushDraft:', e); alert('Error al guardar el draft en el servidor.');} }
async function pushDraftState(ns){ if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'draftState','data'),ns,{merge:true});}catch(e){console.error('Error pushDraftState:', e); alert('Error al guardar el estado del draft.');} }

// ── MATCHES API ────────────────────────────────────────────
function normalizeMatchStage(stage) {
  if(!stage) return 'OTHER';
  if(stage==='GROUP_STAGE') return 'GROUP_STAGE';
  for(const [key,aliases] of Object.entries(KNOCKOUT_STAGE_ALIASES)){if(aliases.includes(stage))return key;}
  return 'OTHER';
}
function getStagePriority(stage) { return STAGE_PRIORITY[normalizeMatchStage(stage)] ?? STAGE_PRIORITY.OTHER; }
function getMatchWinnerTeamName(match) {
  const home=nameES(match.homeTeam?.name||''), away=nameES(match.awayTeam?.name||'');
  const fh=match.score?.fullTime?.home, fa=match.score?.fullTime?.away;
  if(fh!=null&&fa!=null&&fh!==fa) return fh>fa?home:away;
  const eh=match.score?.extraTime?.home, ea=match.score?.extraTime?.away;
  if(eh!=null&&ea!=null&&eh!==ea) return eh>ea?home:away;
  const ph=match.score?.penalties?.home, pa=match.score?.penalties?.away;
  if(ph!=null&&pa!=null&&ph!==pa) return ph>pa?home:away;
  return null;
}
function makeUtcIso(dayOffset, hour, minute=0) { const d=new Date(INAUGURAL_DATE); d.setUTCDate(d.getUTCDate()+dayOffset); d.setUTCHours(hour,minute,0,0); return d.toISOString(); }
function getSeedVenueByIndex(idx) { return VENUE_MAP[idx%VENUE_MAP.length]; }
function guessGroupFromTeams(h,a) { for(const [g,ts] of Object.entries(GRUPOS_WC2026)){if(ts.includes(h)&&ts.includes(a))return `GROUP_${g}`;} return null; }

function buildGroupSeedMatches() {
  const ms=[]; let n=1, vi=0;
  // Calendario oficial FIFA 2026 — horas en UTC, [dayOffset, hour, minute]
  // Array maps to pi (0..5): [0v1], [2v3], [0v2], [3v1], [0v3], [1v2]
  const GROUP_SCHEDULE = {
    'A': [ [0,19,0], [1,2,0], [14,1,0], [14,1,0], [7,16,0], [7,16,0] ],
    'B': [ [1,19,0], [2,19,0], [7,22,0], [8,19,0], [13,19,0], [13,19,0] ],
    'C': [ [2,22,0], [3,1,0], [9,0,30], [8,22,0], [13,22,0], [13,22,0] ],
    'D': [ [2,1,0], [3,4,0], [8,19,0], [9,3,0], [15,2,0], [15,2,0] ],
    'E': [ [3,17,0], [3,23,0], [10,20,0], [10,0,0], [14,20,0], [14,20,0] ],
    'F': [ [3,20,0], [4,2,0], [14,23,0], [14,23,0], [9,17,0], [10,4,0] ],
    'G': [ [4,19,0], [5,1,0], [16,3,0], [16,3,0], [10,19,0], [11,1,0] ],
    'H': [ [4,16,0], [4,22,0], [10,16,0], [10,22,0], [16,0,0], [16,0,0] ],
    'I': [ [5,19,0], [5,22,0], [15,19,0], [15,19,0], [11,21,0], [12,0,0] ],
    'J': [ [6,1,0], [6,4,0], [11,17,0], [12,3,0], [17,2,0], [17,2,0] ],
    'K': [ [12,17,0], [13,2,0], [15,23,30], [15,23,30], [6,17,0], [7,2,0] ],
    'L': [ [7,20,0], [6,23,0], [12,20,0], [10,23,0], [16,21,0], [16,21,0] ]
  };
  Object.entries(GRUPOS_WC2026).forEach(([group,teams])=>{
    [[0,1],[2,3],[0,2],[3,1],[0,3],[1,2]].forEach(([hi,ai],pi)=>{
      const [dayOffset, hour, minute] = GROUP_SCHEDULE[group][pi];
      const venue=getSeedVenueByIndex(vi++);
      ms.push({id:`seed-g-${group}-${pi+1}`,_seed:true,number:n++,homeTeam:{name:TEAM_MAP[teams[hi]]||teams[hi]},awayTeam:{name:TEAM_MAP[teams[ai]]||teams[ai]},utcDate:makeUtcIso(dayOffset,hour,minute||0),status:'SCHEDULED',stage:'GROUP_STAGE',group:`GROUP_${group}`,venue:venue.key,score:{winner:null,fullTime:{home:null,away:null}}});
    });
  });
  return ms;
}
function buildKnockoutSeedMatches() {
  const ms=[]; let vi=72;
  const KNOCKOUT_SCHEDULE = {
    'LAST_32': [
      [17, 19, 0], [18, 17, 0], [18, 20, 30], [19, 1, 0],
      [19, 17, 0], [19, 21, 0], [20, 1, 0], [20, 16, 0],
      [20, 20, 0], [21, 0, 0], [21, 19, 0], [21, 23, 0],
      [22, 3, 0], [22, 18, 0], [22, 22, 0], [23, 1, 30]
    ],
    'LAST_16': [
      [23, 17, 0], [23, 21, 0], [24, 20, 0], [25, 0, 0],
      [25, 19, 0], [26, 0, 0], [26, 16, 0], [26, 20, 0]
    ],
    'QUARTER_FINALS': [
      [28, 20, 0], [29, 19, 0], [30, 21, 0], [31, 1, 0]
    ],
    'SEMI_FINALS': [
      [33, 19, 0], [34, 19, 0]
    ],
    'THIRD_PLACE': [
      [37, 21, 0]
    ],
    'FINAL': [
      [38, 19, 0]
    ]
  };

  const stages = [
    { key: 'r16', label: 'LAST_32' },
    { key: 'r8', label: 'LAST_16' },
    { key: 'r4', label: 'QUARTER_FINALS' },
    { key: 'semi', label: 'SEMI_FINALS' },
    { key: 'third', label: 'THIRD_PLACE' },
    { key: 'final', label: 'FINAL' }
  ];

  stages.forEach(({ key, label }) => {
    const schedule = KNOCKOUT_SCHEDULE[label];
    schedule.forEach(([dayOffset, hour, minute], i) => {
      const venue = getSeedVenueByIndex(vi++);
      ms.push({
        id: `seed-${key}-${i+1}`,
        _seed: true,
        number: 73 + ms.length,
        homeTeam: {name: 'TBD'},
        awayTeam: {name: 'TBD'},
        utcDate: makeUtcIso(dayOffset, hour, minute),
        status: 'SCHEDULED',
        stage: label,
        venue: venue.key,
        score: {winner: null, fullTime: {home: null, away: null}}
      });
    });
  });

  return ms;
}
function buildSeedMatches() { return [...buildGroupSeedMatches(), ...buildKnockoutSeedMatches()]; }

// ── ADMIN MATCH MANAGEMENT (replaces API) ──────────────────

}
const data = buildInitialAdminMatches();

const groupMatches = [];
Object.keys(data.groups).forEach(g => {
  data.groups[g].forEach(m => {
    groupMatches.push({
      date: new Date(m.date),
      home: m.home,
      away: m.away
    });
  });
});

groupMatches.sort((a,b) => a.date - b.date);

const byDay = {};
groupMatches.forEach(m => {
  const dStr = m.date.toISOString().split('T')[0];
  if(!byDay[dStr]) byDay[dStr] = [];
  byDay[dStr].push(m);
});

const topTeams = ['France', 'Portugal', 'Argentina', 'Germany', 'England'];

const schedule = [];
Object.keys(byDay).sort().forEach(day => {
  const dayMatches = byDay[day];
  const spainMatch = dayMatches.find(m => m.home === 'Spain' || m.away === 'Spain');
  let chosen = null;
  if (spainMatch) {
    chosen = spainMatch;
  } else {
    const topMatches = dayMatches.filter(m => topTeams.includes(m.home) || topTeams.includes(m.away));
    if (topMatches.length > 0) chosen = topMatches[0];
    else chosen = dayMatches[0];
  }
  schedule.push(`- **${day}**: ${chosen.home} vs ${chosen.away}`);
});

fs.writeFileSync('schedule.txt', schedule.join('\n'));
