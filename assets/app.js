// Простой hash-роутер: #/  #/launcher/slug  #/compare  #/about
const app = document.getElementById("app");
const navLinks = document.querySelectorAll(".nav a");

let filters = { query: "", category: "all", platform: "all", focus: "all" };

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function platformTags(platforms) {
  return platforms.map((p) => `<span class="tag">${PLATFORM_LABELS[p]}</span>`).join("");
}

function render() {
  const hash = location.hash || "#/";
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash.split("/")[1] ? false : false));

  if (hash.startsWith("#/launcher/")) {
    const slug = hash.replace("#/launcher/", "");
    renderDetail(slug);
  } else if (hash.startsWith("#/compare")) {
    renderCompare();
    setActiveNav("#/compare");
  } else if (hash.startsWith("#/about")) {
    renderAbout();
    setActiveNav("#/about");
  } else {
    renderHome();
    setActiveNav("#/");
  }
  window.scrollTo(0, 0);
}

function setActiveNav(hash) {
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === hash));
}

function filteredLaunchers() {
  return LAUNCHERS.filter((l) => {
    if (filters.category !== "all" && l.category !== filters.category) return false;
    if (filters.platform !== "all" && !l.platforms.includes(filters.platform)) return false;
    if (filters.focus !== "all" && l.focus !== filters.focus) return false;
    if (filters.query.trim() && !l.name.toLowerCase().includes(filters.query.trim().toLowerCase())) return false;
    return true;
  });
}

function renderHome() {
  const licensedCount = LAUNCHERS.filter((l) => l.category === "licensed").length;
  const pirateCount = LAUNCHERS.filter((l) => l.category === "pirate").length;

  app.innerHTML = `
    <section class="hero">
      <div class="wrap hero-grid">
        <div>
          <h1>Какой лаунчер<br>тебе на самом деле нужен?</h1>
          <p class="lead">${LAUNCHERS.length} лаунчеров Minecraft в одном месте: ${licensedCount} лицензионных и ${pirateCount} нелицензионных. Платформы, моды, PvP-фичи и риски — без маркетингового шума.</p>
          <div class="hero-actions">
            <a href="#catalog" class="slot-frame btn">Смотреть каталог</a>
            <a href="#/compare" class="btn btn-ghost">Сравнить в таблице →</a>
          </div>
        </div>
        <div class="hero-portal">
          <img class="hero-portal-image" src="assets/portal.png"
            alt="Зелёный портал Minecraft — символ Launcher Hub"
            width="1254" height="1254" fetchpriority="high" draggable="false" />
        </div>
      </div>
    </section>

    <section class="wrap" id="catalog" style="padding-top: 40px; padding-bottom: 40px;">
      <div class="slot-frame search-bar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5" />
          <line x1="10.2" y1="10.2" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <input id="search-input" type="text" placeholder="Найти лаунчер по названию…" value="${esc(filters.query)}" />
      </div>

      <div class="filter-row" data-group="category">
        <button class="chip" data-value="all">Все</button>
        <button class="chip" data-value="licensed">Лицензионные</button>
        <button class="chip" data-value="pirate">Пиратские</button>
      </div>
      <div class="filter-row" data-group="focus">
        <button class="chip" data-value="all">Любая цель</button>
        ${Object.keys(FOCUS_LABELS)
          .map((f) => `<button class="chip" data-value="${f}">${FOCUS_LABELS[f]}</button>`)
          .join("")}
      </div>
      <div class="filter-row" data-group="platform">
        <button class="chip" data-value="all">Любая ОС</button>
        ${Object.keys(PLATFORM_LABELS)
          .map((p) => `<button class="chip" data-value="${p}">${PLATFORM_LABELS[p]}</button>`)
          .join("")}
      </div>

      <div id="results"></div>
    </section>
  `;

  document.getElementById("search-input").addEventListener("input", (e) => {
    filters.query = e.target.value;
    renderResults();
  });

  document.querySelectorAll(".filter-row").forEach((row) => {
    const group = row.dataset.group;
    row.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filters[group] = btn.dataset.value;
      renderResults();
    });
  });

  renderResults();
}

function renderResults() {
  // sync chip active states
  document.querySelectorAll(".filter-row").forEach((row) => {
    const group = row.dataset.group;
    row.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.value === filters[group]);
    });
  });

  const list = filteredLaunchers();
  const results = document.getElementById("results");
  results.innerHTML = `
    <p class="result-count">Найдено: ${list.length} из ${LAUNCHERS.length}</p>
    ${
      list.length === 0
        ? `<div class="slot-frame empty-state">Ничего не нашлось. Попробуйте изменить фильтры.</div>`
        : `<div class="catalog-grid">
            ${list
              .map(
                (l) => `
              <a href="#/launcher/${l.slug}" class="slot-frame card">
                <div class="card-top">
                  <h3>${esc(l.name)}</h3>
                  <span class="badge ${l.category}">${CATEGORY_LABELS[l.category]}</span>
                </div>
                <p class="card-tagline">${esc(l.tagline)}</p>
                <div class="tag-row">
                  ${platformTags(l.platforms)}
                  ${l.openSource ? `<span class="tag gold">Open Source</span>` : ""}
                </div>
              </a>`
              )
              .join("")}
          </div>`
    }
  `;
}

function renderDetail(slug) {
  const l = LAUNCHERS.find((x) => x.slug === slug);
  if (!l) {
    app.innerHTML = `<div class="detail"><p>Лаунчер не найден.</p><a href="#/" class="back-link">← Назад в каталог</a></div>`;
    return;
  }
  const isPirate = l.category === "pirate";
  document.title = `${l.name} · Launcher Hub`;

  app.innerHTML = `
    <article class="detail">
      <a href="#/" class="back-link">← Назад в каталог</a>
      <div class="detail-top">
        <h1>${esc(l.name)}</h1>
        <span class="badge ${l.category}">${CATEGORY_LABELS[l.category]}</span>
      </div>
      <p class="detail-tagline">${esc(l.tagline)}</p>

      ${
        isPirate
          ? `<div class="slot-frame risk-note">
              <strong>Важно:</strong> нелицензионные лаунчеры запускают игру в обход авторизации Mojang/Microsoft, что нарушает условия использования игры. Такие приложения часто закрытые — проверить, что именно они делают на компьютере, обычно нельзя. Взвесьте риски перед установкой.
            </div>`
          : ""
      }

      <div class="detail-tags">
        ${platformTags(l.platforms)}
        <span class="tag">${FOCUS_LABELS[l.focus]}</span>
        ${l.openSource ? `<span class="tag gold">Open Source</span>` : ""}
        ${l.modLoaders.map((m) => `<span class="tag" style="color: var(--lapis)">${esc(m)}</span>`).join("")}
      </div>

      <p class="detail-body">${esc(l.description)}</p>

      <div class="pros-cons">
        <div class="slot-frame">
          <h2 style="color: var(--emerald)">Плюсы</h2>
          <ul>${l.pros.map((p) => `<li><span class="plus">+</span>${esc(p)}</li>`).join("")}</ul>
        </div>
        <div class="slot-frame">
          <h2 style="color: var(--redstone)">Минусы</h2>
          <ul>${l.cons.map((c) => `<li><span class="minus">−</span>${esc(c)}</li>`).join("")}</ul>
        </div>
      </div>

      ${
        l.website
          ? `<a href="${esc(l.website)}" target="_blank" rel="noopener noreferrer" class="slot-frame btn" style="display:inline-block">Официальный сайт →</a>`
          : ""
      }
    </article>
  `;
}

function renderCompare() {
  document.title = "Сравнение лаунчеров · Launcher Hub";
  const sorted = [...LAUNCHERS].sort((a, b) => {
    if (a.category !== b.category) return a.category === "licensed" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  app.innerHTML = `
    <section class="wrap" style="padding: 48px 24px;">
      <h1 style="font-weight:700; font-size:36px; margin:0 0 8px;">Сравнение лаунчеров</h1>
      <p style="color:var(--quartz-dim); margin:0 0 32px;">Все ${LAUNCHERS.length} лаунчеров в одной таблице.</p>
      <div class="slot-frame compare-wrap">
        <table class="compare">
          <thead>
            <tr>
              <th>Название</th><th>Тип</th><th>Платформы</th><th>Цель</th><th>Open Source</th><th>Загрузчики модов</th>
            </tr>
          </thead>
          <tbody>
            ${sorted
              .map(
                (l) => `
              <tr>
                <td><a href="#/launcher/${l.slug}">${esc(l.name)}</a></td>
                <td><span class="cell-type badge ${l.category}">${CATEGORY_LABELS[l.category]}</span></td>
                <td>${l.platforms.map((p) => PLATFORM_LABELS[p]).join(", ")}</td>
                <td>${FOCUS_LABELS[l.focus]}</td>
                <td>${l.openSource ? '<span style="color:var(--gold)">да</span>' : "нет"}</td>
                <td>${l.modLoaders.length ? l.modLoaders.join(", ") : "—"}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAbout() {
  document.title = "О проекте · Launcher Hub";
  app.innerHTML = `
    <section class="about-body">
      <h1>О проекте</h1>
      <p>Launcher Hub — справочник, который собирает лаунчеры Minecraft в одном месте, чтобы было проще выбрать подходящий: по платформе, поддержке модов или назначению (ваниль, моддинг, PvP).</p>
      <p>Сайт независимый и не связан с Mojang Studios, Microsoft или разработчиками перечисленных программ. Все названия и товарные знаки принадлежат их владельцам.</p>
      <p>Нелицензионные лаунчеры показаны в справочных целях с явной пометкой и предупреждением о рисках — это не рекомендация их использовать.</p>
    </section>
  `;
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
