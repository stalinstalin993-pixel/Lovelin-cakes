/*
 * Baker's desk — minimal Supabase admin (REST only, no SDK).
 * Read-only storefront stays public through RLS; writes require a signed-in user.
 */
(() => {
  "use strict";

  const SITE = window.SITE || {};
  const CFG = SITE.supabase || {};
  const configured = Boolean(CFG.url && CFG.anonKey);
  const BASE = String(CFG.url || "").replace(/\/$/, "");
  const TABLE = CFG.table || "cakes";
  const BUCKET = CFG.bucket || "cake-photos";
  const SESSION_KEY = "pp_admin_session";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    configWarning: $("#configWarning"),
    authView: $("#authView"),
    adminView: $("#adminView"),
    signOutBtn: $("#signOutBtn"),
    loginForm: $("#loginForm"),
    loginEmail: $("#loginEmail"),
    loginPassword: $("#loginPassword"),
    loginError: $("#loginError"),
    loginBtn: $("#loginBtn"),
    adminEmail: $("#adminEmail"),
    totalCakes: $("#totalCakes"),
    trendingCount: $("#trendingCount"),
    newCount: $("#newCount"),
    refreshBtn: $("#refreshBtn"),
    importBtn: $("#importBtn"),
    addCakeBtn: $("#addCakeBtn"),
    adminSearch: $("#adminSearch"),
    adminStatus: $("#adminStatus"),
    cakeList: $("#cakeList"),
    emptyAdmin: $("#emptyAdmin"),
    cakeModal: $("#cakeModal"),
    cakeForm: $("#cakeForm"),
    cakeModalTitle: $("#cakeModalTitle"),
    cakeId: $("#cakeId"),
    cakeCode: $("#cakeCode"),
    cakeName: $("#cakeName"),
    cakeCategory: $("#cakeCategory"),
    cakePrice: $("#cakePrice"),
    cakeMinWeight: $("#cakeMinWeight"),
    cakeImage: $("#cakeImage"),
    cakeUpload: $("#cakeUpload"),
    cakeImagePreview: $("#cakeImagePreview"),
    cakeFlavour: $("#cakeFlavour"),
    cakeNoEggless: $("#cakeNoEggless"),
    cakeTags: $("#cakeTags"),
    cakeSortOrder: $("#cakeSortOrder"),
    cakeFormError: $("#cakeFormError"),
    saveCakeBtn: $("#saveCakeBtn"),
  };

  const state = {
    session: null,
    cakes: [],
    search: "",
    statusTimer: null,
    uploading: false,
  };

  /* ------------------------------------------------------------------------
     Helpers
  ------------------------------------------------------------------------ */
  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      switch (char) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case '"': return "&quot;";
        default: return "&#39;";
      }
    });
  }

  function money(value) {
    return `${SITE.currency || "₹"}${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      Math.round(Number(value) || 0)
    )}`;
  }

  function status(message, type = "ok") {
    if (!els.adminStatus) return;
    els.adminStatus.textContent = message;
    els.adminStatus.hidden = false;
    els.adminStatus.className =
      "rounded-xl px-3 py-2 text-sm " +
      (type === "error" ? "bg-berry/10 text-berry" : type === "warn" ? "bg-butter text-ink" : "bg-pistachio/40 text-ink");
    clearTimeout(state.statusTimer);
    state.statusTimer = setTimeout(() => {
      els.adminStatus.hidden = true;
    }, 4500);
  }

  function tagsOf(row) {
    return Array.isArray(row?.tags) ? row.tags : [];
  }

  function normaliseRow(row) {
    return {
      ...row,
      price: Number(row.price) || 0,
      min_weight: Number(row.min_weight ?? row.minWeight) || 1,
      sort_order: Number(row.sort_order ?? row.order) || 0,
      tags: tagsOf(row),
      flavour_choice: row.flavour_choice !== false,
      no_eggless: Boolean(row.no_eggless),
    };
  }

  /* ------------------------------------------------------------------------
     Supabase session
  ------------------------------------------------------------------------ */
  function readSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSession(session) {
    state.session = session;
    if (!session) {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (error) {
        /* ignore */
      }
      return;
    }
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      /* session lasts for this tab only */
    }
  }

  function saveTokenResponse(data) {
    const session = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (Number(data.expires_in) || 3600) * 1000,
      email: data.user?.email || state.session?.email || "",
    };
    writeSession(session);
    return session;
  }

  async function refreshSession() {
    if (!state.session?.refresh_token) return false;
    try {
      const res = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: CFG.anonKey, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: state.session.refresh_token }),
      });
      if (!res.ok) return false;
      saveTokenResponse(await res.json());
      return true;
    } catch (error) {
      return false;
    }
  }

  async function ensureSession() {
    if (!state.session) return false;
    if (state.session.expires_at && state.session.expires_at > Date.now() + 60000) return true;
    return refreshSession();
  }

  async function apiFetch(path, options = {}, retry = true) {
    await ensureSession();
    const headers = {
      apikey: CFG.anonKey,
      Authorization: `Bearer ${state.session?.access_token || CFG.anonKey}`,
      ...(options.headers || {}),
    };
    const response = await fetch(`${BASE}${path}`, { ...options, headers });
    if (response.status === 401 && retry) {
      const refreshed = await refreshSession();
      if (refreshed) return apiFetch(path, options, false);
      signOut();
      throw new Error("Your session expired. Please sign in again.");
    }
    return response;
  }

  async function readError(response) {
    try {
      const data = await response.json();
      return data.message || data.error_description || data.error || `Request failed (${response.status})`;
    } catch (error) {
      return `Request failed (${response.status})`;
    }
  }

  /* ------------------------------------------------------------------------
     Auth UI
  ------------------------------------------------------------------------ */
  function signOut() {
    writeSession(null);
    els.adminView.hidden = true;
    els.authView.hidden = false;
    els.signOutBtn.hidden = true;
    els.loginForm.reset();
    els.loginEmail.focus();
  }

  function enterAdmin(session) {
    state.session = session;
    els.adminEmail.textContent = session.email || "signed-in user";
    els.authView.hidden = true;
    els.adminView.hidden = false;
    els.signOutBtn.hidden = false;
    loadCakes();
  }

  function setupAuth() {
    els.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      els.loginError.hidden = true;
      const email = els.loginEmail.value.trim();
      const password = els.loginPassword.value;
      if (!email || !password) {
        els.loginError.textContent = "Enter your email and password.";
        els.loginError.hidden = false;
        return;
      }

      els.loginBtn.disabled = true;
      els.loginBtn.textContent = "Signing in…";
      try {
        const response = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { apikey: CFG.anonKey, "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json();
        const session = saveTokenResponse({ ...data, user: { email } });
        enterAdmin(session);
      } catch (error) {
        els.loginError.textContent = error.message || "Could not sign in.";
        els.loginError.hidden = false;
      } finally {
        els.loginBtn.disabled = false;
        els.loginBtn.textContent = "Sign in";
      }
    });

    els.signOutBtn.addEventListener("click", signOut);
  }

  /* ------------------------------------------------------------------------
     Data
  ------------------------------------------------------------------------ */
  async function loadCakes() {
    els.cakeList.setAttribute("aria-busy", "true");
    try {
      const response = await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}?select=*&order=sort_order.asc`);
      if (!response.ok) throw new Error(await readError(response));
      const rows = await response.json();
      state.cakes = (Array.isArray(rows) ? rows : []).map(normaliseRow);
      renderCakes();
    } catch (error) {
      status(error.message || "Could not load cakes.", "error");
    } finally {
      els.cakeList.setAttribute("aria-busy", "false");
    }
  }

  function renderCakes() {
    const query = state.search.trim().toLowerCase();
    const visible = state.cakes.filter(
      (cake) => !query || cake.name.toLowerCase().includes(query) || String(cake.code).toLowerCase().includes(query)
    );

    els.totalCakes.textContent = String(state.cakes.length);
    els.trendingCount.textContent = String(state.cakes.filter((cake) => cake.tags.includes("trending")).length);
    els.newCount.textContent = String(state.cakes.filter((cake) => cake.tags.includes("new")).length);
    els.importBtn.hidden = state.cakes.length > 0;
    els.emptyAdmin.hidden = visible.length > 0;

    els.cakeList.innerHTML = visible
      .map(
        (cake) => `
        <article class="rounded-[1.25rem] border border-ink/12 bg-white p-3">
          <div class="flex gap-3">
            <img class="h-[6.2rem] w-20 flex-none rounded-xl border border-ink/10 bg-sage-deep object-cover"
              src="${esc(cake.image || "images/fallback-cake.webp")}" alt="${esc(cake.name)}" width="160" height="200" loading="lazy" />
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-label text-[0.58rem] uppercase tracking-[0.12em] text-ink-soft">${esc(cake.code)} · ${esc(
                    cake.category
                  )}</p>
                  <h2 class="mt-0.5 truncate font-display text-lg leading-tight">${esc(cake.name)}</h2>
                </div>
                <p class="font-label text-sm font-semibold text-berry">${money(cake.price)}</p>
              </div>
              <p class="mt-1 text-[0.7rem] text-ink-soft">Min ${esc(cake.min_weight)} kg · order ${esc(
                cake.sort_order
              )} · ${cake.flavour_choice ? "flavours" : "no flavour picker"}${cake.no_eggless ? " · contains egg" : ""}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                ${
                  cake.tags.length
                    ? cake.tags.map((tag) => `<span class="rounded-full bg-sage-deep px-2 py-0.5 font-label text-[0.56rem] uppercase tracking-[0.06em]">${esc(tag)}</span>`).join("")
                    : `<span class="font-label text-[0.56rem] uppercase tracking-[0.06em] text-ink-soft">no tags</span>`
                }
              </div>
            </div>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5 border-t border-ink/10 pt-3">
            <button class="btn btn-outline btn-sm" type="button" data-action="edit" data-id="${esc(cake.id)}">Edit</button>
            <button class="btn btn-butter btn-sm" type="button" data-action="trending" data-id="${esc(cake.id)}">${
              cake.tags.includes("trending") ? "Untrend" : "Trending"
            }</button>
            <button class="btn btn-butter btn-sm" type="button" data-action="new" data-id="${esc(cake.id)}">${
              cake.tags.includes("new") ? "Not new" : "New"
            }</button>
            <button class="btn btn-outline btn-sm px-2.5" type="button" data-action="up" data-id="${esc(
              cake.id
            )}" aria-label="Move ${esc(cake.name)} earlier">↑</button>
            <button class="btn btn-outline btn-sm px-2.5" type="button" data-action="down" data-id="${esc(
              cake.id
            )}" aria-label="Move ${esc(cake.name)} later">↓</button>
            <button class="btn btn-outline btn-sm ml-auto border-berry/40 text-berry hover:bg-berry hover:text-white" type="button" data-action="delete" data-id="${esc(
              cake.id
            )}">Delete</button>
          </div>
        </article>`
      )
      .join("");

    els.cakeList.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.dataset.fallback) return;
        img.dataset.fallback = "1";
        img.src = "images/fallback-cake.webp";
      });
    });
  }

  /* ------------------------------------------------------------------------
     Editor
  ------------------------------------------------------------------------ */
  function previewImage(src) {
    els.cakeImagePreview.src = src || "images/fallback-cake.webp";
  }

  function openEditor(cake = null) {
    els.cakeForm.reset();
    els.cakeFormError.hidden = true;
    els.cakeId.value = cake?.id || "";
    els.cakeModalTitle.textContent = cake ? "Edit cake" : "Add a cake";
    els.cakeCode.value = cake?.code || "";
    els.cakeName.value = cake?.name || "";
    els.cakeCategory.value = cake?.category || "signature";
    els.cakePrice.value = cake?.price ?? "";
    els.cakeMinWeight.value = cake?.min_weight ?? 1;
    els.cakeImage.value = cake?.image || "";
    els.cakeFlavour.checked = cake ? cake.flavour_choice !== false : true;
    els.cakeNoEggless.checked = Boolean(cake?.no_eggless);
    els.cakeTags.value = cake?.tags?.join(", ") || "";
    els.cakeSortOrder.value =
      cake?.sort_order ?? (state.cakes.length ? Math.max(...state.cakes.map((row) => row.sort_order)) + 1 : 1);
    els.cakeUpload.value = "";
    previewImage(cake?.image);
    openOverlay(els.cakeModal);
    setTimeout(() => els.cakeCode.focus({ preventScroll: true }), 80);
  }

  function compressTags(value) {
    return value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .filter((tag, index, list) => list.indexOf(tag) === index);
  }

  async function uploadPhoto(file, code) {
    const ext = (file.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${code.toLowerCase()}-${Date.now()}.${ext || "webp"}`;
    const response = await fetch(`${BASE}/storage/v1/object/${encodeURIComponent(BUCKET)}/${path}`, {
      method: "POST",
      headers: {
        apikey: CFG.anonKey,
        Authorization: `Bearer ${state.session?.access_token || CFG.anonKey}`,
        "Content-Type": file.type || "application/octet-stream",
        "x-upsert": "true",
      },
      body: file,
    });
    if (!response.ok) throw new Error(await readError(response));
    return `${BASE}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${path}`;
  }

  async function saveCake(event) {
    event.preventDefault();
    els.cakeFormError.hidden = true;

    const code = els.cakeCode.value.trim().toUpperCase();
    const name = els.cakeName.value.trim();
    const category = els.cakeCategory.value;
    const price = Number(els.cakePrice.value);
    const minWeight = Number(els.cakeMinWeight.value);
    const sortOrder = Number(els.cakeSortOrder.value) || 1;
    const file = els.cakeUpload.files?.[0];
    let image = els.cakeImage.value.trim();

    const fail = (message) => {
      els.cakeFormError.textContent = message;
      els.cakeFormError.hidden = false;
    };

    if (!/^[A-Z0-9-]{2,12}$/.test(code)) return fail("Code must be 2–12 characters: letters, numbers or dashes.");
    if (name.length < 2) return fail("Add a cake name.");
    if (!category) return fail("Choose a category.");
    if (!Number.isFinite(price) || price <= 0) return fail("Price must be greater than zero.");
    if (!Number.isFinite(minWeight) || minWeight < 0.5) return fail("Minimum weight must be at least 0.5 kg.");
    if (file && file.size > 5 * 1024 * 1024) return fail("Photo must be under 5 MB.");
    if (file && !file.type.startsWith("image/")) return fail("Please choose an image file.");

    const id = els.cakeId.value;
    els.saveCakeBtn.disabled = true;
    els.saveCakeBtn.textContent = file ? "Uploading…" : "Saving…";

    try {
      if (file) image = await uploadPhoto(file, code);
      const payload = {
        code,
        name,
        category,
        price,
        min_weight: minWeight,
        image: image || "images/fallback-cake.webp",
        flavour_choice: els.cakeFlavour.checked,
        no_eggless: els.cakeNoEggless.checked,
        tags: compressTags(els.cakeTags.value),
        sort_order: sortOrder,
      };

      const response = id
        ? await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}?id=eq.${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify(payload),
          })
        : await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) throw new Error(await readError(response));
      closeOverlay(els.cakeModal);
      status(id ? "Cake updated." : "Cake added to the menu.");
      await loadCakes();
    } catch (error) {
      fail(error.message || "Could not save the cake. Check your connection and permissions.");
    } finally {
      els.saveCakeBtn.disabled = false;
      els.saveCakeBtn.textContent = "Save cake";
    }
  }

  /* ------------------------------------------------------------------------
     Row actions
  ------------------------------------------------------------------------ */
  async function patchCake(id, payload) {
    const response = await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await readError(response));
  }

  async function toggleTag(id, tag) {
    const cake = state.cakes.find((row) => row.id === id);
    if (!cake) return;
    const tags = cake.tags.includes(tag) ? cake.tags.filter((item) => item !== tag) : [...cake.tags, tag];
    try {
      await patchCake(id, { tags });
      cake.tags = tags;
      renderCakes();
      status(tags.includes(tag) ? `Marked as ${tag}.` : `Removed ${tag}.`);
    } catch (error) {
      status(error.message, "error");
    }
  }

  async function moveCake(id, direction) {
    const sorted = state.cakes.slice().sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((cake) => cake.id === id);
    const neighbour = sorted[index + direction];
    if (index < 0 || !neighbour) return;
    try {
      await patchCake(id, { sort_order: neighbour.sort_order });
      await patchCake(neighbour.id, { sort_order: sorted[index].sort_order });
      await loadCakes();
      status("Order updated.");
    } catch (error) {
      status(error.message, "error");
    }
  }

  async function deleteCake(id) {
    const cake = state.cakes.find((row) => row.id === id);
    if (!cake) return;
    if (!window.confirm(`Delete “${cake.name}”? This cannot be undone.`)) return;
    try {
      const response = await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { Prefer: "return=minimal" },
      });
      if (!response.ok) throw new Error(await readError(response));
      state.cakes = state.cakes.filter((row) => row.id !== id);
      renderCakes();
      status("Cake deleted.");
    } catch (error) {
      status(error.message, "error");
    }
  }

  async function importStarter() {
    if (!window.confirm("Import the 88 starter cakes into Supabase? Existing codes will be updated.")) return;
    els.importBtn.disabled = true;
    els.importBtn.textContent = "Importing…";
    try {
      const response = await fetch("cakes.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("Could not read cakes.json.");
      const rows = await response.json();
      const payload = rows.map((cake) => ({
        code: cake.code,
        name: cake.name,
        category: cake.category,
        price: cake.price,
        min_weight: cake.minWeight,
        image: cake.image,
        flavour_choice: cake.flavourChoice,
        no_eggless: cake.noEggless,
        tags: cake.tags,
        sort_order: cake.order,
      }));

      const res = await apiFetch(`/rest/v1/${encodeURIComponent(TABLE)}?on_conflict=code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await readError(res));
      status(`Imported ${payload.length} cakes.`);
      await loadCakes();
    } catch (error) {
      status(error.message || "Import failed.", "error");
    } finally {
      els.importBtn.disabled = false;
      els.importBtn.textContent = "Import starter menu";
    }
  }

  /* ------------------------------------------------------------------------
     Overlay helpers
  ------------------------------------------------------------------------ */
  const FOCUSABLE =
    "a[href],button:not([disabled]),input:not([disabled]):not([type='hidden']),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  const focusReturn = new WeakMap();

  function openOverlay(overlay) {
    focusReturn.set(overlay, document.activeElement);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      if (!overlay.classList.contains("is-open")) return;
      const target = overlay.querySelector(FOCUSABLE);
      target?.focus({ preventScroll: true });
    }, 60);
  }

  function closeOverlay(overlay) {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    const previous = focusReturn.get(overlay);
    if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    document.body.style.overflow = "";
  }

  function trapFocus(overlay) {
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOverlay(overlay);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(overlay.querySelectorAll(FOCUSABLE)).filter((el) => el.getClientRects().length);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!overlay.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     Init
  ------------------------------------------------------------------------ */
  function setupEvents() {
    els.addCakeBtn.addEventListener("click", () => openEditor(null));
    els.refreshBtn.addEventListener("click", () => loadCakes());
    els.importBtn.addEventListener("click", importStarter);
    els.cakeForm.addEventListener("submit", saveCake);
    els.cakeImage.addEventListener("input", () => previewImage(els.cakeImage.value.trim()));
    els.cakeUpload.addEventListener("change", () => {
      const file = els.cakeUpload.files?.[0];
      if (file) previewImage(URL.createObjectURL(file));
    });
    els.adminSearch.addEventListener("input", () => {
      state.search = els.adminSearch.value;
      renderCakes();
    });

    $$("[data-close-editor]").forEach((button) => {
      button.addEventListener("click", () => closeOverlay(els.cakeModal));
    });
    trapFocus(els.cakeModal);

    els.cakeList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const id = button.dataset.id;
      switch (button.dataset.action) {
        case "edit": {
          const cake = state.cakes.find((row) => row.id === id);
          if (cake) openEditor(cake);
          break;
        }
        case "trending":
          toggleTag(id, "trending");
          break;
        case "new":
          toggleTag(id, "new");
          break;
        case "up":
          moveCake(id, -1);
          break;
        case "down":
          moveCake(id, 1);
          break;
        case "delete":
          deleteCake(id);
          break;
        default:
          break;
      }
    });
  }

  function init() {
    if (!configured) {
      els.configWarning.hidden = false;
      els.authView.hidden = true;
      els.adminView.hidden = true;
      els.signOutBtn.hidden = true;
      return;
    }

    setupAuth();
    setupEvents();

    const existing = readSession();
    if (existing?.access_token) {
      state.session = existing;
      enterAdmin(existing);
    } else {
      els.authView.hidden = false;
      els.loginEmail.focus();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
