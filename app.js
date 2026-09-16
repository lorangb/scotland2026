/* LIST Golf Scotland 2026 — Championship Archive */
let useF = null;

const COURSE_COORDS = {
  1: { lat: 56.3413, lon: -2.8139, name: 'Eden Course, St Andrews' },
  2: { lat: 56.3327, lon: -2.7713, name: 'Castle Course, St Andrews' },
  3: { lat: 56.2129, lon: -2.9619, name: 'Lundin Links' },
  4: { lat: 56.2608, lon: -2.6117, name: 'Crail Balcomie' },
  5: { lat: 56.0100, lon: -3.1825, name: 'Aberdour Golf Club' },
  6: { lat: 56.2257, lon: -2.8772, name: 'Dumbarnie Links' },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CACHE_BUST = Date.now();

function detectTempUnit() {
  const saved = localStorage.getItem('list_golf_temp_unit');
  if (saved === 'F') { useF = true; return true; }
  if (saved === 'C') { useF = false; return false; }
  const lang = navigator.language || navigator.languages?.[0] || 'en-US';
  const imperialRegions = ['en-US', 'en-CA', 'en-PW', 'en-FM', 'en-MH', 'en-BS', 'en-KY'];
  if (typeof useF === 'boolean') return useF;
  useF = imperialRegions.some(r => lang.startsWith(r)) || lang === 'en-US';
  return useF;
}

function cToF(c) { return Math.round(c * 9 / 5 + 32); }
function formatTemp(c, useFahrenheit) {
  return useFahrenheit ? cToF(c) : Math.round(c);
}
function tempUnit(useFahrenheit) { return useFahrenheit ? '°F' : '°C'; }
function getTodayDay() { return DAY_NAMES[new Date().getDay()]; }

async function loadData() {
  try {
    const resp = await fetch('data.json?_=' + CACHE_BUST);
    return await resp.json();
  } catch (e) {
    console.error('Failed to load data:', e);
    return null;
  }
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function markLoaded() {
  document.body.classList.remove('is-loading');
  document.body.classList.add('loaded');
  document.querySelectorAll('.skeleton-only').forEach(el => el.remove());
  // Clear any leftover skeleton rows inside live containers
  document.querySelectorAll('.skeleton-row').forEach(el => el.remove());
}

async function loadWeather() {
  const w = document.getElementById('weatherWidget');
  if (!w) return;
  const usingF = detectTempUnit();

  // Archive view: always show St Andrews climate, not "today's course"
  const coords = { lat: 56.3398, lon: -2.7967, name: 'St Andrews, Fife' };

  try {
    const resp = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code&wind_speed_unit=mph&timezone=Europe/London`
    );
    const data = await resp.json();

    const conditions = {
      0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
      71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Thunderstorm'
    };
    const icons = {
      0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
      45: 'fa-smog', 48: 'fa-smog',
      51: 'fa-cloud-rain', 53: 'fa-cloud-rain', 55: 'fa-cloud-showers-heavy',
      61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy',
      71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake',
      80: 'fa-cloud-sun-rain', 81: 'fa-cloud-sun-rain', 82: 'fa-cloud-showers-heavy',
      95: 'fa-cloud-bolt', 96: 'fa-cloud-bolt', 99: 'fa-cloud-bolt'
    };

    const wcode = data.current.weather_code;
    const condition = conditions[wcode] || 'Unknown';
    const icon = icons[wcode] || 'fa-cloud';
    const tempC = data.current.temperature_2m;
    const feelsC = data.current.apparent_temperature;
    const humidity = data.current.relative_humidity_2m;
    const wind = Math.round(data.current.wind_speed_10m);
    const gusts = Math.round(data.current.wind_gusts_10m);

    const fc = data.daily;
    let forecastHtml = '';
    if (fc && fc.time) {
      forecastHtml = fc.time.slice(0, 4).map((t, i) => {
        const dt = new Date(t + 'T12:00:00');
        const day = dt.toLocaleDateString('en-GB', { weekday: 'short' });
        const fIcon = icons[fc.weather_code[i]] || 'fa-cloud';
        const maxC = fc.temperature_2m_max[i];
        return `<span style="text-align:center;min-width:64px;">
          <div style="font-size:0.65rem;color:var(--text-muted);">${day}</div>
          <i class="fas ${fIcon}" style="color:var(--sky);font-size:0.85rem;margin:0.15rem 0;"></i>
          <div style="font-size:0.72rem;font-weight:600;" class="fc-temp" data-c="${maxC}">${formatTemp(maxC, usingF)}${tempUnit(usingF)}</div>
        </span>`;
      }).join('');
    }

    const toggleOther = usingF ? '°C' : '°F';
    w.innerHTML = `
      <div class="weather-label">St Andrews climate</div>
      <div class="weather-icon-temp">
        <i class="fas ${icon}" aria-hidden="true"></i>
        <span class="temp" id="currentTemp" data-c="${tempC}">${formatTemp(tempC, usingF)}</span><span class="unit">${tempUnit(usingF)}</span>
        <button type="button" class="temp-toggle" onclick="toggleTempUnit()" title="Switch to ${toggleOther}">${toggleOther}</button>
      </div>
      <div class="weather-details">
        <div class="condition">${condition} · ${coords.name}</div>
        <div class="extra">
          <i class="fas fa-temperature-low" aria-hidden="true"></i> Feels like <span id="feelsTemp" data-c="${feelsC}">${formatTemp(feelsC, usingF)}</span>${tempUnit(usingF)}
          <i class="fas fa-droplet" style="margin-left:0.7rem;" aria-hidden="true"></i> ${humidity}%
          <i class="fas fa-wind" style="margin-left:0.7rem;" aria-hidden="true"></i> ${wind} mph (gusts ${gusts})
        </div>
        <div style="display:flex;gap:0.45rem;margin-top:0.45rem;flex-wrap:wrap;">${forecastHtml}</div>
      </div>
      <div class="weather-updated"><i class="fas fa-clock" aria-hidden="true"></i> ${new Date(data.current.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
    `;
  } catch (e) {
    w.innerHTML = `<div style="color:var(--text-muted);font-size:0.85rem;"><i class="fas fa-cloud" style="margin-right:0.5rem;color:var(--gold);"></i> St Andrews climate unavailable — assume links conditions (wind and character).</div>`;
  }
}

function toggleTempUnit() {
  useF = !useF;
  localStorage.setItem('list_golf_temp_unit', useF ? 'F' : 'C');
  const ct = document.getElementById('currentTemp');
  if (ct) {
    ct.textContent = formatTemp(parseFloat(ct.dataset.c), useF);
    ct.nextElementSibling.textContent = tempUnit(useF);
  }
  const ft = document.getElementById('feelsTemp');
  if (ft) ft.textContent = formatTemp(parseFloat(ft.dataset.c), useF);
  document.querySelectorAll('.fc-temp').forEach(el => {
    el.textContent = formatTemp(parseFloat(el.dataset.c), useF) + tempUnit(useF);
  });
  const btn = document.querySelector('.temp-toggle');
  if (btn) {
    const next = useF ? '°C' : '°F';
    btn.textContent = next;
    btn.title = 'Switch to ' + next;
  }
}

function buildLeaderboard(d) {
  const sorted = [...d.leaderboard].sort((a, b) => b.total - a.total);
  const tbody = document.getElementById('leaderboardBody');
  const cards = document.getElementById('leaderboardCards');

  tbody.innerHTML = sorted.map((entry, i) => {
    const player = d.players.find(pl => pl.id === entry.playerId);
    if (!player) return '';
    const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
    const rowClass = i === 0 ? 'podium podium-1' : i < 3 ? 'podium' : '';
    const medal = i === 0
      ? '<i class="fas fa-crown" style="color:var(--gold);" aria-label="Champion"></i>'
      : (i + 1);
    const avatar = player.avatar
      ? `<img src="${player.avatar}" alt="" class="lb-avatar" width="36" height="36">`
      : `<span class="initials">${getInitials(player.name)}</span>`;
    const hcp = player.handicap != null
      ? `<span class="handicap-badge">${player.handicap}</span>`
      : '';
    return `<tr class="${rowClass}">
      <td class="rank ${rankClass}">${medal}</td>
      <td class="player-name">${avatar}${player.name}${hcp}</td>
      <td style="text-align:center;color:var(--text-muted);">${player.handicap != null ? player.handicap : '—'}</td>
      <td style="text-align:center;" class="skins-num">${entry.skins}</td>
      <td style="text-align:center;" class="bonus-num">+${entry.bonus}</td>
      <td style="text-align:center;" class="total-num">${entry.total}</td>
      <td class="note-cell">${entry.note || ''}</td>
    </tr>`;
  }).join('');

  if (cards) {
    cards.innerHTML = sorted.map((entry, i) => {
      const player = d.players.find(pl => pl.id === entry.playerId);
      if (!player) return '';
      const rankClass = i === 0 ? 'rank-gold' : i === 1 ? 'rank-silver' : i === 2 ? 'rank-bronze' : '';
      const podium = i === 0 ? 'podium-1' : '';
      const rankLabel = i === 0
        ? '<i class="fas fa-crown" aria-label="1st"></i>'
        : (i + 1);
      const avatar = player.avatar
        ? `<img src="${player.avatar}" alt="" width="44" height="44">`
        : `<span class="initials">${getInitials(player.name)}</span>`;
      const note = entry.note ? `<div class="lb-note">${entry.note}</div>` : '';
      return `<article class="lb-card ${podium}" aria-label="${player.name}, ${entry.total} points">
        <div class="lb-rank ${rankClass}">${rankLabel}</div>
        <div class="lb-player">
          ${avatar}
          <div>
            <div class="lb-player-name">${player.name}</div>
            <div class="lb-player-meta">HCP ${player.handicap != null ? player.handicap : '—'} · Skins ${entry.skins} · Bonus +${entry.bonus}</div>
          </div>
        </div>
        <div class="lb-total">
          <div class="pts">${entry.total}</div>
          <div class="split">pts</div>
        </div>
        ${note}
      </article>`;
    }).join('');
  }
}

function buildSchedule(d) {
  const tl = document.getElementById('timeline');
  tl.innerHTML = d.schedule.map(s => {
    return `<div class="timeline-item complete">
      <div class="tl-date">${s.day}</div>
      <h3>${s.event}</h3>
      <p>${s.detail}</p>
    </div>`;
  }).join('');
}

function buildPairings(d) {
  const tabs = document.getElementById('pairingTabs');
  const panels = document.getElementById('pairingPanels');
  // Archive: default to final round (last pairing)
  const defaultIdx = Math.max(0, d.pairings.length - 1);

  tabs.innerHTML = d.pairings.map((p, i) =>
    `<button type="button" class="tab-btn ${i === defaultIdx ? 'active' : ''}" onclick="showPairing(${i})" aria-pressed="${i === defaultIdx}">${p.day}</button>`
  ).join('');

  panels.innerHTML = d.pairings.map((p, i) => {
    const formatNote = p.format
      ? `<span style="font-size:0.8rem;color:var(--gold);margin-left:0.5rem;">${p.format}</span>`
      : '';
    const groupsHtml = p.groups.map(g =>
      `<div class="pairing-group">
        <div class="g-label">Group ${g.group}</div>
        <div class="g-players">${g.players.join(' · ')}</div>
      </div>`
    ).join('');

    return `<div class="tab-panel ${i === defaultIdx ? 'active' : ''}" id="pairingPanel${i}" role="tabpanel">
      <h4 style="color:var(--text);margin-bottom:0.65rem;font-weight:600;">${p.course}${formatNote}</h4>
      <div class="pairing-list">${groupsHtml}</div>
    </div>`;
  }).join('');
}

function showPairing(idx) {
  document.querySelectorAll('#pairingTabs .tab-btn').forEach((b, i) => {
    b.classList.toggle('active', i === idx);
    b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
  });
  document.querySelectorAll('#pairingPanels .tab-panel').forEach((p, i) => {
    p.classList.toggle('active', i === idx);
  });
}

function buildPlayers(d) {
  const g = document.getElementById('playerGrid');
  const championId = d.leaderboard.slice().sort((a, b) => b.total - a.total)[0]?.playerId;

  g.innerHTML = d.players.map(p => {
    const hcp = p.handicap != null ? `<div class="stat"><strong>Handicap</strong> ${p.handicap}</div>` : '';
    const ghin = p.ghin ? `<div class="stat"><strong>GHIN</strong> ${p.ghin}</div>` : '';
    const avatarHtml = p.avatar
      ? `<img class="avatar-circle" src="${p.avatar}" alt="${p.name}">`
      : `<div class="initials-large">${getInitials(p.name)}</div>`;
    const champClass = p.id === championId ? ' champion-player' : '';
    const photo = p.avatar
      ? `<img class="photo-bg" src="${p.avatar}" alt="${p.name}"><div class="photo-overlay"></div>`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,var(--purple),#3D2A6E);display:flex;align-items:center;justify-content:center;"><div class="card-icon"><i class="fas fa-user" aria-hidden="true"></i></div></div>`;

    return `<div class="card player-card${champClass}">
      <div class="card-image">
        ${photo}
        ${avatarHtml}
      </div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <div class="subtitle"><i class="fas fa-location-dot" aria-hidden="true"></i> ${p.hometown}</div>
        <div class="player-stats">
          ${hcp}${ghin}
          <div class="stat"><strong>Airbnb</strong> ${p.airbnb}</div>
        </div>
        <p>${p.bio}</p>
      </div>
    </div>`;
  }).join('');

  document.getElementById('alternatesBody').innerHTML = d.alternates.map(a =>
    `<tr><td>${a.name}</td><td>${a.hometown}</td></tr>`
  ).join('');
}

function buildCourses(d) {
  const g = document.getElementById('courseGrid');
  g.innerHTML = d.courses.map((c, idx) => {
    const label = `<span class="card-label label-round">Rd ${idx + 1}</span>`;
    const bgImg = c.image
      ? `background:linear-gradient(rgba(13,13,26,0.35),rgba(13,13,26,0.45)),url('${c.image}') center/cover no-repeat;`
      : 'background:linear-gradient(135deg,var(--purple),var(--green));';

    return `<div class="card">
      <div class="card-image" style="${bgImg}">
        ${label}
      </div>
      <div class="card-body">
        <h3>${c.name}</h3>
        <div class="subtitle">${c.day} ${c.date} · Par ${c.par} · ${c.yards} yds</div>
        <p>${c.description}</p>
        <div class="card-meta">
          <span><i class="fas fa-clock" aria-hidden="true"></i> ${c.driveTime} drive</span>
          <span><i class="fas fa-location-dot" aria-hidden="true"></i> ${c.distance}</span>
          <span><i class="fas fa-golf-flag-hole" aria-hidden="true"></i> Tee ${c.teetimes}</span>
        </div>
      </div>
      <div class="card-footer">
        <a href="${c.url}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link" aria-hidden="true"></i> Course Website</a>
      </div>
    </div>`;
  }).join('');
}

function buildScoring(d) {
  document.getElementById('skinsBody').innerHTML = d.skinsBreakdown.map(s => {
    const p = d.players.find(pl => pl.id === s.playerId);
    if (!p) return '';
    const total = s.rounds.filter(r => r !== null).reduce((a, b) => a + b, 0);
    return `<tr>
      <td>${p.name}</td>
      ${s.rounds.map(r => `<td style="text-align:center;">${r !== null ? r : '—'}</td>`).join('')}
      <td style="text-align:center;font-weight:700;color:var(--gold);">${total}</td>
    </tr>`;
  }).join('');

  document.getElementById('bonusBody').innerHTML = d.bonusBreakdown.map(b => {
    const p = d.players.find(pl => pl.id === b.playerId);
    if (!p) return '';
    const total = b.rounds.filter(r => r !== null).reduce((a, b2) => a + b2, 0);
    return `<tr>
      <td>${p.name}</td>
      ${b.rounds.map(r => `<td style="text-align:center;">${r !== null ? r : '—'}</td>`).join('')}
      <td style="text-align:center;font-weight:700;color:var(--gold);">${total}</td>
    </tr>`;
  }).join('');
}

function buildRules(d) {
  document.getElementById('formatGrid').innerHTML = d.formatRules.map(f =>
    `<div class="rule-card">
      <div class="rule-icon"><i class="fas fa-people-group" aria-hidden="true"></i></div>
      <h4>${f.format}</h4>
      <p>${f.description}</p>
    </div>`
  ).join('');

  document.getElementById('skinsRulesGrid').innerHTML = d.scoringRules.map(r =>
    `<div class="rule-card">
      <div class="rule-icon"><i class="fas fa-coins" aria-hidden="true"></i></div>
      <p>${r.rule}</p>
    </div>`
  ).join('');

  document.getElementById('bonusRulesGrid').innerHTML = d.bonusRules.map(b =>
    `<div class="rule-card">
      <div class="rule-icon"><i class="fas fa-star" aria-hidden="true"></i></div>
      <h4>${b.name} ${b.perNine ? '(×2)' : ''}</h4>
      <p>${b.description} — <strong style="color:var(--gold);">${b.points} pt${b.points > 1 ? 's' : ''}</strong></p>
    </div>`
  ).join('');
}

function buildPubs(d) {
  document.getElementById('pubsGrid').innerHTML = d.pubs.map(p => {
    let icon = 'fa-beer-mug-empty';
    if (p.name.includes('Gelat')) icon = 'fa-ice-cream';
    else if (p.name.includes('T-Squared')) icon = 'fa-dice';
    else if (p.name.includes('Vic')) icon = 'fa-moon';
    else if (p.name.includes('Criterion')) icon = 'fa-bullseye';
    else if (p.name.includes('Molly')) icon = 'fa-microphone';
    return `<div class="pub-card">
      <div class="pub-icon"><i class="fas ${icon}" aria-hidden="true"></i></div>
      <div>
        <h4>${p.name}</h4>
        <div class="pub-vibe"><i class="fas fa-quote-left" style="font-size:0.6rem;" aria-hidden="true"></i> ${p.vibe}</div>
        <div class="pub-specialty"><i class="fas fa-star" aria-hidden="true"></i> ${p.specialty}</div>
      </div>
    </div>`;
  }).join('');
}

function buildLogistics(d) {
  const ts = document.getElementById('trophyDesc');
  if (ts && d.trophies) ts.textContent = d.trophies.description;

  document.getElementById('airbnbGrid').innerHTML = d.airbnbs.map(a =>
    `<div class="card">
      <div class="card-image" style="height:100px;background:linear-gradient(135deg,var(--green),var(--navy));">
        <div class="card-icon"><i class="fas fa-house-chimney" aria-hidden="true"></i></div>
      </div>
      <div class="card-body">
        <h3>${a.name}</h3>
        <div class="subtitle"><i class="fas fa-location-dot" aria-hidden="true"></i> ${a.address}</div>
        <div class="player-stats">
          <div class="stat"><strong>${a.bedrooms}</strong> BR</div>
          <div class="stat"><strong>${a.bathrooms}</strong> BA</div>
        </div>
        <p style="font-size:0.85rem;"><strong style="color:var(--gold);">Occupants:</strong> ${a.occupants.join(', ')}</p>
      </div>
    </div>`
  ).join('');

  document.getElementById('bringBody').innerHTML = d.whatToBring.map((item, i) =>
    `<tr><td>${i + 1}</td><td>${item}</td></tr>`
  ).join('');
}

function buildOldCourse(d) {
  const el = document.getElementById('oldCourseDetail');
  if (!el || !d.oldCourseSolo) return;
  const names = d.oldCourseSolo.players.map(p => {
    const pl = d.players.find(x => x.id === p.playerId);
    const label = pl ? pl.name.split(' ')[0] : p.playerId;
    const course = p.course ? ` @ ${p.course}` : '';
    return `${label} (${p.date.replace(/ \(.*\)/, '')}${course})`;
  });
  // Keep the known narrative line; enhance with data if useful
  el.textContent = 'Adriaan (Mon), Ronny & Graham (Wed), Chad (Thu) — each earned +10 pts. Adriaan also soloed Kingsbarn (+10).';
}

function initNav() {
  const sections = document.querySelectorAll('.section[id]');
  const links = document.querySelectorAll('nav a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`nav a[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  sections.forEach(s => observer.observe(s));
}

(async function main() {
  document.body.classList.add('is-loading');
  initNav();
  const d = await loadData();
  if (!d) {
    document.body.innerHTML = '<div style="text-align:center;padding:4rem;color:var(--text-muted);"><i class="fas fa-exclamation-triangle" style="font-size:2rem;color:var(--gold);margin-bottom:1rem;"></i><p>Failed to load championship data.</p></div>';
    return;
  }

  buildLeaderboard(d);
  buildSchedule(d);
  buildPairings(d);
  buildPlayers(d);
  buildCourses(d);
  buildScoring(d);
  buildRules(d);
  buildPubs(d);
  buildLogistics(d);
  buildOldCourse(d);
  markLoaded();
  loadWeather();
})();
