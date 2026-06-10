const fs = require('fs');

const blockEs = `
    home_hero_sub: "Elige tus selecciones · Compite por la gloria",
    home_hero_opening: "Partido inaugural",
    time_days: "días",
    time_hours: "horas",
    time_mins: "min",
    time_secs: "seg",
    nav_table: "Tabla",
    res_tab_cal: "Calendario",
    res_tab_teams: "Por equipo",
    res_tab_bracket: "Bracket",
    search_team: "Buscar equipo...",
    filter_all: "Todos",
    filter_finished: "Finalizados",
    filter_upcoming: "Pendientes",
    filter_mine: "Mis equipos",
    filter_live: "En juego",
    filter_today: "Hoy",
`;
const blockEn = `
    home_hero_sub: "Draft your teams · Compete for glory",
    home_hero_opening: "Opening match",
    time_days: "days",
    time_hours: "hours",
    time_mins: "mins",
    time_secs: "secs",
    nav_table: "Standings",
    res_tab_cal: "Schedule",
    res_tab_teams: "By team",
    res_tab_bracket: "Bracket",
    search_team: "Search team...",
    filter_all: "All",
    filter_finished: "Finished",
    filter_upcoming: "Upcoming",
    filter_mine: "My teams",
    filter_live: "Live",
    filter_today: "Today",
`;

// 1. Update translations.js
let trans = fs.readFileSync('js/translations.js', 'utf8');
trans = trans.replace(/nav_home: "Inicio",/g, blockEs + ' nav_home: "Inicio",');
trans = trans.replace(/nav_home: "Home",/g, blockEn + ' nav_home: "Home",');
fs.writeFileSync('js/translations.js', trans);
fs.writeFileSync('draft2026/js/translations.js', trans);

// 2. Update HTML
const htmlFiles = ['index.html', 'draft2026/index.html'];
htmlFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let html = fs.readFileSync(f, 'utf8');

  // Hero
  html = html.replace(/<div class="home-hero-sub" id="hero-partida-sub">Elige tus selecciones · Compite por la gloria<\/div>/g, '<div class="home-hero-sub" id="hero-partida-sub" data-i18n="home_hero_sub">Elige tus selecciones · Compite por la gloria</div>');
  html = html.replace(/<div class="ls-countdown-label">Partido inaugural<\/div>/g, '<div class="ls-countdown-label" data-i18n="home_hero_opening">Partido inaugural</div>');
  html = html.replace(/>Partido inaugural<\/div>/g, ' data-i18n="home_hero_opening">Partido inaugural</div>');
  
  // Countdown
  html = html.replace(/<div class="ls-time-unit">días<\/div>/g, '<div class="ls-time-unit" data-i18n="time_days">días</div>');
  html = html.replace(/<div class="ls-time-unit">horas<\/div>/g, '<div class="ls-time-unit" data-i18n="time_hours">horas</div>');
  html = html.replace(/<div class="ls-time-unit">min<\/div>/g, '<div class="ls-time-unit" data-i18n="time_mins">min</div>');
  html = html.replace(/<div class="ls-time-unit">seg<\/div>/g, '<div class="ls-time-unit" data-i18n="time_secs">seg</div>');

  // Nav Tabla
  html = html.replace(/<span class="bnav-label">Tabla<\/span>/g, '<span class="bnav-label" data-i18n="nav_table">Tabla</span>');

  // Res Tabs
  html = html.replace(/<button class="res-tab active" onclick="switchResTab\('todos',this\)">Calendario<\/button>/g, '<button class="res-tab active" onclick="switchResTab(\'todos\',this)" data-i18n="res_tab_cal">Calendario</button>');
  html = html.replace(/<button class="res-tab" onclick="switchResTab\('grupos',this\)">Por equipo<\/button>/g, '<button class="res-tab" onclick="switchResTab(\'grupos\',this)" data-i18n="res_tab_teams">Por equipo</button>');
  html = html.replace(/<button class="res-tab" onclick="switchResTab\('eliminatoria',this\)">Bracket<\/button>/g, '<button class="res-tab" onclick="switchResTab(\'eliminatoria\',this)" data-i18n="res_tab_bracket">Bracket</button>');

  // Search
  html = html.replace(/placeholder="Buscar equipo…"/g, 'placeholder="Buscar equipo..." data-i18n-placeholder="search_team"');
  
  // Filters
  html = html.replace(/<button class="chip active" onclick="filterChip\('all'\)">Todos<\/button>/g, '<button class="chip active" onclick="filterChip(\'all\')" data-i18n="filter_all">Todos</button>');
  html = html.replace(/<button class="chip active" onclick="filterTodosChip\(this,'all'\)">Todos<\/button>/g, '<button class="chip active" onclick="filterTodosChip(this,\'all\')" data-i18n="filter_all">Todos</button>');
  html = html.replace(/<button class="chip" onclick="filterTodosChip\(this,'finished'\)">Finalizados<\/button>/g, '<button class="chip" onclick="filterTodosChip(this,\'finished\')" data-i18n="filter_finished">Finalizados</button>');
  html = html.replace(/<button class="chip" onclick="filterTodosChip\(this,'upcoming'\)">Pendientes<\/button>/g, '<button class="chip" onclick="filterTodosChip(this,\'upcoming\')" data-i18n="filter_upcoming">Pendientes</button>');
  html = html.replace(/<button class="chip" onclick="filterTodosChip\(this,'mine'\)">Mis equipos<\/button>/g, '<button class="chip" onclick="filterTodosChip(this,\'mine\')" data-i18n="filter_mine">Mis equipos</button>');
  html = html.replace(/<button class="chip" onclick="filterTodosChip\(this,'live'\)">En juego<\/button>/g, '<button class="chip" onclick="filterTodosChip(this,\'live\')" data-i18n="filter_live">En juego</button>');
  html = html.replace(/<button class="chip" onclick="filterTodosChip\(this,'today'\)">Hoy<\/button>/g, '<button class="chip" onclick="filterTodosChip(this,\'today\')" data-i18n="filter_today">Hoy</button>');

  // Some elements could just be string matched safely
  if (!html.includes('data-i18n="filter_all"')) {
    html = html.replace(/>Todos<\/button>/g, ' data-i18n="filter_all">Todos</button>');
    html = html.replace(/>Finalizados<\/button>/g, ' data-i18n="filter_finished">Finalizados</button>');
    html = html.replace(/>Pendientes<\/button>/g, ' data-i18n="filter_upcoming">Pendientes</button>');
    html = html.replace(/>Mis equipos<\/button>/g, ' data-i18n="filter_mine">Mis equipos</button>');
  }

  fs.writeFileSync(f, html);
});

// 3. Update app.js (placeholders updateLanguageUI and internal stN array)
const jsFiles = ['app.js', 'draft2026/js/app.js'];
jsFiles.forEach(f => {
  if (!fs.existsSync(f)) return;
  let code = fs.readFileSync(f, 'utf8');

  // Add data-i18n-placeholder to updateLanguageUI
  if (!code.includes('data-i18n-placeholder')) {
    code = code.replace(/document\.querySelectorAll\('\\[data-i18n\\]'\)\.forEach\(el => \{[\s\S]*?\}\);/,
      `document.querySelectorAll('[data-i18n]').forEach(el => {
    el.innerHTML = window.tr(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = window.tr(el.getAttribute('data-i18n-placeholder'));
  });`);
  }

  // Inside renderHome(), stN variable map
  code = code.replace(/const stN=\{'FINAL':'⭐ Final','THIRD_PLACE':'🥉 3er','SEMI_FINALS':'Semis','QUARTER_FINALS':'Cuartos','LAST_16':'Octavos','LAST_32':'16avos','GROUP_STAGE':'Grupos'\};/g, 
    `const stN={'FINAL':'⭐ '+window.tr('stage_final'),'THIRD_PLACE':'🥉 '+window.tr('stage_third'),'SEMI_FINALS':window.tr('stage_semi'),'QUARTER_FINALS':window.tr('stage_r8'),'LAST_16':window.tr('stage_r16'),'LAST_32':window.tr('stage_r32'),'GROUP_STAGE':window.tr('stage_groups')};`);

  fs.writeFileSync(f, code);
});

console.log('UI and static texts updated successfully.');
