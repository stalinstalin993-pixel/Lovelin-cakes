/*
 * Festive skins — decides which seasonal layer to show.
 * Configure in site.config.js under `festive`, or force one for testing:
 *   ?festive=christmas   |   ?festive=off
 */
(() => {
  "use strict";

  const config = (window.SITE && window.SITE.festive) || {};
  if (!config.enabled) return;

  const themes = ["christmas", "deepavali", "new-year", "valentines", "pongal"];
  const params = new URLSearchParams(window.location.search);
  const forced = (params.get("festive") || "").toLowerCase();

  if (forced === "off" || forced === "none") return;

  const today = new Date();
  const key = (today.getMonth() + 1) * 100 + today.getDate();

  // Ranges are approximate and intentionally short so the site feels seasonal,
  // not permanently decorated. Deepavali shifts yearly; adjust if needed.
  const calendar = [
    { theme: "new-year", from: 1228, to: 102 },
    { theme: "pongal", from: 113, to: 118 },
    { theme: "valentines", from: 207, to: 215 },
    { theme: "deepavali", from: 1025, to: 1112 },
    { theme: "christmas", from: 1201, to: 1227 },
  ];

  function fromCalendar() {
    for (const entry of calendar) {
      const wraps = entry.from > entry.to;
      if (wraps ? key >= entry.from || key <= entry.to : key >= entry.from && key <= entry.to) {
        return entry.theme;
      }
    }
    return null;
  }

  let theme = null;
  if (themes.includes(forced)) {
    theme = forced;
  } else if (config.mode === "off") {
    theme = null;
  } else if (config.mode === "fixed" && themes.includes(config.theme)) {
    theme = config.theme;
  } else {
    theme = fromCalendar();
  }

  if (!theme) return;

  const root = document.documentElement;
  root.classList.add(`theme-${theme}`);
  root.dataset.festive = theme;

  // Load the seasonal stylesheet only when a theme is actually active.
  if (!document.querySelector('link[href="festive.css"]')) {
    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "festive.css";
    document.head.appendChild(styles);
  }

  // One empty decorative layer; all artwork is CSS so there is nothing heavy to load.
  const layer = document.createElement("div");
  layer.id = "festiveLayer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const offer =
    (config.announcementByTheme && config.announcementByTheme[theme]) ||
    (config.offers && config.offers[theme]) ||
    "";

  if (offer) {
    const text = document.getElementById("announcementText");
    const bar = document.getElementById("announcementBar");
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("pp_announcement_dismissed") === "1";
    } catch (error) {
      dismissed = false;
    }
    if (text) text.textContent = offer;
    if (bar && !dismissed) bar.hidden = false;
  }
})();
