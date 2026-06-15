// ═══════════════════════════════════════════════════════════
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
const INAUGURAL_DATE = new Date('2026-06-11T19:00:00Z');
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
  { key:'r16',  label:'R32', slots:16 },
  { key:'r8',   label:'R16',       slots:8  },
  { key:'r4',   label:'Quarter finals',       slots:4  },
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

// ── HERO DYNAMIC MESSAGES ──────────────────────────────────
let heroMsgInterval = null;
function startHeroRotation() {
  const el = document.getElementById('hero-dynamic-msg');
  if(!el) return;
  if(heroMsgInterval) clearInterval(heroMsgInterval);

  const generateMessages = () => {
    const msgs = ["¡BIENVENIDO AL DRAFT CUP 2026!"];
    const ranking = typeof getRanking === 'function' ? getRanking() : [];
    const finishedMatches = (typeof matches !== 'undefined' ? matches : []).filter(m => m.status === 'FINISHED');

    // 1. Leader message
    if(ranking.length > 0) {
      msgs.push(`¡${ranking[0].name.toUpperCase()} LIDERA LA TABLA CON ${ranking[0].total} PUNTOS!`);
      if(ranking.length > 1) {
        msgs.push(`¡${ranking[1].name.toUpperCase()} SIGUE DE CERCA AL LÍDER EN 2ª POSICIÓN!`);
      }
    }

    // 2. Result messages
    if(finishedMatches.length > 0) {
      // Latest 3 matches
      const latest = [...finishedMatches].reverse().slice(0, 3);
      latest.forEach(m => {
        const hName = nameES(m.homeTeam?.name || '');
        const aName = nameES(m.awayTeam?.name || '');
        const hScore = m.score?.fullTime?.home;
        const aScore = m.score?.fullTime?.away;
        
        if(hScore !== null && aScore !== null) {
          msgs.push(`RESULTADO: ${hName.toUpperCase()} ${hScore}-${aScore} ${aName.toUpperCase()}`);
          
          // Owner involvement
          const hOwner = getOwnerData(hName);
          const aOwner = getOwnerData(aName);
          
          if(hOwner && aOwner && hOwner.owner !== aOwner.owner) {
            if(hScore > aScore) {
              msgs.push(`¡${hOwner.owner.toUpperCase()} SE IMPONE ANTE ${aOwner.owner.toUpperCase()} GRACIAS A ${hName.toUpperCase()}!`);
            } else if (aScore > hScore) {
              msgs.push(`¡${aOwner.owner.toUpperCase()} GANA EL DUELO A ${hOwner.owner.toUpperCase()} CON ${aName.toUpperCase()}!`);
            } else {
              msgs.push(`${hOwner.owner.toUpperCase()} Y ${aOwner.owner.toUpperCase()} REPARTEN PUNTOS EN UN DUELO DIRECTO`);
            }
          }
        }
      });
    }

    if(msgs.length === 1) msgs.push("LA GLORIA TE ESPERA EN MÉXICO, CANADÁ Y EE. UU.");
    return msgs;
  };

  let messages = generateMessages();
  let idx = 0;
  el.textContent = messages[0].toUpperCase();

  heroMsgInterval = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      // Re-generate messages occasionally to stay fresh
      if(idx === 0) messages = generateMessages();
      
      idx = (idx + 1) % messages.length;
      el.textContent = messages[idx].toUpperCase();
      el.style.opacity = '1';
    }, 500);
  }, 5000);
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
  if(renders[id]) {
    renders[id]();
    if(id === 'home') startHeroRotation();
  }
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
document.addEventListener('DOMContentLoaded', () => { window.updateLanguageUI(); });

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
    // Backward compatibility auto-fix
    if(partidaId !== '__DEMO__' && typeof currentUser !== 'undefined' && currentUser) {
      try {
        const jugRef = window._doc(window._db,'partidas',partidaId,'jugadores',currentUser.uid);
        const jSnap = await window._getDoc(jugRef);
        if(!jSnap.exists()) {
          await window._setDoc(jugRef, {displayName:currentProfile.displayName, joinedAt:Date.now(), uid:currentUser.uid}, {merge:true});
        }
        if(isAdmin()) {
          const dRef = window._doc(window._db,'partidas',partidaId,'draftState','data');
          if(!(await window._getDoc(dRef)).exists()) await window._setDoc(dRef, {phase:'pending',orders:[],currentPick:0});
          const rRef = window._doc(window._db,'partidas',partidaId,'results','data');
          if(!(await window._getDoc(rRef)).exists()) {
            const emptyResults = {};
            ALL_TEAMS.forEach(t => { emptyResults[t] = {pg:0,pe:0,pd:0,r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0}; });
            await window._setDoc(rRef, emptyResults);
          }
        }
      } catch(e) { console.warn('Backward compat patch failed:', e); }
    }

    if(window.unsubPorra) { window.unsubPorra(); window.unsubPorra = null; }
    window.unsubPorra = window._onSnapshot(window._doc(window._db, 'cache', 'porra'), snap => {
      if(snap.exists()) window._globalPorraMatchId = snap.data().matchId;
      else window._globalPorraMatchId = null;
      if (typeof getRanking === 'function') {
        try { renderHome(); renderYo(); renderClasificacion(); } catch(e){}
      }
    });
    if(window.unsubPreds) { window.unsubPreds(); window.unsubPreds = null; }
    window._predicciones = {};
    if(partidaId !== '__DEMO__') {
      window.unsubPreds = window._onSnapshot(window._collection(window._db, 'partidas', partidaId, 'jugadores'), snap => {
        window._predicciones = {};
        currentPartidaJugadores = {};
        snap.forEach(d => {
          const data = d.data();
          currentPartidaJugadores[d.id] = data;
          if (data.predicciones) {
            window._predicciones[d.id] = data.predicciones;
          }
        });
        if (typeof getRanking === 'function') {
          try { renderHome(); renderYo(); renderClasificacion(); } catch(e){}
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
      refreshCurrentPage();
      if (document.getElementById('page-admin')?.classList.contains('active')) renderAdminPanel();
    }
  });

  _partidaListeners=[u1,u2,u3,u5,u6];
}

// ── FIRESTORE WRITE HELPERS ────────────────────────────────
async function pushResults()    { if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'results','data'),results);}catch(e){} }
async function pushDraft()      { if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'draft','data'),draft);}catch(e){} }
async function pushDraftState(ns){ if(!currentPartidaId||window._demoMode) return; try{await window._setDoc(window._doc(window._db,'partidas',currentPartidaId,'draftState','data'),ns);}catch(e){} }

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
function buildInitialAdminMatches() {
  const groups = {};
  Object.entries(GRUPOS_WC2026).forEach(([g, teams]) => {
    groups[g] = GROUP_PAIRINGS.map(([hi, ai]) => ({
      home: teams[hi], away: teams[ai], homeScore: null, awayScore: null, status: 'SCHEDULED'
    }));
  });
  const knockout = {};
  const kConfig = { r16: 16, r8: 8, r4: 4, semi: 2, third: 1, final: 1 };
  Object.entries(kConfig).forEach(([key, count]) => {
    knockout[key] = Array.from({ length: count }, () => ({
      home: '', away: '', homeScore: null, awayScore: null, status: 'SCHEDULED'
    }));
  });
  return { groups, knockout, updatedAt: null, updatedBy: '' };
}

function applyAdminDataToMatches(adminData) {
  const seeds = buildSeedMatches();
  if (!adminData) return seeds;
  // Apply group match data
  Object.entries(adminData.groups || {}).forEach(([g, groupMatches]) => {
    const teams = GRUPOS_WC2026[g];
    if (!teams) return;
    groupMatches.forEach((am, idx) => {
      const [hi, ai] = GROUP_PAIRINGS[idx];
      if (!GROUP_PAIRINGS[idx]) return;
      const homeES = teams[hi], awayES = teams[ai];
      const seed = seeds.find(s => {
        const h = nameES(s.homeTeam?.name || ''), a = nameES(s.awayTeam?.name || '');
        return s.group === `GROUP_${g}` && h === homeES && a === awayES;
      });
      if (seed) {
        seed.status = am.status || 'SCHEDULED';
        if (am.homeScore != null && am.awayScore != null) {
          seed.score = {
            winner: am.status === 'FINISHED'
              ? (am.homeScore > am.awayScore ? 'HOME_TEAM' : am.homeScore < am.awayScore ? 'AWAY_TEAM' : 'DRAW')
              : null,
            fullTime: { home: am.homeScore, away: am.awayScore }
          };
        }
        if (am.status !== 'SCHEDULED') seed._seed = false;
      }
    });
  });
  // Apply knockout match data
  const koStageMap = { r16: 'LAST_32', r8: 'LAST_16', r4: 'QUARTER_FINALS', semi: 'SEMI_FINALS', third: 'THIRD_PLACE', final: 'FINAL' };
  Object.entries(adminData.knockout || {}).forEach(([key, kMatches]) => {
    const stageName = koStageMap[key];
    if (!stageName) return;
    const seedsForStage = seeds.filter(s => s.stage === stageName);
    kMatches.forEach((am, idx) => {
      if (idx >= seedsForStage.length) return;
      const seed = seedsForStage[idx];
      if (am.home) seed.homeTeam = { name: TEAM_MAP[am.home] || am.home };
      if (am.away) seed.awayTeam = { name: TEAM_MAP[am.away] || am.away };
      seed.status = am.status || 'SCHEDULED';
      if (am.homeScore != null && am.awayScore != null) {
        seed.score = {
          winner: am.status === 'FINISHED'
            ? (am.homeScore > am.awayScore ? 'HOME_TEAM' : am.homeScore < am.awayScore ? 'AWAY_TEAM' : 'DRAW')
            : null,
          fullTime: { home: am.homeScore, away: am.awayScore }
        };
      }
      if (am.status !== 'SCHEDULED' || am.home || am.away) seed._seed = false;
    });
  });
  return seeds;
}

async function loadMatches(force = false) {
  setStatus('loading', '⏳ Cargando partidos…');
  try {
    const snap = await window._getDoc(window._doc(window._db, 'cache', 'admin_matches'));
    if (snap.exists()) {
      adminMatchesData = snap.data();
    } else {
      adminMatchesData = buildInitialAdminMatches();
    }
    matches = applyAdminDataToMatches(adminMatchesData);
    const withData = matches.filter(m => m.status !== 'SCHEDULED' || !m._seed).length;
    setStatus('ok', `🟢 ${withData} partidos con datos`);
    autoSyncFromMatches();
  } catch(e) {
    console.error('Error cargando partidos admin:', e);
    matches = buildSeedMatches();
    setStatus('warn', '⚠️ Datos de seed activos');
  }
}
async function refreshMatches() { await loadMatches(true); renderResults(); }

async function autoSyncFromMatches() {
  let changed=false;
  const finished=matches.filter(m=>m.status==='FINISHED'&&m.score?.fullTime?.home!=null);
  const tally={}; ALL_TEAMS.forEach(t=>{tally[t]={pg:0,pe:0,pd:0};});
  finished.filter(m=>m.stage==='GROUP_STAGE').forEach(m=>{
    const h=nameES(m.homeTeam?.name||''),a=nameES(m.awayTeam?.name||'');
    if(!ALL_TEAMS.includes(h)||!ALL_TEAMS.includes(a))return;
    const gh=m.score.fullTime.home,ga=m.score.fullTime.away;
    if(gh>ga){tally[h].pg++;tally[a].pd++;}else if(ga>gh){tally[a].pg++;tally[h].pd++;}else{tally[h].pe++;tally[a].pe++;}
  });
  for(const [t,v] of Object.entries(tally)){if(!results[t])continue;if(results[t].pg!==v.pg||results[t].pe!==v.pe||results[t].pd!==v.pd){Object.assign(results[t],v);changed=true;}}
  const stageMap={r16:{r16:1},r8:{r16:1,r8:1},r4:{r16:1,r8:1,r4:1},semi:{r16:1,r8:1,r4:1,semi:1},final:{r16:1,r8:1,r4:1,semi:1,final:1}};
  const knockoutFlags={}; ALL_TEAMS.forEach(t=>{knockoutFlags[t]={r16:0,r8:0,r4:0,semi:0,final:0,ganador:0,bronce:0};});
  finished.forEach(m=>{
    const sk=normalizeMatchStage(m.stage);
    if(!['r16','r8','r4','semi','final','third'].includes(sk))return;
    [nameES(m.homeTeam?.name||''),nameES(m.awayTeam?.name||'')].forEach(team=>{if(!ALL_TEAMS.includes(team))return;Object.assign(knockoutFlags[team],stageMap[sk]||{});});
    const winner=getMatchWinnerTeamName(m);if(!winner||!ALL_TEAMS.includes(winner))return;
    if(sk==='final') knockoutFlags[winner].ganador=1;
    if(sk==='third') knockoutFlags[winner].bronce=1;
  });
  for(const team of ALL_TEAMS){if(!results[team])continue;const fields=['r16','r8','r4','semi','final','ganador','bronce'];let diff=false;fields.forEach(f=>{const nv=knockoutFlags[team]?.[f]||0;if(results[team][f]!==nv){results[team][f]=nv;diff=true;}});if(diff)changed=true;}
  if(changed) await pushResults();
}

// ── SCORING ────────────────────────────────────────────────
function teamGroupPts(t)  { const r=results[t]||{}; return (r.pg||0)*3+(r.pe||0); }
function teamElimRaw(t)   { const r=results[t]||{}; return (r.r16||0)*5+(r.r8||0)*8+(r.r4||0)*10+(r.semi||0)*11+(r.final||0)*12+(r.ganador||0)*10+(r.bronce||0)*5; }
function calcP(p) {
  let grp=0, elim=0, porra_pts=0;
  (draft[p]||[]).forEach((t,i)=>{if(!t)return; grp+=teamGroupPts(t); elim+=teamElimRaw(t)*(MULTS[i]||1);});

  const uid = Object.keys(PARTICIPANTES_BY_UID).find(k => PARTICIPANTES_BY_UID[k] === p);
  const pData = (uid && typeof currentPartidaJugadores !== 'undefined' && currentPartidaJugadores[uid]) ? currentPartidaJugadores[uid].predicciones?.matches || {} : {};
  Object.entries(pData).forEach(([mid, pred]) => {
    const m = typeof matches !== 'undefined' ? matches.find(x => String(x.id) === String(mid)) : null;
    if (m && m.status === 'FINISHED' && m.score?.fullTime?.home != null) {
      if (m.score.fullTime.home === pred.h && m.score.fullTime.away === pred.a) {
        porra_pts += 2;
      }
    }
  });

  return {grp:Math.round(grp*10)/10, elim:Math.round(elim*10)/10, porras: porra_pts, total:Math.round((grp+elim+porra_pts)*10)/10};
}
function getRanking() { return PARTICIPANTES.map(p=>({name:p,...calcP(p)})).sort((a,b)=>b.total-a.total); }
// ── RENDER: HOME ───────────────────────────────────────────
function renderHome() {
  const ranking=getRanking(); const myTeams=getMyTeams(); const myName=getCurrentPlayerName();
  const heroN=document.getElementById('hero-partida-name'); if(heroN&&currentPartidaConfig) heroN.textContent=currentPartidaConfig.nombre.toUpperCase();
  
  // 1. Mi Estado
  
  const podiumWrap = document.getElementById('home-podium-wrap');
  const myStatusWrap = document.getElementById('home-my-status-wrap');
  const matchDayWrap = document.getElementById('home-match-day-wrap');

  if(myStatusWrap) myStatusWrap.innerHTML = ''; // We won't use this separately anymore

  if(podiumWrap) {
    let combinedHtml = `<div style="background:var(--surf2); border:1px solid var(--border); border-radius:14px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:0.2rem">`;

    // 1. PODIUM
    if(ranking.length > 0) {
      const p1 = ranking[0]; const p2 = ranking[1]; const p3 = ranking[2];
      let podiumHtml = `<div class="podium-wrap" style="border:none; background:transparent; padding:1.5rem 0 1rem; margin-top:0; box-shadow:none; border-radius:0">`;
      if(p2) podiumHtml += `<div class="podium-step p2"><div class="podium-avatar">${avatarEl(p2.name,'',44)}</div><div class="podium-name">${p2.name}</div><div class="podium-pts">${p2.total}</div><div class="podium-base"><div class="podium-rank-num">2</div></div></div>`;
      if(p1) podiumHtml += `<div class="podium-step p1"><div class="podium-avatar">${avatarEl(p1.name,'',52)}</div><div class="podium-name">${p1.name}</div><div class="podium-pts">${p1.total}</div><div class="podium-base"><div class="podium-rank-num">1</div></div></div>`;
      if(p3) podiumHtml += `<div class="podium-step p3"><div class="podium-avatar">${avatarEl(p3.name,'',44)}</div><div class="podium-name">${p3.name}</div><div class="podium-pts">${p3.total}</div><div class="podium-base"><div class="podium-rank-num">3</div></div></div>`;
      podiumHtml += `</div>`;
      combinedHtml += podiumHtml;
    }

    // Divider
    combinedHtml += `<div style="height:1px; background:var(--border); margin:0 1.2rem"></div>`;

    // 2. MY STATUS
    const myRankIdx = ranking.findIndex(r=>r.name===myName);
    if(myRankIdx !== -1) {
      const myData = ranking[myRankIdx];
      let gapHtmlBlock = '';
      if(myRankIdx > 0) {
        const nextPlayer = ranking[myRankIdx - 1];
        const diff = Math.round((nextPlayer.total - myData.total)*10)/10;
        const pillText = window.tr("home_pts_diff").replace("{diff}", diff).replace("{name}", nextPlayer.name);
        gapHtmlBlock = `<div style="text-align:center; margin-top:0.3rem"><div style="display:inline-block; background:rgba(230,57,70,0.1); border:1px solid rgba(230,57,70,0.2); color:#e63946; padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">${pillText}</div></div>`;
      } else if (ranking.length > 1) {
        const second = ranking[1];
        const diff = Math.round((myData.total - second.total)*10)/10;
        const pillText = `Le sacas ${diff} pts a ${second.name}`;
        gapHtmlBlock = `<div style="text-align:center; margin-top:0.3rem"><div style="display:inline-block; background:rgba(46,196,182,0.1); border:1px solid rgba(46,196,182,0.2); color:var(--cyan); padding:0.3rem 0.8rem; border-radius:20px; font-size:0.75rem; font-family:'Barlow Condensed'; font-weight:700">${pillText}</div></div>`;
      }

      combinedHtml += `
        <div style="padding:0.8rem 1rem; display:flex; justify-content:center; align-items:center; width:100%">
          <div style="display:flex; align-items:center; gap:3rem">
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">${window.tr("home_your_pos")}</div>
                  <div style="font-family:'Bebas Neue';font-size:2.5rem;color:var(--gold);line-height:1;margin-top:.2rem">${myRankIdx + 1}º</div>
              </div>
              <div style="width:1px;height:40px;background:var(--border)"></div>
              <div style="text-align:center">
                  <div style="font-family:'Barlow Condensed';font-size:.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">PUNTOS</div>
                  <div style="font-family:'Bebas Neue';font-size:2.2rem;color:var(--white);line-height:1;margin-top:.2rem">${myData.total}</div>
              </div>
          </div>
        </div>
      </div> ${gapHtmlBlock}
      `;
    } else {
      combinedHtml += `</div>`;
    }
    
    podiumWrap.innerHTML = combinedHtml;
  } else if (podiumWrap) {
    podiumWrap.innerHTML = '';
  }

  // 3. Match of the Day (Rendered in its wrap)
  // 3. Match of the Day (Rendered in its wrap)
  if (matchDayWrap) {
    if (window.renderPorraCardHtml) {
      matchDayWrap.innerHTML = window.renderPorraCardHtml();
    } else {
      matchDayWrap.innerHTML = '';
    }
  }

  // 3. Tus Próximos Partidos / Partidos Calientes
  const hotMatchesWrap = document.getElementById('hot-matches-container');
  const hotMatchesTitle = document.querySelector('#home-hot-matches-wrap .section-title');
  const allDraftTeams = new Set(Object.values(draft).flat().filter(Boolean));
  if(hotMatchesWrap) {
    const liveMs = matches.filter(m=>(m.status==='IN_PLAY'||m.status==='PAUSED')&&!m._seed);
    const todayMs = matches.filter(m=>isToday(m.utcDate)&&m.status!=='FINISHED'&&!m._seed);
    const upcomingMs = matches.filter(m=>m.status==='SCHEDULED'||m.status==='TIMED');
    
    // Tus proximos partidos
    let myMatches = [];
    if(myTeams.size > 0) {
      myMatches = [...liveMs, ...todayMs, ...upcomingMs].filter(m => {
        const h=nameES(m.homeTeam?.name||''), a=nameES(m.awayTeam?.name||'');
        return myTeams.has(h) || myTeams.has(a);
      });
    }

    // Sort by date
    myMatches.sort((a,b) => {
      const liveA = a.status==='IN_PLAY'||a.status==='PAUSED' ? -1 : 1;
      const liveB = b.status==='IN_PLAY'||b.status==='PAUSED' ? -1 : 1;
      if(liveA !== liveB) return liveA - liveB;
      return new Date(a.utcDate) - new Date(b.utcDate);
    });
    
    myMatches = myMatches.slice(0, 2);

    let displayMatches = myMatches;
    let sectionLabel = `<span class="accent">${window.tr("home_my_accent")}</span> ${window.tr("home_my_title")}`;
    
    // If no matches for the user, fallback to hot matches
    if(displayMatches.length === 0) {
      let hotMatches = [...liveMs, ...todayMs, ...upcomingMs].filter(m => {
        const h=nameES(m.homeTeam?.name||''), a=nameES(m.awayTeam?.name||'');
        return allDraftTeams.has(h) || allDraftTeams.has(a);
      });
      hotMatches.sort((a,b) => {
        const liveA = a.status==='IN_PLAY'||a.status==='PAUSED' ? -1 : 1;
        const liveB = b.status==='IN_PLAY'||b.status==='PAUSED' ? -1 : 1;
        if(liveA !== liveB) return liveA - liveB;
        return new Date(a.utcDate) - new Date(b.utcDate);
      });
      displayMatches = hotMatches.slice(0, 2);
      sectionLabel = `<span class="accent">${window.tr("home_hot_accent")}</span> ${window.tr("home_hot_title")}`;
    }

    if(hotMatchesTitle) hotMatchesTitle.innerHTML = sectionLabel;
    
    if(displayMatches.length > 0) {
      hotMatchesWrap.innerHTML = displayMatches.map(m => {
        const hES=nameES(m.homeTeam?.name||'TBD'), aES=nameES(m.awayTeam?.name||'TBD');
        const ho=getOwnerData(hES), ao=getOwnerData(aES);
        const st=m.status; let sc='', stTxt='';
        if(st==='FINISHED'){sc=`<div class="hmc-score">${m.score?.fullTime?.home??'-'}–${m.score?.fullTime?.away??'-'}</div>`;stTxt='Finalizado';}
        else if(st==='IN_PLAY'||st==='PAUSED'){sc=`<div class="hmc-score live">${m.score?.fullTime?.home??0}–${m.score?.fullTime?.away??0}</div>`;stTxt='🔴 EN JUEGO';}
        else{sc=`<div class="hmc-time">${formatTime(m.utcDate)}</div>`;stTxt=formatDate(m.utcDate);}
        const stN={'FINAL':'⭐ '+window.tr('stage_final'),'THIRD_PLACE':'🥉 '+window.tr('stage_third'),'SEMI_FINALS':window.tr('stage_semi'),'QUARTER_FINALS':window.tr('stage_r8'),'LAST_16':window.tr('stage_r16'),'LAST_32':window.tr('stage_r32'),'GROUP_STAGE':window.tr('stage_groups')};
        return `
          <div class="hot-match-card">
            <div class="hmc-header">
              <div class="hmc-label">🔥 ${stN[m.stage]||window.tr("match_default_label")}</div>
              <div class="hmc-time">${stTxt}</div>
            </div>
            <div class="hmc-teams">
              <div class="hmc-team">
                ${flagImg(hES,'xl')}
                <div class="hmc-team-name">${window.tr("country_" + hES)}</div>
                ${ho ? `<div class="hmc-owner ${isSamePlayer(ho.owner, myName)?'is-me':''}">${ho.owner}</div>` : ''}
              </div>
              <div style="text-align:center">${sc}</div>
              <div class="hmc-team">
                ${flagImg(aES,'xl')}
                <div class="hmc-team-name">${window.tr("country_" + aES)}</div>
                ${ao ? `<div class="hmc-owner ${isSamePlayer(ao.owner, myName)?'is-me':''}">${ao.owner}</div>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');
    } else {
      hotMatchesWrap.innerHTML = `<div class="hot-match-card" style="text-align:center;color:var(--muted);font-family:'Barlow Condensed'">${window.tr("home_hot_none")}</div>`;
    }
  }

  // 4. Mis Selecciones
  const myTeamsSec = document.getElementById('home-my-teams-section');
  const myTeamsWrap = document.getElementById('home-my-teams-wrap');
  if (myTeams.size > 0 && myTeamsWrap) {
    if (myTeamsSec) myTeamsSec.style.display = 'block';
    const draftKey = findMyDraftKey(myName);
    const myTeamsList = draft[draftKey] || [];
    myTeamsWrap.innerHTML = myTeamsList.map((t, i) => {
      if (!t) return '';
      const r = results[t] || {};
      const gp = teamGroupPts(t);
      const ep = teamElimRaw(t);
      const em = Math.round(ep * (MULTS[i] || 1) * 10) / 10;
      const tot = Math.round((gp + em) * 10) / 10;
      return `<div class="home-team-card" style="border-color:${PLAYER_COLORS[i % PLAYER_COLORS.length]}33; cursor:pointer" onclick="showTeamMatches('${t}')">
        <div class="htc-badge" style="background:${TIER_DARK[i]}">×${MULTS[i] || 1}</div>
        <div class="htc-flag">${flagImg(t, 'md')}</div>
        <div class="htc-name">${window.tr("country_" + t)}</div>
        <div class="htc-pts">${tot} <span style="font-size:0.62rem;color:var(--muted)">pts</span></div>
      </div>`;
    }).filter(Boolean).join('');
  } else if (myTeamsSec) {
    myTeamsSec.style.display = 'none';
  }

  // 5. Sidebar Ranking
  const sb=document.getElementById('ranking-sidebar-body');
  if(sb) sb.innerHTML=ranking.map((r,i)=>`<div class="ranking-sidebar-row ${r.name===myName?'is-me':''}">${['🥇','🥈','🥉'][i]?`<div class="rsb-pos ${i===0?'p1':i===1?'p2':'p3'}">${['🥇','🥈','🥉'][i]}</div>`:`<div class="rsb-pos">${i+1}</div>`}${avatarEl(r.name,'',24)}<div class="rsb-name">${r.name}${r.name===myName?' ⭐':''}</div><div class="rsb-pts">${r.total}</div></div>`).join('');
}

function showTeamMatches(team) {
  const modal = document.getElementById('team-matches-modal');
  const header = document.getElementById('tmm-header');
  const body = document.getElementById('tmm-body');
  if(!modal || !header || !body) return;

  const teamMatches = (typeof matches !== 'undefined' ? matches : []).filter(m => {
    const h = nameES(m.homeTeam?.name || ''), a = nameES(m.awayTeam?.name || '');
    return h === team || a === team;
  });

  // Sort by date
  teamMatches.sort((a,b) => new Date(a.utcDate) - new Date(b.utcDate));

  header.innerHTML = `
    <div style="margin-bottom:1rem; transform: scale(1.2); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3))">${flagImg(team, 'xl')}</div>
    <div style="font-family:'Bebas Neue';font-size:2.8rem;color:var(--white);letter-spacing:3px;line-height:1;margin-bottom:.5rem">${window.tr("country_" + team).toUpperCase()}</div>
    <div style="display:inline-block; background:rgba(245,197,24,0.1); color:var(--gold); padding:0.4rem 1.2rem; border-radius:30px; font-family:'Barlow Condensed'; font-size:.8rem; text-transform:uppercase; letter-spacing:2px; font-weight:700">Partidos del Mundial</div>
  `;

  if(teamMatches.length === 0) {
    body.innerHTML = `<div style="text-align:center;color:var(--muted);padding:3rem;font-family:'Barlow Condensed';font-size:1.1rem;opacity:0.6 ">No hay partidos programados para esta selección.</div>`;
  } else {
    const highlightSet = new Set([team]);
    body.innerHTML = `<div style="display:flex;flex-direction:column;gap:.7rem;padding-top:.5rem">${teamMatches.map(m => renderMatchCard(m, highlightSet)).join('')}</div>`;
  }

  modal.classList.remove('hidden');
}

// ── RENDER: MATCH CARD ─────────────────────────────────────
function renderMatchCard(m, myTeams) {
  const myName=getCurrentPlayerName();
  const h=nameES(m.homeTeam?.name||'TBD'), a=nameES(m.awayTeam?.name||'TBD');
  const isMyH=myTeams.has(h), isMyA=myTeams.has(a), isMyMatch=isMyH||isMyA;
  const st=m.status; let statusHtml='', scoreHtml='';
  if(st==='FINISHED'){scoreHtml=`<div class="match-score">${m.score?.fullTime?.home??'-'}–${m.score?.fullTime?.away??'-'}</div>`;statusHtml=`<span class="match-status status-finished">FIN</span>`;}
  else if(st==='IN_PLAY'||st==='PAUSED'){scoreHtml=`<div class="match-score live">${m.score?.fullTime?.home??0}–${m.score?.fullTime?.away??0}</div>`;statusHtml=`<span class="match-status status-live">🔴 EN JUEGO</span>`;}
  else{scoreHtml=`<div class="match-time">${formatTime(m.utcDate)}</div>`;statusHtml=`<span class="match-status status-scheduled">${formatDate(m.utcDate)}</span>`;}
  const ho=getOwnerData(h), ao=getOwnerData(a);
  const hot=ho&&!isMyH?ownerTag(ho):''; const aot=ao&&!isMyA?ownerTag(ao):'';
  return `<div class="match-card ${isMyMatch?'my-team':''}"><div class="match-team"><div style="display:flex;align-items:center;gap:.4rem">${flagImg(h,'lg')}<span class="match-name">${window.tr("country_" + h)}${isMyH?`<span class="my-badge">${myName}</span>`:''}${hot}</span></div></div><div class="match-vs">${scoreHtml}${statusHtml}</div><div class="match-team away"><div style="display:flex;align-items:center;gap:.4rem;flex-direction:row-reverse">${flagImg(a,'lg')}<span class="match-name away">${window.tr("country_" + a)}${isMyA?`<span class="my-badge">${myName}</span>`:''}${aot}</span></div></div></div>`;
}

// ── RENDER: DRAFT ──────────────────────────────────────────
function getPickedTeams() { const s=new Set(); PARTICIPANTES.forEach(p=>(draft[p]||[]).forEach(t=>{if(t)s.add(t);})); return s; }
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// syncDraftStateFromPicks() removed – currentPick is now the single
// source of truth from Firestore, advanced atomically in confirmDraftPick().

async function startDraft() {
  if(!isAdmin()) return;
  const sels = currentPartidaConfig.seleccionesPorJugador;
  const orders = [];
  // Snake draft: even rounds = new random shuffle; odd rounds = reverse of previous shuffle.
  let lastShuffle = [];
  for(let r = 0; r < sels; r++) {
    let cur;
    if(r % 2 === 0) {
      lastShuffle = shuffleArray([...PARTICIPANTES]);
      cur = [...lastShuffle];
    } else {
      cur = [...lastShuffle].reverse();
    }
    cur.forEach(p => orders.push({ player: p, round: r }));
  }
  const emptyDraft = {};
  PARTICIPANTES.forEach(p => { emptyDraft[p] = Array(sels).fill(''); });
  draft = emptyDraft;
  const ns = { phase: 'active', orders, currentPick: 0 };
  draftState = ns;
  try {
    const batch = window._writeBatch(window._db);
    batch.set(window._doc(window._db, 'partidas', currentPartidaId, 'draft', 'data'), draft);
    batch.set(window._doc(window._db, 'partidas', currentPartidaId, 'draftState', 'data'), ns);
    await batch.commit();
  } catch(e) {
    console.error('Error starting draft:', e);
  }
  renderDraft();
}
async function resetDraft() { if(!isAdmin())return;if(!confirm(window.tr("draft_confirm_restart")))return;const sels=currentPartidaConfig.seleccionesPorJugador;PARTICIPANTES.forEach(p=>{draft[p]=Array(sels).fill('');});const ns={phase:'pending',orders:[],currentPick:0};draftState=ns;await pushDraft();await pushDraftState(ns);renderDraft(); }
async function randomAssignAll() {
  if(!isAdmin())return;if(!confirm(window.tr("draft_confirm_random")))return;
  const sels=currentPartidaConfig.seleccionesPorJugador;
  const teams=[...ALL_TEAMS].sort(()=>Math.random()-.5);
  PARTICIPANTES.forEach(p=>{draft[p]=Array(sels).fill('');});
  let idx=0; for(let r=0;r<sels;r++){const order=[...PARTICIPANTES].sort(()=>Math.random()-.5);order.forEach(p=>{if(idx<teams.length)draft[p][r]=teams[idx++];});}
  await pushDraft(); await pushDraftState({phase:'complete',orders:[],currentPick:PARTICIPANTES.length*sels}); renderDraft();
}
function toggleTestMode() { draftTestMode=!draftTestMode; draftTestPlayer=null; renderDraft(); }
function renderDraft() {
  if(!currentPartidaConfig) return;
  const ds=draftState; const myName=getCurrentPlayerName(); const sels=currentPartidaConfig.seleccionesPorJugador;
  const adminArea=document.getElementById('draft-admin-area');
  if(isAdmin()){const total=PARTICIPANTES.length*sels;const phaseTxt=ds.phase==='pending'?window.tr('draft_status_not_started'):ds.phase==='active'?`${window.tr("draft_pick_prefix")} ${ds.currentPick+1}/${total}`:'Completado';adminArea.innerHTML=`<div class="draft-admin-bar"><span class="draft-status-txt">${window.tr("draft_admin_title")} · ${phaseTxt}</span><div style="display:flex;gap:.4rem;flex-wrap:wrap">${ds.phase==='pending'?`<button class="btn btn-gold btn-sm" onclick="startDraft()">🎲 ${window.tr("draft_start_btn")}</button>`:`<button class="btn btn-outline btn-sm" onclick="resetDraft()">🔄 ${window.tr("draft_restart_btn")}</button>`}<button class="btn btn-outline btn-sm" onclick="randomAssignAll()">🎲 ${window.tr("draft_random_btn")}</button><button class="btn ${draftTestMode?'btn-warn':'btn-outline'} btn-sm" onclick="toggleTestMode()">🧪 ${draftTestMode?'${window.tr("draft_test_exit")}':window.tr("draft_test")}</button></div></div>`;}
  else adminArea.innerHTML='';
  const tBtn=document.getElementById('timeline-btn'); if(tBtn) tBtn.style.display=ds.currentPick>0?'inline-flex':'none';
  const isMyTurnNow=ds.phase==='active'&&isSamePlayer(ds.orders?.[ds.currentPick]?.player, myName);
  const avPanel=document.getElementById('draft-available-panel'),avGrid=document.getElementById('draft-avail-grid');
  if(draftTestMode||ds.phase==='active'||ds.phase==='complete'){
    if(avPanel) avPanel.style.display='block';
    if(avGrid){const picked=getPickedTeams();avGrid.innerHTML=ALL_TEAMS.map(t=>{const p=picked.has(t);const od=getOwnerData(t);const clickable=!p&&(isMyTurnNow||(draftTestMode&&draftTestPlayer));const onclickAttr=clickable?(draftTestMode&&draftTestPlayer?`onclick="selectTestTeam('${t}')"`:` onclick="selectDraftTeam('${t}')"`):'';return `<div class="draft-avail-chip ${p?'picked':''} ${clickable?'clickable':''}" ${onclickAttr} title="${p&&od?od.owner:'Disponible'}">${flagImg(t)} ${window.tr("country_" + t)}${p&&od?`<span style="font-size:.52rem;color:${getPlayerColor(od.owner)};margin-left:.2rem">${od.owner}</span>`:''}</div>`;}).join('');}
  }else if(avPanel) avPanel.style.display='none';
  if(draftTestMode){
    document.getElementById('draft-order-area').innerHTML='';
    document.getElementById('draft-pick-area').innerHTML=`<div class="draft-pick-panel"><div class="draft-pick-label">🧪 Modo prueba</div><div style="width:100%"><div style="font-family:'Barlow Condensed';font-size:.7rem;color:var(--muted);text-transform:uppercase;margin-bottom:.45rem">1. Elige participante:</div><div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.7rem">${PARTICIPANTES.map(p=>`<button onclick="setTestPlayer('${p}')" style="display:flex;align-items:center;gap:.25rem;padding:.25rem .55rem;border-radius:20px;font-family:'Barlow Condensed';font-size:.78rem;font-weight:700;cursor:pointer;border:1px solid ${draftTestPlayer===p?'var(--gold)':'var(--border)'};background:${draftTestPlayer===p?'rgba(245,197,24,.12)':'var(--surf2)'};color:${draftTestPlayer===p?'var(--gold)':'var(--white)'}">${avatarEl(p,'',16)} ${p} (${(draft[p]||[]).filter(Boolean).length}/${sels})</button>`).join('')}</div>${draftTestPlayer?`<div id="draft-selected-team" style="font-family:'Bebas Neue';font-size:1rem;color:var(--gold);min-height:1.3rem;margin:.3rem 0"></div><button class="draft-confirm-btn" id="draft-confirm-btn" onclick="confirmTestPick()" disabled>Asignar</button>`:`<div style="font-size:.8rem;color:var(--muted2);font-family:Barlow Condensed">← Elige participante primero</div>`}</div></div>`;
    renderPicksLog(); return;
  }
  if(ds.phase==='pending'){
    document.getElementById('draft-order-area').innerHTML='';
    const btnShare = `<button class="btn btn-outline" style="margin-top:1rem;font-family:'Barlow Condensed';font-weight:700" onclick="sharePartida('${currentPartidaConfig.codigo}')">📤 ${window.tr("draft_share_link")}</button>`;
    document.getElementById('draft-pick-area').innerHTML=`<div class="draft-pick-panel" style="min-height:260px;justify-content:center">
      <div style="font-size:2.5rem">⚽</div>
      <div class="draft-pick-name" style="font-size:1.6rem">${window.tr("draft_pending_title")}</div>
      <div style="font-size:.85rem;color:var(--muted);font-family:Barlow Condensed;margin-bottom:.5rem">${window.tr("lobby_code_label")}: <strong style="color:var(--gold);font-size:1.1rem">${currentPartidaConfig.codigo}</strong> · (${PARTICIPANTES.length}/${currentPartidaConfig.maxJugadores} jug.)</div>
      <div style="font-size:.85rem;color:var(--muted);font-family:Barlow Condensed">${isAdmin()?window.tr("draft_admin_start"):window.tr("draft_wait_admin")}</div>
      ${isAdmin() ? btnShare : ''}
    </div>`;
    document.getElementById('draft-picks-log').innerHTML=`<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1.5rem">${window.tr("draft_no_picks")}</div>`;
    return;
  }
  if(ds.phase==='complete'||ds.currentPick>=(ds.orders?.length||0)){document.getElementById('draft-order-area').innerHTML='';document.getElementById('draft-pick-area').innerHTML=`<div class="draft-pick-panel" style="min-height:260px;justify-content:center"><div style="font-size:2.5rem">🏆</div><div class="draft-pick-name">${window.tr("draft_completed_excl")}</div></div>`;renderPicksLog();return;}
  const pickIdx=ds.currentPick,cp=ds.orders[pickIdx];
  const isMyTurn=cp&&isSamePlayer(cp.player, myName); const rondaIdx=cp?cp.round:0;
  const roundOrders=ds.orders.filter(o=>o.round===rondaIdx);
  const roundStart=ds.orders.findIndex(o=>o.round===rondaIdx);
  document.getElementById('draft-order-area').innerHTML=`<div style="margin-bottom:.4rem;font-family:'Bebas Neue';font-size:1rem;letter-spacing:2px;color:var(--muted)">RONDA ${rondaIdx+1} <span style="color:${TIER_DARK[rondaIdx]}">×${MULTS[rondaIdx]||1}</span> · ${window.tr("draft_pick_prefix")} ${pickIdx+1}/${ds.orders.length}</div><div class="draft-order-strip">${roundOrders.map((o,i)=>{const isCurr=i===(pickIdx-roundStart),isPast=i<(pickIdx-roundStart);const tp=draft[o.player]?.[rondaIdx];return `<div class="draft-order-slot ${isCurr?'current':''} ${isPast?'done':''}"><div class="draft-slot-num">${i+1}</div>${avatarEl(o.player,'',32)}<div class="draft-slot-name">${o.player}</div>${tp?`<div style="font-size:.58rem;color:var(--gold);text-align:center">${flagImg(tp)} ${window.tr("country_" + tp)}</div>`:`<div style="font-size:.58rem;color:var(--muted2)">${window.tr("draft_pending_pick")}</div>`}</div>`;}).join('')}</div>`;
  const pp=document.getElementById('draft-pick-area');
  if(isMyTurn){
    // ── FIX BUG 1: guardar selección previa ANTES de reconstruir el HTML ──
    const prevSel=draftSearchSel;
    pp.innerHTML=`<div class="draft-pick-panel"><div class="draft-pick-label">${window.tr("draft_your_turn")}</div>${avatarEl(myName,'',80)}<div class="draft-pick-name">${myName}</div><div style="font-family:'Barlow Condensed';font-size:.9rem;color:var(--muted)">Ronda ${rondaIdx+1} · <span style="color:${TIER_DARK[rondaIdx]}">×${MULTS[rondaIdx]||1}</span></div><div style="width:100%"><input class="draft-team-search" type="text" placeholder="${window.tr("draft_search_placeholder")}" id="draft-search-inp" oninput="draftSearchFilter(this.value)" autocomplete="off"/><div class="draft-ac-list" id="draft-ac-list"></div></div><div id="draft-selected-team" style="font-family:'Bebas Neue';font-size:1.1rem;color:var(--gold);min-height:1.6rem"></div><button class="draft-confirm-btn" id="draft-confirm-btn" onclick="confirmDraftPick()" disabled>${window.tr("draft_confirm_btn")}</button></div>`;
    draftSearchSel=null;
    if(prevSel){
      // Restaurar la selección previa: el jugador ya había elegido antes del re-render
      selectDraftTeam(prevSel);
    } else {
      draftSearchFilter('');
    }
  }
  else{pp.innerHTML=`<div class="draft-pick-panel"><div class="draft-pick-label">${window.tr("draft_current_turn")}</div>${avatarEl(cp.player,'',80)}<div class="draft-pick-name">${cp.player}</div><div style="font-size:.82rem;color:var(--muted);font-family:'Barlow Condensed'">${window.tr("draft_wait_pick")}</div></div>`;}
  renderPicksLog();
}
function setTestPlayer(p) { draftTestPlayer=p; draftSearchSel=null; renderDraft(); }
function selectTestTeam(t) { draftSearchSel=t; const sd=document.getElementById('draft-selected-team');if(sd)sd.innerHTML=`${flagImg(t,'md')} ${t}`;const btn=document.getElementById('draft-confirm-btn');if(btn)btn.disabled=false; }
function confirmTestPick() { if(!draftSearchSel||!draftTestPlayer)return;const sels=currentPartidaConfig?.seleccionesPorJugador||6;const idx=(draft[draftTestPlayer]||[]).findIndex(t=>!t);if(idx===-1){alert(`${draftTestPlayer} ya tiene ${sels} selecciones`);return;}draft[draftTestPlayer][idx]=draftSearchSel;draftTestPlayer=null;draftSearchSel=null;renderDraft(); }
function draftSearchFilter(val) { const picked=getPickedTeams();const filtered=ALL_TEAMS.filter(t=>!picked.has(t)&&t.toLowerCase().includes(val.toLowerCase()));const list=document.getElementById('draft-ac-list');if(!list)return;if(!filtered.length){list.innerHTML='<div style="padding:.4rem .8rem;font-size:.82rem;color:var(--muted)">Sin resultados</div>';return;}list.innerHTML=filtered.map(t=>`<div class="draft-ac-item" onclick="selectDraftTeam('${t}')">${flagImg(t)} ${window.tr("country_" + t)}</div>`).join(''); }
function selectDraftTeam(team) { draftSearchSel=team;const inp=document.getElementById('draft-search-inp');if(inp)inp.value=team;const list=document.getElementById('draft-ac-list');if(list)list.innerHTML='';const sd=document.getElementById('draft-selected-team');if(sd)sd.innerHTML=`${flagImg(team,'md')} ${window.tr("country_" + team)}`;const btn=document.getElementById('draft-confirm-btn');if(btn)btn.disabled=false; }
let _draftConfirming=false;
async function confirmDraftPick() {
  if(_draftConfirming || !draftSearchSel) return;
  const ds = draftState;
  if(!ds || ds.phase !== 'active') return;

  const cp = ds.orders[ds.currentPick];
  if(!cp) return;
  const myName = getCurrentPlayerName();
  if(!isSamePlayer(cp.player, myName)) return;

  const picked = getPickedTeams();
  if(picked.has(draftSearchSel)) {
    alert('Selección ya elegida. Elige otra.');
    draftSearchSel = null;
    renderDraft();
    return;
  }

  _draftConfirming = true;
  const btn = document.getElementById('draft-confirm-btn');
  if(btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

  // Apply pick locally
  const draftKey = findMyDraftKey(myName);
  if(!draft[draftKey]) draft[draftKey] = Array(currentPartidaConfig.seleccionesPorJugador).fill('');
  draft[draftKey][cp.round] = draftSearchSel;
  draftSearchSel = null;

  // Compute next state
  const nextPick = ds.currentPick + 1;
  const nextPhase = nextPick >= ds.orders.length ? 'complete' : 'active';
  const nextState = { ...ds, currentPick: nextPick, phase: nextPhase };

  // Apply locally so UI reacts immediately
  draftState = nextState;

  try {
    if(!window._demoMode && currentPartidaId) {
      // ATOMIC: save pick + advance currentPick in one batch — eliminates stuck-turn race condition
      const batch = window._writeBatch(window._db);
      batch.set(window._doc(window._db, 'partidas', currentPartidaId, 'draft', 'data'), { [draftKey]: draft[draftKey] }, { merge: true });
      batch.set(window._doc(window._db, 'partidas', currentPartidaId, 'draftState', 'data'), nextState);
      await batch.commit();
    }
  } catch(e) {
    console.error('Error guardando pick:', e);
    // Rollback on failure so the player can retry
    draftState = ds;
    draft[draftKey][cp.round] = '';
  } finally {
    _draftConfirming = false;
  }
  renderDraft();
}
function renderPicksLog() {
  const ds=draftState; const log=document.getElementById('draft-picks-log'); if(!log)return;
  const done=ds.orders?ds.orders.slice(0,ds.currentPick):[];
  if(!done.length){log.innerHTML=`<div style="color:var(--muted);font-size:.82rem;text-align:center;padding:1.5rem">${window.tr("draft_no_picks")}</div>`;return;}
  const myName=getCurrentPlayerName(); const sels=currentPartidaConfig?.seleccionesPorJugador||6;
  const byPlayer={}; PARTICIPANTES.forEach(p=>{byPlayer[p]=[];});
  done.forEach(o=>{const team=draft[o.player]?.[o.round];if(team)byPlayer[o.player].push({team,round:o.round});});
  log.innerHTML=PARTICIPANTES.filter(p=>byPlayer[p].length>0).map(p=>`<div style="padding:.45rem .2rem;border-bottom:1px solid rgba(42,54,80,.25)"><div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem">${avatarEl(p,'',22)}<span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;color:${isSamePlayer(p,myName)?'var(--gold)':'var(--white)'}">${p}</span><span style="font-size:.62rem;color:var(--muted);font-family:'Barlow Condensed'">${byPlayer[p].length}/${sels}</span></div><div style="display:flex;flex-wrap:wrap;gap:.2rem;padding-left:28px">${byPlayer[p].map(({team,round})=>`<span style="display:inline-flex;align-items:center;gap:.2rem;background:var(--surf2);border:1px solid ${TIER_DARK[round]}44;border-radius:20px;padding:.12rem .45rem;font-size:.68rem;font-family:'Barlow Condensed';font-weight:700">${flagImg(team)} ${team}<span style="font-size:.55rem;color:${TIER_DARK[round]}">×${MULTS[round]||1}</span></span>`).join('')}</div></div>`).join('');
}
function showDraftTimeline() {
  const wrap=document.getElementById('draft-timeline-wrap'),cont=document.getElementById('draft-timeline-content');if(!wrap||!cont)return;
  const ds=draftState; const myName=getCurrentPlayerName();
  if(!ds.orders||ds.currentPick===0){cont.innerHTML='<div class="empty-state"><div class="icon">📋</div><p>Draft no iniciado</p></div>';wrap.style.display='block';return;}
  const done=ds.orders.slice(0,ds.currentPick); let lastRound=-1;
  cont.innerHTML=`<div style="position:relative;padding-left:1.8rem"><div style="position:absolute;left:.6rem;top:.5rem;bottom:.5rem;width:2px;background:linear-gradient(180deg,var(--t1),var(--t2),var(--t3),var(--t4),var(--t5),var(--t6));opacity:.4"></div>`+done.map((o,i)=>{let sep='';if(o.round!==lastRound){lastRound=o.round;sep=`<div style="font-family:'Bebas Neue';font-size:.82rem;letter-spacing:2px;color:var(--muted);padding:.3rem 0 .2rem">${window.tr("draft_ronda").replace("{round}", o.round+1)} <span style="color:${TIER_DARK[o.round]}">×${MULTS[o.round]||1}</span></div>`;}const team=draft[o.player]?.[o.round]||'—';const pts=team!=='—'?Math.round((teamGroupPts(team)+teamElimRaw(team)*(MULTS[o.round]||1))*10)/10:0;const alive=team!=='—'&&(results[team]?.r16||results[team]?.r8||results[team]?.r4||results[team]?.semi||results[team]?.final||results[team]?.ganador);return `${sep}<div style="position:relative;margin-bottom:.7rem"><div style="position:absolute;left:-1.25rem;top:.6rem;width:10px;height:10px;border-radius:50%;background:${TIER_DARK[o.round]};border:2px solid var(--bg)"></div><div style="background:var(--surface);border:1px solid ${isSamePlayer(o.player,myName)?'rgba(245,197,24,.3)':'var(--border)'};border-radius:11px;padding:.6rem .9rem;display:flex;align-items:center;gap:.7rem;${isSamePlayer(o.player,myName)?'background:rgba(245,197,24,.04)':''}"><div style="font-family:'Bebas Neue';font-size:1.2rem;color:var(--muted);min-width:22px">${i+1}</div>${avatarEl(o.player,'',26)}<div style="flex:1"><div style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700">${o.player} → ${team!=='—'?flagImg(team)+' ':''} ${team!=='—'?window.tr('country_'+team):''}</div><div style="font-size:.65rem;color:var(--muted);font-family:'Barlow Condensed'">Ronda ${o.round+1} · ×${MULTS[o.round]||1}</div>${alive?'<span style="font-size:.6rem;background:rgba(46,196,182,.12);color:var(--cyan);border-radius:6px;padding:.05rem .35rem;font-family:Barlow Condensed;font-weight:700">${window.tr("draft_alive")}</span>':pts>0?'<span style="font-size:.6rem;background:rgba(245,197,24,.1);color:var(--gold);border-radius:6px;padding:.05rem .35rem;font-family:Barlow Condensed;font-weight:700">${window.tr("draft_with_pts")}</span>':''}</div><div style="text-align:right"><div style="font-family:'Bebas Neue';font-size:1.2rem;color:var(--gold)">${pts>0?pts:'—'}</div><div style="font-size:.58rem;color:var(--muted);font-family:Barlow Condensed">${window.tr("draft_pts")}</div></div></div></div>`;}).join('')+'</div>';
  wrap.style.display='block';
  const ord=document.getElementById('draft-order-area');if(ord)ord.style.display='none';
  const dm=document.querySelector('.draft-main');if(dm)dm.style.display='none';
}
function hideDraftTimeline() { const wrap=document.getElementById('draft-timeline-wrap');if(wrap)wrap.style.display='none';const ord=document.getElementById('draft-order-area');if(ord)ord.style.display='';const dm=document.querySelector('.draft-main');if(dm)dm.style.display=''; }

// ── RENDER: RESULTADOS ─────────────────────────────────────
function switchResTab(tab, btn) {
  document.querySelectorAll('.res-tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active'); resTabActive=tab;
  document.getElementById('res-grupos-filters').style.display = tab==='grupos'?'flex':'none';
  document.getElementById('results-grid').style.display       = tab==='grupos'?'grid':'none';
  document.getElementById('res-elim-wrap').style.display      = tab==='eliminatoria'?'block':'none';
  document.getElementById('res-todos-wrap').style.display     = tab==='todos'?'block':'none';
  if(tab==='eliminatoria') renderBracket();
  if(tab==='todos') renderTodosMatches();
}
function getTeamMatches(t) { return matches.filter(m=>{const h=nameES(m.homeTeam?.name||''),a=nameES(m.awayTeam?.name||'');return h===t||a===t;}).sort((a,b)=>new Date(a.utcDate)-new Date(b.utcDate)); }
function renderResults() {
  const myTeamSet=getMyTeams();
  const banner=document.getElementById('res-admin-banner');
  if(banner) banner.innerHTML='';
  if(resTabActive==='todos'){renderTodosMatches();return;}
  if(resTabActive==='eliminatoria'){renderBracket();return;}
  document.getElementById('res-grupos-filters').style.display='flex';
  document.getElementById('results-grid').style.display='grid';
  document.getElementById('res-elim-wrap').style.display='none';
  document.getElementById('res-todos-wrap').style.display='none';
  const teams=ALL_TEAMS.filter(t=>{if(resFilter==='active')return teamGroupPts(t)+teamElimRaw(t)>0;if(resFilter==='mis')return myTeamSet.has(t);return true;}).filter(t=>t.toLowerCase().includes(resSearch.toLowerCase()));
  document.getElementById('results-grid').innerHTML=teams.map(t=>{
    const r=results[t]||{}; const gp=teamGroupPts(t),ep=teamElimRaw(t);
    const key=t.replace(/[\s\.]/g,'_'); const total3=(r.pg||0)+(r.pe||0)+(r.pd||0);
    const isMyTeam=myTeamSet.has(t); const ownerD=getOwnerData(t);
    const teamMs=getTeamMatches(t);
    const matchHtml=teamMs.length>0?`<div class="res-matches-section"><div class="res-matches-title">Partidos</div>${teamMs.map(m=>{const h=nameES(m.homeTeam?.name||''),a=nameES(m.awayTeam?.name||'');const isHome=h===t;const opp=isHome?a:h;const st=m.status;let sc='',scCls='tbd';if(st==='FINISHED'){const ms=isHome?m.score?.fullTime?.home??'-':m.score?.fullTime?.away??'-';const os=isHome?m.score?.fullTime?.away??'-':m.score?.fullTime?.home??'-';sc=`${ms}–${os}`;scCls=ms>os?'win':ms<os?'loss':'draw';}else if(st==='IN_PLAY'||st==='PAUSED'){sc='EN JUEGO';scCls='win';}else{sc=formatTime(m.utcDate);}const oo=getOwnerData(opp);return `<div class="res-match-row"><div class="res-match-opp">${flagImg(opp,'')}<span>${window.tr("country_" + opp)}</span>${oo?`<span class="owner-pill" style="${getPlayerBadgeStyle(oo.owner)};margin-left:.2rem">${oo.owner}</span>`:''}</div><span class="res-match-score ${scCls}">${sc}</span><span class="res-match-meta">${formatDate(m.utcDate)}</span></div>`;}).join('')}</div>`:'';
    const stages=[];if(r.r16)stages.push('16av');if(r.r8)stages.push('Oct');if(r.r4)stages.push('Cto');if(r.semi)stages.push('SF');if(r.final)stages.push('F');if(r.ganador)stages.push('🥇');if(r.bronce)stages.push('🥉');return `<div class="res-card" style="${isMyTeam?'border-color:rgba(245,197,24,.25);background:rgba(245,197,24,.025)':''}"><div class="res-card-top"><span class="res-name">${flagImg(t,'md')} ${t}${isMyTeam?'<span class="my-team-tag">TÚ</span>':''}${!isMyTeam&&ownerD?ownerTag(ownerD):''}</span><span class="res-pts">${Math.round((gp+ep)*10)/10} pts</span></div><div style="display:flex;gap:.8rem;font-family:'Barlow Condensed';font-size:.82rem;padding:.3rem 0"><span style="color:var(--cyan)">${r.pg||0}V</span><span style="color:var(--orange)">${r.pe||0}E</span><span style="color:var(--red)">${r.pd||0}D</span><span style="color:var(--muted)">${total3}/3</span></div>${stages.length?`<div style="display:flex;flex-wrap:wrap;gap:.2rem">${stages.map(s=>`<span style="font-size:.62rem;padding:.08rem .35rem;border-radius:8px;background:rgba(46,196,182,.1);color:var(--cyan);font-family:Barlow Condensed;font-weight:700">${s}</span>`).join('')}</div>`:''} ${matchHtml}</div>`;
  }).join('');
}
function renderTodosMatches() {
  const myTeams=getMyTeams();
  let ms=[...matches].filter(m=>{const h=nameES(m.homeTeam?.name||''),a=nameES(m.awayTeam?.name||'');const s=todosSearch.toLowerCase();if(s&&!h.toLowerCase().includes(s)&&!a.toLowerCase().includes(s))return false;if(todosFilter==='finished')return m.status==='FINISHED';if(todosFilter==='upcoming')return m.status==='SCHEDULED'||m.status==='TIMED';if(todosFilter==='mine')return myTeams.has(h)||myTeams.has(a);if(todosFilter==='live')return (m.status==='IN_PLAY'||m.status==='PAUSED')&&!m._seed;if(todosFilter==='today')return isToday(m.utcDate)&&!m._seed&&m.status!=='SCHEDULED';return true;}).sort((a,b)=>new Date(a.utcDate)-new Date(b.utcDate));
  const wrap=document.getElementById('todos-matches-list');if(!wrap)return;
  if(!ms.length){wrap.innerHTML='<div class="empty-state"><div class="icon">📋</div><p>Sin partidos</p></div>';return;}
  const byDay={}; ms.forEach(m=>{const d=formatDay(m.utcDate);if(!byDay[d])byDay[d]=[];byDay[d].push(m);});
  const stN={'FINAL':'🏆 '+window.tr('stage_final'),'THIRD_PLACE':'🥉 '+window.tr('stage_third'),'SEMI_FINALS':window.tr('stage_semi'),'QUARTER_FINALS':window.tr('stage_r8'),'LAST_16':window.tr('stage_r16'),'LAST_32':window.tr('stage_r32'),'GROUP_STAGE':window.tr('stage_groups')};
  wrap.innerHTML=Object.entries(byDay).map(([day,dms])=>`<div class="match-day-group"><div class="match-day-label">${day}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:11px;overflow:hidden;margin-bottom:.4rem">${dms.map(m=>{const h=nameES(m.homeTeam?.name||'TBD'),a=nameES(m.awayTeam?.name||'TBD');const isMyH=myTeams.has(h),isMyA=myTeams.has(a);const ho=getOwnerData(h),ao=getOwnerData(a);const st=m.status;let sc='';if(st==='FINISHED')sc=`${m.score?.fullTime?.home??0}–${m.score?.fullTime?.away??0}`;else if(st==='IN_PLAY'||st==='PAUSED')sc=`<span style="color:var(--red)">${m.score?.fullTime?.home??0}–${m.score?.fullTime?.away??0}</span>`;else sc=formatTime(m.utcDate);const hoHtml = ho ? `<span class="owner-pill" style="${getPlayerBadgeStyle(ho.owner)}">${ho.owner}</span>` : `<span style="font-size:.62rem;visibility:hidden">&nbsp;</span>`;
    const aoHtml = ao ? `<span class="owner-pill" style="${getPlayerBadgeStyle(ao.owner)}">${ao.owner}</span>` : `<span style="font-size:.62rem;visibility:hidden">&nbsp;</span>`;
    return `<div style="display:grid;grid-template-columns:1fr 85px 1fr;align-items:center;gap:.6rem;padding:.65rem .9rem;border-bottom:1px solid rgba(42,54,80,.15);${(isMyH||isMyA)?'background:rgba(245,197,24,.025)':''}"><div style="display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;min-width:0;"><div style="display:flex;align-items:center;gap:.4rem;width:100%;min-width:0;">${flagImg(h,'md')} <span style="font-family:'Barlow Condensed';font-size:.95rem;font-weight:700;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${window.tr("country_" + h)}</span></div><div style="display:flex;align-items:center;width:100%;">${hoHtml}</div></div><div style="text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="font-family:'Bebas Neue';font-size:1.15rem;letter-spacing:1px;color:var(--white);">${sc}</span><span style="font-size:.55rem;color:var(--muted2);font-family:'Barlow Condensed';text-transform:uppercase;margin-top:.15rem;letter-spacing:0.5px;">${stN[m.stage]||m.group||''}</span></div><div style="display:flex;flex-direction:column;align-items:flex-end;gap:.2rem;min-width:0;text-align:right;"><div style="display:flex;align-items:center;gap:.4rem;width:100%;min-width:0;justify-content:flex-end;"><span style="font-family:'Barlow Condensed';font-size:.95rem;font-weight:700;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;">${window.tr("country_" + a)}</span> ${flagImg(a,'md')}</div><div style="display:flex;align-items:center;justify-content:flex-end;width:100%;">${aoHtml}</div></div></div>`;}).join('')}</div></div>`).join('');
}
function filterTodosMatches(v) { todosSearch=v; renderTodosMatches(); }
function filterTodosChip(el, f) { document.querySelectorAll('#res-todos-wrap .chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); todosFilter=f; renderTodosMatches(); }
function renderBracket() {
  const bc=document.getElementById('bracket-container'); if(!bc)return;
  const myTeams=getMyTeams();
  const elimMs=matches.filter(m=>!['GROUP_STAGE','OTHER'].includes(normalizeMatchStage(m.stage)));
  bc.innerHTML=BRACKET_ROUNDS.map(({key,label,slots:slotCount})=>{
    const rms=elimMs.filter(m=>normalizeMatchStage(m.stage)===key);
    const slots=rms.length>0?rms:Array(slotCount).fill(null);
    return `<div class="bracket-round"><div class="bracket-round-title">${label}</div>${slots.map(m=>{if(!m)return `<div class="bracket-match"><div class="bracket-match-team bracket-tbd"><span style="font-size:.68rem">${window.tr("bracket_tbd")}</span></div><div class="bracket-match-team bracket-tbd"><span style="font-size:.68rem">${window.tr("bracket_tbd")}</span></div></div>`;const h=nameES(m.homeTeam?.name||'?'),a=nameES(m.awayTeam?.name||'?');const gh=m.score?.fullTime?.home,ga=m.score?.fullTime?.away;const winner=m.status==='FINISHED'?getMatchWinnerTeamName(m):null;const ho=getOwnerData(h),ao=getOwnerData(a);return `<div class="bracket-match"><div class="bracket-match-team ${winner===h?'winner':''} ${myTeams.has(h)?'my-team':''}">${flagImg(h)} ${window.tr("country_" + h)}${ho?`<span class="bracket-owner" style="${getPlayerBadgeStyle(ho.owner)}">${ho.owner}</span>`:''}${gh!=null?`<span class="bracket-score">${gh}</span>`:''}</div><div class="bracket-match-team ${winner===a?'winner':''} ${myTeams.has(a)?'my-team':''}">${flagImg(a)} ${window.tr("country_" + a)}${ao?`<span class="bracket-owner" style="${getPlayerBadgeStyle(ao.owner)}">${ao.owner}</span>`:''}${ga!=null?`<span class="bracket-score">${ga}</span>`:''}</div></div>`;}).join('')}</div>`;
  }).join('');
}
async function adjVED(team, field, delta) {
  if(!isAdmin())return;
  const r=results[team]; const nv=Math.max(0,(r[field]||0)+delta);
  const others=['pg','pe','pd'].filter(f=>f!==field).reduce((s,f)=>s+(r[f]||0),0);
  if(delta>0&&others+nv>3)return;
  r[field]=nv;
  const key=team.replace(/[\s\.]/g,'_');
  const sp=document.getElementById(`v-${key}-${field}`); if(sp) sp.textContent=r[field];
  const pEl=document.getElementById(`rpts-${key}`); if(pEl) pEl.textContent=Math.round((teamGroupPts(team)+teamElimRaw(team))*10)/10+' pts';
  await pushResults();
}
async function togResult(team, field) {
  if(!isAdmin())return;
  results[team][field]=results[team][field]?0:1;
  const order=['r16','r8','r4','semi','final'];
  if(order.includes(field)&&results[team][field]) for(let k=0;k<=order.indexOf(field);k++) results[team][order[k]]=1;
  await pushResults(); renderResults();
}
function filterResults(v) { resSearch=v; renderResults(); }
function filterChip(el, f) { document.querySelectorAll('#res-grupos-filters .chip').forEach(c=>c.classList.remove('active')); el.classList.add('active'); resFilter=f; renderResults(); }

// ── RENDER: GRUPOS ─────────────────────────────────────────
function renderGrupos() {
  const myTeams=getMyTeams();
  document.getElementById('grupos-wrap').innerHTML=Object.entries(GRUPOS_WC2026).map(([g,teams])=>{
    const sorted=[...teams].map(t=>{const r=results[t]||{};const pts=(r.pg||0)*3+(r.pe||0);const pj=(r.pg||0)+(r.pe||0)+(r.pd||0);return{t,pts,pj,pg:r.pg||0,pe:r.pe||0,pd:r.pd||0};}).sort((a,b)=>b.pts-a.pts);
    return `<div class="grupo-card"><div class="grupo-header">⚽ Grupo ${g}</div><table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--surf3)"><th style="padding:.3rem .6rem;font-family:'Barlow Condensed';font-size:.62rem;color:var(--muted);text-align:left">EQUIPO</th><th style="padding:.3rem .35rem;font-family:'Barlow Condensed';font-size:.62rem;color:var(--muted);text-align:center">PJ</th><th style="padding:.3rem .35rem;font-family:'Barlow Condensed';font-size:.62rem;color:var(--cyan);text-align:center">G</th><th style="padding:.3rem .35rem;font-family:'Barlow Condensed';font-size:.62rem;color:var(--orange);text-align:center">E</th><th style="padding:.3rem .35rem;font-family:'Barlow Condensed';font-size:.62rem;color:var(--red);text-align:center">D</th><th style="padding:.3rem .55rem;font-family:'Bebas Neue';font-size:.82rem;color:var(--gold);text-align:center">PTS</th></tr></thead><tbody>${sorted.map(({t,pts,pj,pg,pe,pd},idx)=>{const isMe=myTeams.has(t);const od=getOwnerData(t);return `<tr style="${isMe?'background:rgba(245,197,24,.06)':''}${idx<2&&pts>0?';border-left:3px solid var(--cyan)':''}"><td style="padding:.4rem .6rem;border-bottom:1px solid rgba(42,54,80,.2)"><div style="display:flex;align-items:center;gap:.35rem">${flagImg(t,'md')}<span style="font-family:'Barlow Condensed';font-size:.82rem;font-weight:${isMe?'800':'600'};color:${isMe?'var(--gold)':'var(--white)'}">${window.tr("country_" + t)}</span>${od?`<span class="owner-pill" style="${getPlayerBadgeStyle(od.owner)};font-size:.52rem">${od.owner}</span>`:''}</div></td><td style="text-align:center;font-family:'Barlow Condensed';font-size:.8rem;color:var(--muted);padding:.4rem .35rem;border-bottom:1px solid rgba(42,54,80,.2)">${pj}</td><td style="text-align:center;font-family:'Barlow Condensed';font-size:.8rem;color:var(--cyan);padding:.4rem .35rem;border-bottom:1px solid rgba(42,54,80,.2)">${pg}</td><td style="text-align:center;font-family:'Barlow Condensed';font-size:.8rem;color:var(--orange);padding:.4rem .35rem;border-bottom:1px solid rgba(42,54,80,.2)">${pe}</td><td style="text-align:center;font-family:'Barlow Condensed';font-size:.8rem;color:var(--red);padding:.4rem .35rem;border-bottom:1px solid rgba(42,54,80,.2)">${pd}</td><td style="text-align:center;font-family:'Bebas Neue';font-size:1.05rem;color:${pts>0?'var(--gold)':'var(--muted)'};padding:.4rem .55rem;border-bottom:1px solid rgba(42,54,80,.2)">${pts}</td></tr>`;}).join('')}</tbody></table></div>`;
  }).join('');
}

// ── RENDER: CLASIFICACIÓN ──────────────────────────────────
function toggleClasPlayer(name) { clasExpandedPlayer=clasExpandedPlayer===name?null:name; renderClasificacion(); }
function renderClasificacion() {
  const myName=getCurrentPlayerName();
  const ranking=getRanking(); const maxPts=Math.max(ranking[0]?.total||1,1); const medals=['🥇','🥈','🥉'];
  const isMobile = window.innerWidth <= 768;

  // Podio top 3 solo en móvil — insertar antes del clas-grid
  const clasgrid = document.getElementById('clas-grid');
  let podiumEl = document.getElementById('podium-mobile');
  if(isMobile && ranking.length >= 2) {
    if(!podiumEl) {
      podiumEl = document.createElement('div');
      podiumEl.id = 'podium-mobile';
      podiumEl.className = 'podium-mobile';
      clasgrid.parentNode.insertBefore(podiumEl, clasgrid);
    }
    // Orden podio: 2º izq, 1º centro, 3º der
    const order = [ranking[1], ranking[0], ranking[2]].filter(Boolean);
    const posClass = [['p2','#c0c0c0'], ['p1','#f5c518'], ['p3','#cd7f32']];
    podiumEl.innerHTML = order.map((r, i) => {
      const [pc, col] = posClass[i];
      const realPos = ranking.indexOf(r);
      const init = (r.name||'?').slice(0,2).toUpperCase();
      const src = getAvatar(r.name);
      const avHtml = src
        ? `<img src="${src}" class="podm-av ${pc}" style="object-fit:cover">`
        : `<div class="podm-av ${pc}">${init}</div>`;
      return `<div class="podm-item">
        ${avHtml}
        <div class="podm-name" style="color:${col}">${r.name}</div>
        <div class="podm-pts" style="color:${col}">${r.total}</div>
        <div class="podm-bar ${pc}"></div>
      </div>`;
    }).join('');
  } else if(podiumEl) {
    podiumEl.remove();
  }

  document.getElementById('clas-grid').innerHTML=ranking.map((r,i)=>{
    const isMe=r.name===myName; const pct=(r.total/maxPts*100).toFixed(1); const isExpanded=clasExpandedPlayer===r.name;
    const teams=(draft[r.name]||[]).map((t,ti)=>{if(!t)return '';const kitHtml=KIT_URLS[t]?`<img src="${KIT_URLS[t]}" style="width:14px;height:18px;object-fit:contain" onerror="this.style.display='none'" loading="lazy">`:' ';return `<span class="clas-flag-item" style="border-color:${TIER_DARK[ti]}55" title="${t} ×${MULTS[ti]||1}">${kitHtml}${flagImg(t)}<span style="color:${TIER_DARK[ti]};font-size:.52rem">×${MULTS[ti]||1}</span></span>`;}).join('');
    let detailHtml='';
    if(isExpanded){const td=(draft[r.name]||[]).map((t,idx)=>{if(!t)return '';const grp=teamGroupPts(t),er=teamElimRaw(t),em=Math.round(er*(MULTS[idx]||1)*10)/10,tot=Math.round((grp+em)*10)/10;const rv=results[t]||{};const st=[];if(rv.r16)st.push('16av');if(rv.r8)st.push('Oct');if(rv.r4)st.push('Cto');if(rv.semi)st.push('SF');if(rv.final)st.push('F');if(rv.ganador)st.push('🥇');if(rv.bronce)st.push('🥉');return `<div style="display:flex;align-items:center;gap:.4rem;padding:.3rem 0;border-bottom:1px solid rgba(42,54,80,.15)"><span class="clas-flag-item" style="border-color:${TIER_DARK[idx]}55;flex-shrink:0">${flagImg(t)}<span style="color:${TIER_DARK[idx]};font-size:.52rem">×${MULTS[idx]||1}</span></span><span style="font-family:'Barlow Condensed';font-size:.8rem;font-weight:700;flex:1">${window.tr("country_" + t)}</span><span style="font-size:.68rem;color:var(--muted);font-family:'Barlow Condensed'">${rv.pg||0}V·${rv.pe||0}E·${rv.pd||0}D</span>${st.length?`<span style="font-size:.62rem;color:var(--cyan);font-family:Barlow Condensed">${st.join(' ')}</span>`:''}<span style="font-family:'Bebas Neue';font-size:.95rem;color:var(--gold);min-width:34px;text-align:right">${tot}p</span></div>`;}).filter(Boolean).join('');detailHtml=`<div style="margin-top:.6rem;padding:.6rem .9rem;background:var(--surf2);border-radius:9px;border:1px solid var(--border)"><div style="display:flex;justify-content:space-between;margin-bottom:.4rem;font-family:'Barlow Condensed';font-size:.7rem;color:var(--muted)"><span>Grupos: <strong style="color:var(--white)">${r.grp}</strong></span><span>Elim×mult: <strong style="color:var(--cyan)">${r.elim}</strong></span><span>Total: <strong style="color:var(--gold)">${r.total}</strong></span></div>${td}</div>`;}
    return `<div class="clas-card ${i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':''} ${isMe?'is-me':''}" onclick="toggleClasPlayer('${r.name}')"><div class="clas-rank ${i===0?'p1':i===1?'p2':i===2?'p3':'pn'}">${medals[i]||i+1}</div><div class="clas-identity">${avatarEl(r.name,'',36)}<div><div class="clas-name">${r.name}${isMe?' ⭐':''}</div></div></div><div class="clas-pts-block"><div class="clas-pts-total">${r.total}</div><div class="clas-pts-detail">${isExpanded?'▲':'▼'}</div></div><div class="clas-bar" style="grid-column:1/-1"><div class="clas-bar-fill" style="width:${pct}%"></div></div>${isExpanded?`<div style="grid-column:1/-1">${detailHtml}</div>`:''}</div>`;
  }).join('');
}

// ── ADMIN PANEL ────────────────────────────────────────────
function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  adminTab = tab;
  renderAdminPanel();
}
function renderAdminPanel() {
  if (!isSuperAdmin()) {
    const cont = document.getElementById('admin-content');
    if (cont) cont.innerHTML = '<div class="empty-state"><div class="icon">🔒</div><p>Acceso restringido a Super Admins</p></div>';
    return;
  }
  if (!adminMatchesData) adminMatchesData = buildInitialAdminMatches();
  const cont = document.getElementById('admin-content');
  if (!cont) return;
  if (adminTab === 'groups') renderAdminGroups(cont);
  else renderAdminKnockout(cont);
}
function renderAdminGroups(cont) {
  const groups = adminMatchesData.groups || {};
  let html = '';
  Object.entries(GRUPOS_WC2026).forEach(([g, teams]) => {
    const gMatches = groups[g] || GROUP_PAIRINGS.map(([hi, ai]) => ({
      home: teams[hi], away: teams[ai], homeScore: null, awayScore: null, status: 'SCHEDULED'
    }));
    if (!adminMatchesData.groups) adminMatchesData.groups = {};
    if (!adminMatchesData.groups[g]) adminMatchesData.groups[g] = gMatches;

    html += `<div class="admin-group-card">
      <div class="admin-group-header">⚽ GRUPO ${g}</div>
      <div class="admin-group-matches">
        ${gMatches.map((m, i) => {
          const statusClass = m.status === 'FINISHED' ? 'st-finished' : m.status === 'IN_PLAY' ? 'st-live' : 'st-scheduled';
          const statusLabel = m.status === 'FINISHED' ? '✅ FIN' : m.status === 'IN_PLAY' ? '🔴 LIVE' : '⏳ PROG';
          return `<div class="admin-match-row">
            <div class="admin-match-team">${flagImg(m.home)} <span>${window.tr("country_" + m.home)}</span></div>
            <div class="admin-match-score">
              <input type="number" class="admin-score-input" id="admin-g-${g}-${i}-h" value="${m.homeScore ?? ''}" min="0" max="20" placeholder="-">
              <span class="admin-score-sep">–</span>
              <input type="number" class="admin-score-input" id="admin-g-${g}-${i}-a" value="${m.awayScore ?? ''}" min="0" max="20" placeholder="-">
            </div>
            <div class="admin-match-team away">${flagImg(m.away)} <span>${window.tr("country_" + m.away)}</span></div>
            <button class="admin-status-btn ${statusClass}" onclick="adminCycleStatus('groups','${g}',${i})">${statusLabel}</button>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  html += `<div class="admin-last-update">${adminMatchesData.updatedAt ? (currentLang==='en'?'🕓 Last update: ':'🕓 Última actualización: ') + new Date(adminMatchesData.updatedAt).toLocaleString(currentLang === 'en' ? 'en-US' : 'es-ES') + (adminMatchesData.updatedBy ? (currentLang==='en'?' by ':' por ') + adminMatchesData.updatedBy : '') : (currentLang==='en'?'Not updated yet':'Sin actualizar aún')}</div>`;
  
  let superAdminHtml = '';
  if (isSuperAdmin() && typeof window.renderSuperAdminPorraHtml === 'function') {
    superAdminHtml = window.renderSuperAdminPorraHtml();
  }
  cont.innerHTML = superAdminHtml + html;
}
function renderAdminKnockout(cont) {
  const knockout = adminMatchesData.knockout || {};
  if (!adminMatchesData.knockout) adminMatchesData.knockout = {};
  const rounds = [
    { key: 'r16', label: '🏟️ R32', count: 16 },
    { key: 'r8', label: '🏟️ OCTAVOS DE FINAL', count: 8 },
    { key: 'r4', label: '🏟️ CUARTOS DE FINAL', count: 4 },
    { key: 'semi', label: '🏟️ SEMI FINALS', count: 2 },
    { key: 'third', label: '🥉 TERCER PUESTO', count: 1 },
    { key: 'final', label: '🏆 GRAN FINAL', count: 1 }
  ];
  let html = '';
  rounds.forEach(({ key, label, count }) => {
    let rMatches = knockout[key] || Array.from({ length: count }, () => ({
      home: '', away: '', homeScore: null, awayScore: null, status: 'SCHEDULED'
    }));
    while (rMatches.length < count) rMatches.push({ home: '', away: '', homeScore: null, awayScore: null, status: 'SCHEDULED' });
    if (!adminMatchesData.knockout[key]) adminMatchesData.knockout[key] = rMatches;

    html += `<div class="admin-knockout-section">
      <div class="admin-knockout-header">${label} <span class="admin-knockout-count">${count} partido${count > 1 ? 's' : ''}</span></div>
      ${rMatches.slice(0, count).map((m, i) => {
        const statusClass = m.status === 'FINISHED' ? 'st-finished' : m.status === 'IN_PLAY' ? 'st-live' : 'st-scheduled';
        const statusLabel = m.status === 'FINISHED' ? '✅ FIN' : m.status === 'IN_PLAY' ? '🔴 LIVE' : '⏳ PROG';
        return `<div class="admin-match-row admin-ko-row">
          <select class="admin-team-select" id="admin-k-${key}-${i}-home">
            <option value="" ${!m.home ? 'selected' : ''}>— TBD —</option>
            ${ALL_TEAMS.map(t => `<option value="${t}" ${m.home === t ? 'selected' : ''}>${window.tr("country_" + t)}</option>`).join('')}
          </select>
          <div class="admin-match-score">
            <input type="number" class="admin-score-input" id="admin-k-${key}-${i}-h" value="${m.homeScore ?? ''}" min="0" max="20" placeholder="-">
            <span class="admin-score-sep">–</span>
            <input type="number" class="admin-score-input" id="admin-k-${key}-${i}-a" value="${m.awayScore ?? ''}" min="0" max="20" placeholder="-">
          </div>
          <select class="admin-team-select" id="admin-k-${key}-${i}-away">
            <option value="" ${!m.away ? 'selected' : ''}>— TBD —</option>
            ${ALL_TEAMS.map(t => `<option value="${t}" ${m.away === t ? 'selected' : ''}>${window.tr("country_" + t)}</option>`).join('')}
          </select>
          <button class="admin-status-btn ${statusClass}" onclick="adminCycleStatus('knockout','${key}',${i})">${statusLabel}</button>
        </div>`;
      }).join('')}
    </div>`;
  });
  html += `<div class="admin-last-update">${adminMatchesData.updatedAt ? (currentLang==='en'?'🕓 Last update: ':'🕓 Última actualización: ') + new Date(adminMatchesData.updatedAt).toLocaleString(currentLang === 'en' ? 'en-US' : 'es-ES') + (adminMatchesData.updatedBy ? (currentLang==='en'?' by ':' por ') + adminMatchesData.updatedBy : '') : (currentLang==='en'?'Not updated yet':'Sin actualizar aún')}</div>`;
  
  let superAdminHtml = '';
  if (isSuperAdmin() && typeof window.renderSuperAdminPorraHtml === 'function') {
    superAdminHtml = window.renderSuperAdminPorraHtml();
  }
  cont.innerHTML = superAdminHtml + html;
}
function adminCycleStatus(type, key, idx) {
  if (!adminMatchesData) return;
  adminCollectInputs();
  const statusCycle = ['SCHEDULED', 'IN_PLAY', 'FINISHED'];
  let target;
  if (type === 'groups') {
    if (!adminMatchesData.groups?.[key]?.[idx]) return;
    target = adminMatchesData.groups[key][idx];
  } else {
    if (!adminMatchesData.knockout?.[key]?.[idx]) return;
    target = adminMatchesData.knockout[key][idx];
  }
  const curIdx = statusCycle.indexOf(target.status);
  target.status = statusCycle[(curIdx + 1) % statusCycle.length];
  renderAdminPanel();
}
function adminCollectInputs() {
  if (!adminMatchesData) return;
  Object.entries(GRUPOS_WC2026).forEach(([g]) => {
    if (!adminMatchesData.groups?.[g]) return;
    adminMatchesData.groups[g].forEach((m, i) => {
      const hEl = document.getElementById(`admin-g-${g}-${i}-h`);
      const aEl = document.getElementById(`admin-g-${g}-${i}-a`);
      if (hEl) m.homeScore = hEl.value !== '' ? parseInt(hEl.value) : null;
      if (aEl) m.awayScore = aEl.value !== '' ? parseInt(aEl.value) : null;
    });
  });
  ['r16', 'r8', 'r4', 'semi', 'third', 'final'].forEach(key => {
    if (!adminMatchesData.knockout?.[key]) return;
    adminMatchesData.knockout[key].forEach((m, i) => {
      const homeEl = document.getElementById(`admin-k-${key}-${i}-home`);
      const awayEl = document.getElementById(`admin-k-${key}-${i}-away`);
      const hEl = document.getElementById(`admin-k-${key}-${i}-h`);
      const aEl = document.getElementById(`admin-k-${key}-${i}-a`);
      if (homeEl) m.home = homeEl.value;
      if (awayEl) m.away = awayEl.value;
      if (hEl) m.homeScore = hEl.value !== '' ? parseInt(hEl.value) : null;
      if (aEl) m.awayScore = aEl.value !== '' ? parseInt(aEl.value) : null;
    });
  });
}
async function adminSaveAll() {
  if (!isSuperAdmin() || !adminMatchesData) return;
  adminCollectInputs();
  adminMatchesData.updatedAt = Date.now();
  adminMatchesData.updatedBy = currentUser?.email || '';
  const btn = document.getElementById('admin-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ GUARDANDO…'; }
  try {
    await window._setDoc(window._doc(window._db, 'cache', 'admin_matches'), adminMatchesData);
    matches = applyAdminDataToMatches(adminMatchesData);
    autoSyncFromMatches();
    if (btn) { btn.textContent = '✅ GUARDADO'; setTimeout(() => { btn.disabled = false; btn.textContent = '💾 GUARDAR CAMBIOS'; }, 2500); }
  } catch(e) {
    console.error('Error guardando admin matches:', e);
    if (btn) { btn.disabled = false; btn.textContent = '❌ ERROR · REINTENTAR'; }
    alert('Error al guardar: ' + e.message);
  }
}

// ── RENDER: YO ─────────────────────────────────────────────
const getSimStages = () => [
  {value:'none',label:window.tr('sim_none')||'No advance'},
  {value:'r16',label:(window.tr('sim_r16')||'R32')+' (5 pts)'},
  {value:'r8',label:(window.tr('sim_r8')||'R16')+' (+8)'},
  {value:'r4',label:(window.tr('sim_r4')||'Quarter finals')+' (+10)'},
  {value:'semi',label:(window.tr('sim_semi')||'Semi finals')+' (+11)'},
  {value:'final',label:(window.tr('sim_final')||'Finalist')+' (+12)'},
  {value:'ganador',label:(window.tr('sim_winner')||'🥇 Winner')+' (+10)'}
];
const SIM_PTS    = {none:0,r16:5,r8:13,r4:23,semi:34,final:46,ganador:56};
function getCurrentSimStage(t) { const r=results[t]||{};if(r.ganador)return'ganador';if(r.final)return'final';if(r.semi)return'semi';if(r.r4)return'r4';if(r.r8)return'r8';if(r.r16)return'r16';return'none'; }
function calcSimTotal() {
  const p=getCurrentPlayerName(); if(!p) return {grp:0,elim:0,total:0};
  let grp=0,elim=0;
  (draft[p]||[]).forEach((t,i)=>{if(!t)return;grp+=teamGroupPts(t);const rawPts=SIM_PTS[simSelections[t]||'none']||0;elim+=rawPts*(MULTS[i]||1);});
  return {grp:Math.round(grp*10)/10,elim:Math.round(elim*10)/10,total:Math.round((grp+elim)*10)/10};
}
function renderSimInline() { const w=document.getElementById('yo-sim-wrap');if(w)renderSimulator(w); }
function renderSimulator(container) {
  const p=getCurrentPlayerName();if(!p||!currentPartidaConfig){container.innerHTML='';return;}
  const teams=(draft[p]||[]).filter(Boolean);if(!teams.length){container.innerHTML='';return;}
  teams.forEach(t=>{if(simSelections[t]===undefined)simSelections[t]=getCurrentSimStage(t);});
  const current=calcP(p);const sim=calcSimTotal();const diff=Math.round((sim.total-current.total)*10)/10;
  container.innerHTML=`<div class="sim-wrap"><div style="font-family:'Bebas Neue';font-size:1.2rem;letter-spacing:2px;color:var(--gold);margin-bottom:.3rem">${window.tr("yo_sim_title")}</div><div style="font-size:.73rem;color:var(--muted);font-family:'Barlow Condensed';margin-bottom:.9rem">${window.tr("yo_sim_desc")}</div>${teams.map(t=>{const i=draft[p].indexOf(t);const sel=simSelections[t]||'none';const pts=Math.round((SIM_PTS[sel]||0)*(MULTS[i]||1)*10)/10;return `<div class="sim-team-row"><span class="sim-mult" style="background:${TIER_DARK[i]}">×${MULTS[i]||1}</span>${flagImg(t,'md')}<span class="sim-team-name">${window.tr('country_' + t)}</span><select class="sim-stage-select" onchange="simSelections['${t}']=this.value;renderSimInline()">${getSimStages().map(s=>`<option value="${s.value}" ${sel===s.value?'selected':''}>${s.label}</option>`).join('')}</select><span class="sim-pts-preview">${pts}p</span></div>`;}).join('')}<div class="sim-result"><div><div style="font-family:'Barlow Condensed';font-size:.72rem;color:var(--muted)">Actual</div><div style="font-family:'Bebas Neue';font-size:1.4rem;color:var(--white)">${current.total}</div></div><div style="color:var(--muted);font-size:1.2rem">→</div><div><div style="font-family:'Barlow Condensed';font-size:.72rem;color:var(--muted)">Simulación</div><div class="sim-result-max">${sim.total}</div></div><div><div style="font-family:'Barlow Condensed';font-size:.72rem;color:var(--muted)">Ganas</div><div class="sim-diff">+${diff}</div></div></div></div>`;
}
function renderYo() {
  const cont=document.getElementById('yo-content');if(!cont)return;
  const myName=getCurrentPlayerName();
  if(!myName||!currentProfile){cont.innerHTML='<div class="empty-state"><div class="icon">👤</div><p>Inicia sesión primero</p></div>';return;}
  const ranking=getRanking(),myRank=ranking.findIndex(r=>r.name===myName)+1,myScore=calcP(myName);
  const currentHash=`${myName}|${myScore.total}|${myScore.grp}|${myScore.elim}|${(draft[myName]||[]).join(',')}`;
  if(currentHash===_yoLastHash)return; _yoLastHash=currentHash;
  const myDraftKey = findMyDraftKey(myName);
const myTeamsList = draft[myDraftKey] || [];
  const teamDetails=myTeamsList.map((t,i)=>{if(!t)return null;const r=results[t]||{};const grp=teamGroupPts(t),er=teamElimRaw(t),em=Math.round(er*(MULTS[i]||1)*10)/10,tot=Math.round((grp+em)*10)/10;const st=[];if(r.r16)st.push(window.tr('sim_r16')||'R32');if(r.r8)st.push(window.tr('sim_r8')||'R16');if(r.r4)st.push(window.tr('sim_r4')||'Quarter finals');if(r.semi)st.push(window.tr('sim_semi')||'Semi finals');if(r.final)st.push(window.tr('sim_final')||'Finalist');if(r.ganador)st.push(window.tr('sim_winner')||'🥇 Winner');if(r.bronce)st.push('🥉 Bronce');return{t,i,grp,er,em,tot,st,r};}).filter(Boolean);
  const src=getAvatar(myName);
  const bigAv=src?`<img src="${src}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--gold)" alt="${myName}">`:`<div style="width:80px;height:80px;border-radius:50%;background:var(--surf2);border:3px solid var(--gold);display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue';font-size:2rem;color:var(--gold)">${myName.slice(0,2).toUpperCase()}</div>`;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let pwaSection = '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (!isStandalone && isMobile) {
    if (deferredPrompt) {
      pwaSection = `<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">${window.tr("yo_app_title")}</span> ${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.6rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4">${window.tr("yo_app_install_desc1")}</div><button class="btn btn-gold btn-sm" onclick="doInstallApp()" style="margin-top:.4rem;padding:.6rem;font-size:1rem;font-family:'Bebas Neue';letter-spacing:1px">${window.tr("yo_app_install_btn")}</button></div>`;
    } else if (isIOS) {
      pwaSection = `<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">${window.tr("yo_app_title")}</span> ${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem;display:flex;flex-direction:column;gap:.6rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4">${window.tr("yo_app_install_desc2")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4;background:rgba(255,255,255,0.05);padding:.8rem;border-radius:8px;display:flex;flex-direction:column;gap:.8rem"><div style="display:flex;gap:.5rem"><div style="font-weight:bold;color:var(--gold);font-family:'Bebas Neue';font-size:1.1rem">1.</div><div>${window.tr("yo_app_install_step1")}<div style="font-size:.75rem;color:var(--muted2);margin-top:.3rem;line-height:1.5">• <b>Safari:</b> Abajo en el centro <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-bottom:2px"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg><br>• <b>Chrome:</b> Arriba a la derecha en el buscador</div></div></div><div style="display:flex;gap:.5rem"><div style="font-weight:bold;color:var(--gold);font-family:'Bebas Neue';font-size:1.1rem">2.</div><div>${window.tr("yo_app_install_step2")}</div></div></div></div>`;
    } else {
      pwaSection = `<div class="section-title" style="margin-top:1.5rem">📱 <span class="accent">${window.tr("yo_app_title")}</span> ${window.tr("yo_app_mobile")}</div><div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:1rem;margin-bottom:1.5rem"><div style="font-family:'Barlow Condensed';font-weight:700;font-size:1rem;color:var(--white)">${window.tr("yo_app_install_title")}</div><div style="font-size:.85rem;color:var(--muted);line-height:1.4;margin-top:.4rem">${window.tr("yo_app_install_desc3")}</div></div>`;
    }
  }
  cont.innerHTML=`<div class="yo-hero"><div class="yo-hero-top"><div style="display:flex;flex-direction:column;align-items:center;gap:.3rem">${bigAv}<label style="cursor:pointer;font-size:.7rem;color:var(--muted);font-family:'Barlow Condensed';display:flex;align-items:center;gap:.3rem;margin-top:.4rem">${window.tr("yo_hero_change_pic")}<input type="file" accept="image/*" style="display:none" onchange="handleYoPhotoUpload(this)"></label></div><div><div class="yo-name">${myName}</div><div class="yo-rank-lbl">${window.tr('yo_hero_pos')||'Position'} #${myRank} ${window.tr('yo_hero_of')||'of'} ${PARTICIPANTES.length}</div><div class="yo-total">${myScore.total} pts</div></div><button class="btn btn-outline btn-sm" onclick="showPlayerCard()" style="margin-left:auto;align-self:flex-start">${window.tr("yo_card")}</button></div><div class="yo-stats"><div class="yo-stat"><div class="v">${myScore.total}</div><div class="l">${window.tr("yo_stats_total")}</div></div><div class="yo-stat"><div class="v">${myScore.grp}</div><div class="l">Pts grupos</div></div><div class="yo-stat"><div class="v">${myScore.elim}</div><div class="l">Pts elim ×mult</div></div>
     <div class="yo-stat"><div class="v">${myScore.porras||0}</div><div class="l">${window.tr("porra_pts_label")}</div></div></div></div>${pwaSection}<div id="yo-sim-wrap"></div><div class="section-title">🎽 <span class="accent">${window.tr("yo_teams_accent")}</span> ${window.tr("yo_teams_title")}</div><div class="yo-equipos">${teamDetails.length>0?teamDetails.map(({t,i,grp,er,em,tot,st,r})=>`<div class="yo-eq" style="border-color:${TIER_DARK[i]}44"><span class="yo-mult-badge" style="background:${TIER_DARK[i]}30;color:${TIER_DARK[i]}">×${MULTS[i]||1} · R${i+1}</span><div class="yo-eq-top">${flagImg(t,'xl')}<div><div class="yo-eq-name">${window.tr('country_' + t)}</div><div class="yo-eq-sub">${r.pg||0}V · ${r.pe||0}E · ${r.pd||0}D</div></div></div><div class="yo-eq-pts">${tot} pts</div><div class="yo-eq-sub">${window.tr('yo_stats_grp')||'Grupos'}: ${grp} · ${window.tr('yo_stats_elim')||'Elim'}: ${er}×${MULTS[i]||1}=${em}</div>${st.length>0?`<div class="yo-elim-tags">${st.map(s=>`<span class="yo-elim-tag${s.includes('CAMPEÓN')||s.includes('Bronce')?' gold':''}">${s}</span>`).join('')}</div>`:'<div style="font-size:.7rem;color:var(--muted2);margin-top:.4rem;font-family:Barlow Condensed">' + (window.tr('yo_no_elim_progress')||'No elimination progress yet') + '</div>'}</div>`).join(''):`<div style="color:var(--muted);font-family:'Barlow Condensed';padding:1rem 0">${window.tr("yo_no_teams")}</div>`}</div>${pwaSection}<!-- FIX 3: Acciones de cuenta en Yo -->

<div class="section-title"><span class="accent" data-i18n="yo_acc_accent">${window.tr('yo_acc_accent')}</span> <span data-i18n="yo_acc_title">${window.tr('yo_acc_title')}</span></div>
<div style="background:var(--surface);border:1px solid var(--border);border-radius:13px;overflow:hidden;margin-bottom:1.5rem">
  <div style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;border-bottom:1px solid rgba(42,54,80,.4);">
    <span style="font-size:1.2rem">🌐</span>
    <span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1" data-i18n="profile_language_title">${window.tr('profile_language_title')}</span>
    <select onchange="window.setLanguage(this.value)" style="background:rgba(255,255,255,.05);color:var(--white);border:1px solid var(--border);border-radius:6px;padding:.3rem .5rem;font-family:'Barlow Condensed';font-size:.85rem;cursor:pointer">
      <option value="es" ${currentLang === 'es' ? 'selected' : ''}>Español</option>
      <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
    </select>
  </div>
  <div style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;border-bottom:1px solid rgba(42,54,80,.4);cursor:pointer" onclick="showChangeNickname()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    <span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1">${window.tr("yo_change_nick")}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </div>
  <div style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;border-bottom:1px solid rgba(42,54,80,.4);cursor:pointer" onclick="goBackToLobby()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    <span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1">${window.tr("yo_my_tournaments")}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </div>
  <div style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;cursor:pointer" onclick="doLogout()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    <span style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1;color:var(--red)">${window.tr("yo_logout")}</span>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </div>
</div>

<div class="section-title">🔔 <span class="accent">${window.tr("yo_notifications")}</span></div>
<div id="yo-notifications-container" style="background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:0;margin-bottom:1.5rem;font-family:'Barlow Condensed';overflow:hidden">
  
  <!-- Clickable Header to Toggle -->
  <div onclick="toggleNotificationsCollapse()" style="display:flex;align-items:center;gap:.8rem;padding:.85rem 1rem;cursor:pointer;user-select:none">
    <span id="yo-notif-summary" style="font-family:'Barlow Condensed';font-size:.88rem;font-weight:700;flex:1;color:var(--white)">
      ${window.tr("yo_notif_config")}
    </span>
    <!-- Arrow Icon -->
    <svg id="yo-notif-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted2)" stroke-width="2" style="transition: transform 0.3s; transform: rotate(0deg)">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </div>

  <!-- Collapsible Content Panel -->
  <div id="yo-notif-content-panel" style="max-height:0px;overflow:hidden;transition:max-height 0.35s ease-out;padding:0 1rem 0 1rem">
    
    <!-- State 1: Need Permission -->
    <div id="yo-push-prompt" style="display:none;flex-direction:column;gap:.6rem;padding-bottom:1rem">
      <div style="font-size:.85rem;color:var(--muted);line-height:1.3">
        ${window.tr("yo_notif_prompt_desc")}
      </div>
      <button class="btn btn-gold btn-sm" onclick="requestNotificationPermission()" style="display:flex;align-items:center;justify-content:center;gap:.4rem;font-family:'Bebas Neue';font-size:1rem;letter-spacing:1px;padding:.5rem;margin-top:.3rem;width:100%">
        ${window.tr("yo_notif_prompt_btn")}
      </button>
    </div>
    
    <!-- State 2: Settings Toggles -->
    <div id="yo-push-settings" style="display:none;flex-direction:column;gap:.85rem;padding-bottom:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
        <div style="flex:1">
          <div style="font-size:.92rem;font-weight:700;color:var(--white)">${window.tr("yo_notif_opt1_title")}</div>
          <div style="font-size:.75rem;color:var(--muted)">${window.tr("yo_notif_opt1_desc")}</div>
        </div>
        <label class="switch-control">
          <input type="checkbox" id="notif-matches" onchange="saveNotificationSettings()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div style="border-top:1px solid rgba(42,54,80,.4)"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
        <div style="flex:1">
          <div style="font-size:.92rem;font-weight:700;color:var(--white)">${window.tr("yo_notif_opt2_title")}</div>
          <div style="font-size:.75rem;color:var(--muted)">${window.tr("yo_notif_opt2_desc")}</div>
        </div>
        <label class="switch-control">
          <input type="checkbox" id="notif-ranking" onchange="saveNotificationSettings()">
          <span class="switch-slider"></span>
        </label>
      </div>
      <div style="border-top:1px solid rgba(42,54,80,.4)"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem">
        <div style="flex:1">
          <div style="font-size:.92rem;font-weight:700;color:var(--white)">${window.tr("yo_notif_opt3_title")}</div>
          <div style="font-size:.75rem;color:var(--muted)">${window.tr("yo_notif_opt3_desc")}</div>
        </div>
        <label class="switch-control">
          <input type="checkbox" id="notif-reminders" onchange="saveNotificationSettings()">
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>
    
    <!-- State 3: Denied Permission -->
    <div id="yo-push-denied" style="display:none;flex-direction:column;gap:.4rem;text-align:center;padding-bottom:1rem">
      <div style="font-size:1.2rem">⚠️</div>
      <div style="font-size:.9rem;font-weight:700;color:var(--white)">${window.tr("yo_notif_blocked")}</div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.3">
        ${window.tr("yo_notif_blocked_desc")}
      </div>
    </div>

    <!-- State 4: Unsupported Browser -->
    <div id="yo-push-unsupported" style="display:none;flex-direction:column;gap:.4rem;text-align:center;padding-bottom:1rem">
      <div style="font-size:1.2rem">ℹ️</div>
      <div style="font-size:.9rem;font-weight:700;color:var(--white)">${window.tr("yo_notif_unsupported_title")}</div>
      <div style="font-size:.78rem;color:var(--muted);line-height:1.3">
        ${window.tr("yo_notif_unsupported")}
      </div>
    </div>
  </div>
</div>

`;
  const simWrap=document.getElementById('yo-sim-wrap');if(simWrap)renderSimulator(simWrap);
  setTimeout(() => { if (typeof updateNotificationSettingsUI === 'function') updateNotificationSettingsUI(); }, 50);
}
function handleYoPhotoUpload(input) { resizeAndUploadAvatar(getCurrentPlayerName(), input.files[0], ()=>{ updateNavAvatar(); _yoLastHash=''; renderYo(); }); }

// ── NOTIFICACIONES SETTINGS ───────────────────────────────
function toggleNotificationsCollapse() {
  const panel = document.getElementById('yo-notif-content-panel');
  const arrow = document.getElementById('yo-notif-arrow');
  if (!panel || !arrow) return;
  const isCollapsed = panel.style.maxHeight === '0px' || !panel.style.maxHeight;
  if (isCollapsed) {
    panel.style.maxHeight = '500px';
    arrow.style.transform = 'rotate(180deg)';
    window._yoNotifExpanded = true;
  } else {
    panel.style.maxHeight = '0px';
    arrow.style.transform = 'rotate(0deg)';
    window._yoNotifExpanded = false;
  }
}

function updateNotificationSettingsUI() {
  const container = document.getElementById('yo-notifications-container');
  if (!container) return;

  const promptEl = document.getElementById('yo-push-prompt');
  const settingsEl = document.getElementById('yo-push-settings');
  const deniedEl = document.getElementById('yo-push-denied');
  const unsupportedEl = document.getElementById('yo-push-unsupported');

  if (!promptEl || !settingsEl || !deniedEl || !unsupportedEl) return;

  // Hide all initially
  promptEl.style.display = 'none';
  settingsEl.style.display = 'none';
  deniedEl.style.display = 'none';
  unsupportedEl.style.display = 'none';

  // Restore expansion state from window memory
  const panel = document.getElementById('yo-notif-content-panel');
  const arrow = document.getElementById('yo-notif-arrow');
  if (panel && arrow) {
    if (window._yoNotifExpanded) {
      panel.style.maxHeight = '500px';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      panel.style.maxHeight = '0px';
      arrow.style.transform = 'rotate(0deg)';
    }
  }

  if (!('Notification' in window)) {
    unsupportedEl.style.display = 'flex';
    const summaryEl = document.getElementById('yo-notif-summary');
    if (summaryEl) summaryEl.textContent = 'No soportado';
    return;
  }

  const permission = Notification.permission;
  const summaryEl = document.getElementById('yo-notif-summary');

  if (permission === 'denied') {
    deniedEl.style.display = 'flex';
    if (summaryEl) {
      summaryEl.textContent = 'Bloqueadas (Ver ayuda)';
      summaryEl.style.color = 'var(--red)';
    }
  } else if (permission === 'default') {
    promptEl.style.display = 'flex';
    if (summaryEl) {
      summaryEl.textContent = '${window.tr("yo_notif_enable")}';
      summaryEl.style.color = 'var(--white)';
    }
  } else if (permission === 'granted') {
    settingsEl.style.display = 'flex';
    // Load existing settings
    let saved = { matches: true, ranking: true, reminders: true };
    try {
      const stored = localStorage.getItem('notification_settings');
      if (stored) {
        saved = JSON.parse(stored);
      }
    } catch(e) {}
    
    const m = document.getElementById('notif-matches');
    const r = document.getElementById('notif-ranking');
    const rem = document.getElementById('notif-reminders');
    if (m) m.checked = saved.matches !== false;
    if (r) r.checked = saved.ranking !== false;
    if (rem) rem.checked = saved.reminders !== false;

    if (summaryEl) {
      const active = [];
      if (saved.matches !== false) active.push('⚽');
      if (saved.ranking !== false) active.push('🏆');
      if (saved.reminders !== false) active.push('⏰');
      if (active.length > 0) {
        summaryEl.textContent = `${window.tr('yo_active_settings')||'Ajustes activos:'} ${active.join(' ')}`;
      } else {
        summaryEl.textContent = '${window.tr("yo_notif_disabled")}';
      }
      summaryEl.style.color = 'var(--white)';
    }

    // Registrar suscripción de push
    if (typeof subscribeUserToPush === 'function') subscribeUserToPush();
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return;
  try {
    const permission = await Notification.requestPermission();
    updateNotificationSettingsUI();
    if (permission === 'granted') {
      saveNotificationSettings();
      if (typeof subscribeUserToPush === 'function') subscribeUserToPush();
    }
  } catch(e) {
    console.error("Error requesting permission", e);
  }
}

async function saveNotificationSettings() {
  const m = document.getElementById('notif-matches');
  const r = document.getElementById('notif-ranking');
  const rem = document.getElementById('notif-reminders');
  
  const settings = {
    matches: m ? m.checked : true,
    ranking: r ? r.checked : true,
    reminders: rem ? rem.checked : true,
    updatedAt: Date.now()
  };

  localStorage.setItem('notification_settings', JSON.stringify(settings));

  if (currentUser && window._setDoc && window._doc && window._db) {
    try {
      await window._setDoc(
        window._doc(window._db, 'usuarios', currentUser.uid),
        { notificationSettings: settings },
        { merge: true }
      );
    } catch(e) {
      console.error("Error saving settings to Firestore", e);
    }
  }
}

async function subscribeUserToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try {
    const registration = await navigator.serviceWorker.ready;
    const publicVapidKey = "Yv0MJ-7hh85BN23Md2iQEMHIo6M80ByBwOTaJ7m6Geo";
    if (!publicVapidKey || publicVapidKey.includes("TU_CLAVE_PUBLICA_VAPID")) return;

    const convertedKey = urlBase64ToUint8Array(publicVapidKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    if (currentUser && window._setDoc && window._doc && window._db) {
      await window._setDoc(
        window._doc(window._db, 'usuarios', currentUser.uid),
        { pushSubscription: JSON.parse(JSON.stringify(subscription)) },
        { merge: true }
      );
      console.log("PushSubscription guardada en Firestore.");
    }
  } catch(e) {
    console.error("Error al registrar PushSubscription:", e);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



// ── PLAYER CARD (Canvas) ───────────────────────────────────
function showPlayerCard() {
  const modal=document.getElementById('card-modal'); const canvas=document.getElementById('player-card-canvas'); if(!modal||!canvas)return;
  const ctx=canvas.getContext('2d'); const W=480,H=640; canvas.width=W; canvas.height=H;
  const myName=getCurrentPlayerName(); const ranking=getRanking();
  const myRank=ranking.findIndex(r=>r.name===myName)+1; const myScore=calcP(myName); const myTeams=draft[myName]||[];
  const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#07090f');grad.addColorStop(.5,'#0d1525');grad.addColorStop(1,'#07090f');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(245,197,24,0.06)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#f5c518');bg.addColorStop(.5,'#d4a017');bg.addColorStop(1,'#f5c518');ctx.strokeStyle=bg;ctx.lineWidth=3;ctx.strokeRect(8,8,W-16,H-16);
  ctx.font='48px serif';ctx.fillText('🏆',W-72,60);
  ctx.fillStyle='#f5c518';ctx.font='bold 13px Arial';let tx=28;for(const ch of 'MUNDIAL DRAFT 2026'){ctx.fillText(ch,tx,44);tx+=ctx.measureText(ch).width+2.5;}
  ctx.fillStyle='#eef2ff';ctx.font='bold 40px Arial';ctx.fillText(myName.toUpperCase(),28,96);
  ctx.fillStyle='#7a8ba8';ctx.font='15px Arial';ctx.fillText((window.tr('yo_hero_pos')||'Position') + ' #' + myRank + ' ' + (window.tr('yo_hero_of')||'of') + ' ' + PARTICIPANTES.length,28,122);
  ctx.fillStyle='#f5c518';ctx.font='bold 50px Arial';ctx.fillText(`${myScore.total}`,28,185);
  ctx.fillStyle='#7a8ba8';ctx.font='17px Arial';ctx.fillText('PUNTOS TOTALES',28,208);
  ctx.strokeStyle='rgba(245,197,24,0.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(28,226);ctx.lineTo(W-28,226);ctx.stroke();
  ctx.fillStyle='#7a8ba8';ctx.font='11px Arial';ctx.fillText('MIS SELECCIONES',28,250);
  myTeams.filter(Boolean).forEach((t,i)=>{
    const col=i%2,row=Math.floor(i/2);const x=28+col*218,y=266+row*70;
    ctx.fillStyle='rgba(26,34,53,0.8)';roundRect(ctx,x,y,202,58,8);ctx.fill();
    ctx.fillStyle=TIER_DARK[myTeams.indexOf(t)];roundRect(ctx,x,y,4,58,2);ctx.fill();
    ctx.font='22px serif';ctx.fillText(FLAGS[t]||'🏳️',x+11,y+35);
    ctx.fillStyle='#eef2ff';ctx.font='bold 13px Arial';ctx.fillText(t,x+42,y+26);
    const tPts=Math.round((teamGroupPts(t)+teamElimRaw(t)*(MULTS[myTeams.indexOf(t)]||1))*10)/10;
    ctx.fillStyle='#f5c518';ctx.font='bold 15px Arial';ctx.fillText(`${tPts} pts`,x+42,y+45);
    ctx.fillStyle=TIER_DARK[myTeams.indexOf(t)];roundRect(ctx,x+152,y+8,44,20,4);ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 11px Arial';ctx.fillText(`×${MULTS[myTeams.indexOf(t)]||1}`,x+158,y+22);
  });
  ctx.fillStyle='rgba(122,139,168,0.5)';ctx.font='11px Arial';ctx.fillText('footballdraft2026.app',28,H-18);ctx.fillText(new Date().toLocaleDateString(currentLang === 'en' ? 'en-US' : 'es-ES'),W-110,H-18);
  modal.classList.remove('hidden');
}
function roundRect(ctx,x,y,w,h,r) { ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath(); }
function downloadPlayerCard() { const canvas=document.getElementById('player-card-canvas');if(!canvas)return;const a=document.createElement('a');a.download=`draft2026_${getCurrentPlayerName()}.png`;a.href=canvas.toDataURL('image/png');a.click(); }


window.getPartidoDelDia = function() {
  if (typeof matches === 'undefined' || !matches) return null;
  if (window._globalPorraMatchId) {
    const override = matches.find(m => String(m.id) === String(window._globalPorraMatchId));
    if (override) return override;
  }
  const hoyMs = matches.filter(m => {
    if (!m.utcDate) return false;
    const d = new Date(m.utcDate);
    const today = new Date();
    return d.getDate()===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();
  });
  const candidates = hoyMs.length > 0 ? hoyMs : matches.filter(m => m.status === 'SCHEDULED' || m.status === 'TIMED');
  if (candidates.length === 0) return null;
  
  const spainMatch = candidates.find(m => m.homeTeam?.name==='Spain' || m.awayTeam?.name==='Spain');
  if(spainMatch) return spainMatch;

  const topTeams = ['France', 'Portugal', 'Argentina', 'Germany', 'England'];
  const topMatches = candidates.filter(m => topTeams.includes(m.homeTeam?.name) || topTeams.includes(m.awayTeam?.name));
  if(topMatches.length > 0) return topMatches[0];

  return candidates[0];
};

window.savePrediccion = async function(mId) {
  const hVal = document.getElementById('porra-h').value;
  const aVal = document.getElementById('porra-a').value;
  if(!hVal || !aVal) { alert(window.tr('porra_invalid')); return; }
  const h = parseInt(hVal); const a = parseInt(aVal);
  if(isNaN(h) || isNaN(a)) { alert(window.tr('porra_invalid')); return; }
  
  
  const m = window.getPartidoDelDia();
  if(!m || String(m.id) !== String(mId) || m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED') {
    alert(window.tr ? window.tr('porra_closed') : 'El partido ya ha comenzado o finalizado. No se aceptan más predicciones.');
    return;
  }
  const msg = window.tr ? window.tr('porra_confirm') : '¿Estás seguro? Solo puedes guardar la predicción una vez.';
  if(!confirm(msg)) return;
  
  if(typeof window._authUser === 'undefined' || !window._authUser || typeof currentPartidaId === 'undefined' || !currentPartidaId) return;
  try {
    const docRef = window._doc(window._db, 'partidas', currentPartidaId, 'jugadores', window._authUser.uid);
    await window._setDoc(docRef, { predicciones: { matches: { [mId]: { h, a, ts: Date.now() } } } }, { merge: true });
    alert(window.tr('porra_saved') || 'Predicción Guardada');
  } catch (e) {
    alert("Error de permisos en BD: " + e.message);
  }
};

window.renderPorraCardHtml = function() {
  const m = window.getPartidoDelDia();
  if(!m) return '';
  const isTimeClosed = m.status === 'IN_PLAY' || m.status === 'PAUSED' || m.status === 'FINISHED';
  
  let userPred = null;
  if(typeof window._authUser !== 'undefined' && window._authUser && window._predicciones && window._predicciones[window._authUser.uid] && window._predicciones[window._authUser.uid].matches) {
    userPred = window._predicciones[window._authUser.uid].matches[m.id];
  }
  
  const hName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name));
  const aName = window.tr("country_" + (typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name));

  const hImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name), 'md') : '';
  const aImg = typeof flagImg !== 'undefined' ? flagImg((typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name), 'md') : '';

  const isClosed = isTimeClosed || !!userPred;
  const hVal = userPred ? userPred.h : '';
  const aVal = userPred ? userPred.a : '';

  const baseHtml = `
  <div style="background:linear-gradient(135deg, rgba(230,183,17,0.08) 0%, var(--surf2) 100%); border:1px solid rgba(230,183,17,0.4); border-radius:14px; padding:1rem 1rem; margin:0; box-shadow:0 4px 12px rgba(0,0,0,0.15)">
    
    <div style="text-align:center; margin-bottom:1.5rem">
        <div style="font-family:'Bebas Neue';font-size:1.4rem;color:var(--gold);letter-spacing:1px">🔥 ${window.tr("porra_title")}</div>
        <div style="font-family:'Barlow Condensed';font-size:.8rem;color:var(--muted);margin-top:.3rem;line-height:1.4;max-width:280px;margin:0 auto">${window.tr("porra_desc")}</div>
    </div>
    
    <div style="display:flex;align-items:center;justify-content:center;gap:1rem">
      
      <!-- Home Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.4rem;flex:1">
        ${hImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">${hName}</span>
      </div>

      <div style="display:flex;align-items:center;gap:.5rem">
        <input type="number" id="porra-h" value="${hVal}" ${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid rgba(230,183,17,0.3);color:var(--white);border-radius:8px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2)">
        <span style="font-family:'Barlow Condensed';color:var(--gold);font-weight:700">-</span>
        <input type="number" id="porra-a" value="${aVal}" ${isClosed?'disabled':''} style="width:45px;height:45px;text-align:center;font-family:'Bebas Neue';font-size:1.5rem;background:var(--surface);border:1px solid rgba(230,183,17,0.3);color:var(--white);border-radius:8px;box-shadow:inset 0 2px 4px rgba(0,0,0,0.2)">
      </div>
      
      <!-- Away Team -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:.4rem;flex:1">
        ${aImg}
        <span style="font-family:'Barlow Condensed';font-weight:700;font-size:.9rem;text-align:center;color:var(--white)">${aName}</span>
      </div>
    </div>
    
    <div style="margin-top:1.5rem">
      ${isClosed && !userPred ? 
        `<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--muted);background:var(--surface);padding:.8rem;border-radius:8px;border:1px solid var(--border)">${window.tr("porra_closed")}</div>` : 
      userPred ? 
        `<div style="text-align:center;font-family:'Barlow Condensed';font-weight:700;color:var(--cyan);background:rgba(46,196,182, 0.1);padding:.8rem;border-radius:8px;border:1px solid rgba(46,196,182, 0.3)">✓ ${window.tr("porra_done")}</div>` :
        `<button class="btn btn-gold" style="width:100%;padding:.8rem;font-size:1.1rem;letter-spacing:1px;border-radius:8px" onclick="window.savePrediccion('${m.id}')">${window.tr("porra_save")}</button>`
      }
    </div>`;

  let othersHtml = '';
  if (isTimeClosed) {
    let predsListHtml = '';
    if (typeof currentPartidaJugadores !== 'undefined' && currentPartidaJugadores) {
       Object.keys(currentPartidaJugadores).forEach(uid => {
          const pData = currentPartidaJugadores[uid];
          const pName = pData.nombre || 'Jugador';
          const pPreds = window._predicciones && window._predicciones[uid] ? window._predicciones[uid].matches : null;
          const matchPred = pPreds ? pPreds[m.id] : null;
          
          if (matchPred) {
             predsListHtml += `
               <div style="display:flex; justify-content:space-between; align-items:center; padding:.6rem; border-bottom:1px solid var(--border)">
                  <div style="display:flex; align-items:center; gap:.5rem">
                     ${typeof avatarEl !== 'undefined' ? avatarEl(pName, '', 28) : ''}
                     <span style="font-family:'Barlow Condensed'; color:var(--white); font-weight:500; font-size:1.05rem">${pName}</span>
                  </div>
                  <div style="font-family:'Bebas Neue'; color:var(--gold); font-size:1.3rem; letter-spacing:1px; background:rgba(230,183,17,0.1); padding:0.2rem 0.6rem; border-radius:4px; border:1px solid rgba(230,183,17,0.2)">
                     ${matchPred.h} - ${matchPred.a}
                  </div>
               </div>
             `;
          } else {
             predsListHtml += `
               <div style="display:flex; justify-content:space-between; align-items:center; padding:.6rem; border-bottom:1px solid rgba(255,255,255,0.02)">
                  <div style="display:flex; align-items:center; gap:.5rem; opacity:0.5">
                     ${typeof avatarEl !== 'undefined' ? avatarEl(pName, '', 28) : ''}
                     <span style="font-family:'Barlow Condensed'; color:var(--muted)">${pName}</span>
                  </div>
                  <div style="font-family:'Barlow Condensed'; color:var(--muted); font-size:.9rem; opacity:0.6; font-style:italic">
                     Sin predicción
                  </div>
               </div>
             `;
          }
       });
    }
    
    if (predsListHtml) {
       othersHtml = `
         <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px dashed rgba(230,183,17,0.3)">
            <div style="font-family:'Barlow Condensed'; font-size:.9rem; color:var(--gold); margin-bottom:.8rem; text-align:center; letter-spacing:1px; text-transform:uppercase">
               Predicciones de la Liga
            </div>
            <div style="background:var(--surf2); border-radius:8px; border:1px solid rgba(255,255,255,0.05); overflow:hidden">
               ${predsListHtml}
            </div>
         </div>
       `;
    }
  }

  return baseHtml + othersHtml + `</div>`;
};

window.renderSuperAdminPorraHtml = function() {
  if (typeof matches === 'undefined' || !matches || !matches.length) return '';
  const currentVal = window._globalPorraMatchId || '';
  
  let html = `<div style="background:linear-gradient(to right, #2a3650, #151d2f); border:1px solid var(--gold); border-radius:12px; padding:1.2rem; margin-bottom:1.5rem">
    <div style="font-family:'Bebas Neue'; color:var(--gold); font-size:1.4rem; margin-bottom:.5rem">👑 CONTROL SUPER-ADMIN: PORRA DEL DÍA</div>
    <div style="font-size:.8rem; color:var(--muted); font-family:'Barlow Condensed'; margin-bottom:1rem">Este partido se fijará como la predicción diaria para TODAS las ligas. Si no eliges ninguno, el sistema usará la lógica automática.</div>
    <div style="display:flex; gap:.5rem">
      <select id="super-admin-porra-select" style="flex:1; background:var(--surf2); color:var(--white); border:1px solid var(--border); border-radius:8px; padding:.5rem; font-family:'Barlow Condensed'">
        <option value="">-- Automático --</option>`;
        
  const sortedMatches = [...matches].sort((a,b) => {
    const dA = a.utcDate ? new Date(a.utcDate).getTime() : 0;
    const dB = b.utcDate ? new Date(b.utcDate).getTime() : 0;
    if (dA === dB) return String(a.id).localeCompare(String(b.id));
    return dA - dB;
  });
  sortedMatches.forEach(m => {
    const hName = typeof nameES !== 'undefined' ? nameES(m.homeTeam?.name||'') : m.homeTeam?.name;
    const aName = typeof nameES !== 'undefined' ? nameES(m.awayTeam?.name||'') : m.awayTeam?.name;
    const h = window.tr("country_" + hName) || hName;
    const a = window.tr("country_" + aName) || aName;
    const dStr = m.utcDate ? new Date(m.utcDate).toLocaleDateString() : 'Sin Fecha';
    html += `<option value="${m.id}" ${currentVal === String(m.id) ? 'selected' : ''}>${dStr} | ${h} vs ${a} (${m.status})</option>`;
  });
  
  html += `</select>
      <button class="btn btn-gold" onclick="window.saveSuperAdminPorra()">FIJAR PARTIDO</button>
    </div>
  </div>`;
  return html;
};

window.saveSuperAdminPorra = async function() {
  const val = document.getElementById('super-admin-porra-select').value;
  try {
    await window._setDoc(window._doc(window._db, 'cache', 'porra'), { matchId: val, updatedAt: Date.now() }, { merge: true });
    alert('Partido fijado correctamente para todas las ligas.');
  } catch(e) { alert('Error: ' + e.message); }
};
