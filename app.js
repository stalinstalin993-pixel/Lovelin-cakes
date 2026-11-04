/*
 * LC Homemade — storefront logic (vanilla JS).
 * No build step for this file. The block between FALLBACK markers is generated
 * from cakes.json by `npm run sync-fallback` so the site still works offline.
 */
(() => {
  "use strict";

  const SITE = window.SITE || {};
  const CURRENCY = SITE.currency || "₹";
  const WA_NUMBER = String(SITE.whatsapp || "").replace(/\D/g, "");
  const STORAGE_KEY = "pp_cart_v1";
  const ANNOUNCEMENT_KEY = "pp_announcement_dismissed";
  const PAGE_SIZE = 24;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const CATEGORIES = [
    { id: "all", label: "All cakes", emoji: "🍰" },
    { id: "signature", label: "Signature", emoji: "✨" },
    { id: "trending", label: "Trending", emoji: "🔥" },
    { id: "chocolate", label: "Chocolate", emoji: "🍫" },
    { id: "fruit", label: "Fruit", emoji: "🍓" },
    { id: "premium", label: "Premium", emoji: "👑" },
    { id: "cheesecakes", label: "Cheesecakes", emoji: "🍰" },
    { id: "special-occasion", label: "Special Occasion", emoji: "🎉" },
    { id: "birthday-boy", label: "Birthday Boy", emoji: "🎈" },
    { id: "birthday-girl", label: "Birthday Girl", emoji: "🦄" },
    { id: "wedding-anniversary", label: "Wedding & Anniversary", emoji: "💍" },
    { id: "brownies-cupcakes", label: "Brownies & Cupcakes", emoji: "🧁" },
  ];

  // >>> FALLBACK_CATALOG
  // Compact offline copy: code, name, category, price, minWeight,
  // flavourChoice (1/0), noEggless (1/0), tags, order.
  const FALLBACK_ROWS = [
    ["SG01","Pistachio Rose Cloud","signature",1450,1,1,0,["bestseller","premium"],1],
    ["SG02","Vanilla Bean Classic","signature",950,1,1,0,["bestseller"],2],
    ["SG03","Belgian Chocolate Gâteau","signature",1350,1,1,0,["bestseller"],3],
    ["SG04","Lemon & Thyme Loaf","signature",750,0.5,1,0,[],4],
    ["SG05","Strawberry Cream Bliss","signature",1150,1,1,0,[],5],
    ["SG06","Salted Caramel Crunch","signature",1250,1,1,0,["trending"],6],
    ["SG07","Mango Cloud Mousse","signature",1200,1,1,0,["seasonal"],7],
    ["SG08","Blackcurrant Velvet","signature",1250,1,1,0,[],8],
    ["TR01","Unicorn Cloud Cake","trending",1400,1,1,0,["trending","kids"],9],
    ["TR02","Vintage Piped Cake","trending",1600,1,1,0,["trending","premium"],10],
    ["TR03","Heart Bento Cake","trending",650,0.5,1,0,["trending","new"],11],
    ["TR04","Teddy Cloud Cake","trending",1350,1,1,0,["trending","kids"],12],
    ["TR05","Chrome Number Cake","trending",1800,1,1,0,["trending","premium"],13],
    ["TR06","Pressed Flower Cake","trending",1700,1,1,0,["trending","premium"],14],
    ["TR07","Broken Heart Cake","trending",1250,1,1,0,["trending","new"],15],
    ["TR08","Happy Pill Bento","trending",600,0.5,1,0,["trending","new"],16],
    ["CH01","Triple Choco Fudge","chocolate",1300,1,1,0,["bestseller"],17],
    ["CH02","Belgian Truffle","chocolate",1450,1,1,0,["bestseller"],18],
    ["CH03","Ferrero Crunch","chocolate",1550,1,1,0,[],19],
    ["CH04","Nutella Hazelnut","chocolate",1500,1,1,0,["kids"],20],
    ["CH05","Dark 70% Ganache","chocolate",1600,1,1,0,["premium"],21],
    ["CH06","Choco Lava","chocolate",1350,1,1,0,[],22],
    ["CH07","Oreo Overload","chocolate",1400,1,1,0,["kids"],23],
    ["CH08","Mocha Walnut","chocolate",1450,1,1,0,[],24],
    ["FR01","Fresh Mango Gateau","fruit",1150,1,1,0,["seasonal","bestseller"],25],
    ["FR02","Strawberry Cream","fruit",1150,1,1,0,[],26],
    ["FR03","Pineapple Sunshine","fruit",950,1,1,0,[],27],
    ["FR04","Black Forest","fruit",1050,1,1,0,["bestseller"],28],
    ["FR05","White Forest","fruit",1100,1,1,0,[],29],
    ["FR06","Mixed Fruit Basket","fruit",1200,1,1,0,[],30],
    ["FR07","Peach & Cream","fruit",1250,1,1,0,["seasonal"],31],
    ["FR08","Lychee Rose","fruit",1350,1,1,0,["new"],32],
    ["PR01","Saffron Kesar Pista","premium",1900,1,1,0,["premium","bestseller"],33],
    ["PR02","Rasamalai Royale","premium",1950,1,1,0,["premium","new"],34],
    ["PR03","Honey Almond Praline","premium",1800,1,1,0,["premium"],35],
    ["PR04","Blueberry Mascarpone","premium",1750,1,1,0,["premium"],36],
    ["PR05","Hazelnut Opera","premium",1900,1,1,1,["premium"],37],
    ["PR06","Tiramisu Classico","premium",1850,1,1,1,["premium"],38],
    ["PR07","Chocolate Praline Trio","premium",1950,1,1,0,["premium"],39],
    ["PR08","Pistachio & Berry","premium",2000,1,1,0,["premium","bestseller"],40],
    ["CS01","Classic New York","cheesecakes",1500,1,0,0,["bestseller"],41],
    ["CS02","Biscoff Cheesecake","cheesecakes",1650,1,0,0,["trending"],42],
    ["CS03","Mango Cheesecake","cheesecakes",1550,1,0,0,["seasonal"],43],
    ["CS04","Blueberry Cheesecake","cheesecakes",1600,1,0,0,[],44],
    ["CS05","Strawberry Cheesecake","cheesecakes",1600,1,0,0,[],45],
    ["CS06","Dark Chocolate Cheesecake","cheesecakes",1750,1,0,0,["premium"],46],
    ["CS07","Pistachio Cheesecake","cheesecakes",1800,1,0,0,["premium","new"],47],
    ["CS08","Basque Burnt Cheesecake","cheesecakes",1700,1,0,1,[],48],
    ["SO01","Engagement Blush","special-occasion",3200,1.5,1,0,["premium"],49],
    ["SO02","Anniversary Gold","special-occasion",2600,1.5,1,0,["premium"],50],
    ["SO03","Baby Shower Cloud","special-occasion",2200,1,1,0,["new"],51],
    ["SO04","Farewell Fiesta","special-occasion",1800,1,1,0,[],52],
    ["SO05","Congratulations Cake","special-occasion",1900,1,1,0,[],53],
    ["SO06","Housewarming Bloom","special-occasion",2000,1,1,0,[],54],
    ["SO07","Retirement Days","special-occasion",2100,1,1,0,[],55],
    ["SO08","Festival Special","special-occasion",1850,1,1,0,["seasonal"],56],
    ["BB01","Dino Adventure","birthday-boy",1450,1,1,0,["kids","bestseller"],57],
    ["BB02","Space Explorer","birthday-boy",1500,1,1,0,["kids"],58],
    ["BB03","Football Fever","birthday-boy",1400,1,1,0,["kids"],59],
    ["BB04","Racing Car","birthday-boy",1450,1,1,0,["kids"],60],
    ["BB05","Superhero Cape","birthday-boy",1500,1,1,0,["kids"],61],
    ["BB06","Jungle Safari","birthday-boy",1550,1,1,0,["kids","new"],62],
    ["BB07","Video Game","birthday-boy",1600,1,1,0,["kids","trending"],63],
    ["BB08","Robot Buddy","birthday-boy",1450,1,1,0,["kids"],64],
    ["BD01","Unicorn Dream Cake","birthday-girl",1450,1,1,0,["kids","bestseller"],65],
    ["BD02","Butterfly Meadow","birthday-girl",1450,1,1,0,["kids"],66],
    ["BD03","Mermaid Tail","birthday-girl",1550,1,1,0,["kids","trending"],67],
    ["BD04","Ballet Shoes","birthday-girl",1450,1,1,0,["kids"],68],
    ["BD05","Princess Crown","birthday-girl",1500,1,1,0,["kids"],69],
    ["BD06","Flower Garden","birthday-girl",1400,1,1,0,["kids"],70],
    ["BD07","Rainbow Cloud","birthday-girl",1450,1,1,0,["kids","new"],71],
    ["BD08","Teddy Picnic","birthday-girl",1400,1,1,0,["kids"],72],
    ["WA01","Two-Tier Ivory","wedding-anniversary",3800,2,1,0,["premium","bestseller"],73],
    ["WA02","Minimal Heart","wedding-anniversary",2800,1.5,1,0,["premium","new"],74],
    ["WA03","Gold Leaf Romance","wedding-anniversary",3500,2,1,0,["premium"],75],
    ["WA04","Floral Arch","wedding-anniversary",3600,2,1,0,["premium","trending"],76],
    ["WA05","Red Velvet Duo","wedding-anniversary",3200,1.5,1,0,["premium"],77],
    ["WA06","Pearl Cascade","wedding-anniversary",3700,2,1,0,["premium"],78],
    ["WA07","Vintage Lace","wedding-anniversary",3400,1.5,1,0,["premium"],79],
    ["WA08","Ever After","wedding-anniversary",3900,2,1,0,["premium","bestseller"],80],
    ["BC01","Fudge Brownie Box","brownies-cupcakes",550,0.5,0,0,["bestseller"],81],
    ["BC02","Walnut Brownie Box","brownies-cupcakes",600,0.5,0,0,[],82],
    ["BC03","Blondie Box","brownies-cupcakes",650,0.5,0,0,["new"],83],
    ["BC04","Cupcake Box of Six","brownies-cupcakes",700,0.5,0,0,["kids"],84],
    ["BC05","Red Velvet Cupcakes","brownies-cupcakes",750,0.5,0,0,[],85],
    ["BC06","Vanilla Confetti Cupcakes","brownies-cupcakes",700,0.5,0,0,["kids"],86],
    ["BC07","Chocolate Truffle Cupcakes","brownies-cupcakes",750,0.5,0,0,[],87],
    ["BC08","Brownie & Cupcake Combo","brownies-cupcakes",900,1,0,0,["bestseller"],88],
  ];
  const FALLBACK_CATALOG = FALLBACK_ROWS.map(
    ([code, name, category, price, minWeight, flavourChoice, noEggless, tags, order]) => ({
      code,
      name,
      category,
      price,
      minWeight,
      image: `images/cakes/${code}.webp`,
      flavourChoice: Boolean(flavourChoice),
      noEggless: Boolean(noEggless),
      tags,
      order,
    })
  );
  // <<< FALLBACK_CATALOG

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const els = {
    header: $("#siteHeader"),
    announcementBar: $("#announcementBar"),
    announcementText: $("#announcementText"),
    announcementLink: $("#announcementLink"),
    announcementClose: $("#announcementClose"),
    menuToggle: $("#menuToggle"),
    mobileMenu: $("#mobileMenu"),
    searchToggle: $("#searchToggle"),
    cartToggle: $("#cartToggle"),
    cartCount: $("#cartCount"),
    cakeSearch: $("#cakeSearch"),
    sortSelect: $("#sortSelect"),
    categoryChips: $("#categoryChips"),
    cakeGrid: $("#cakeGrid"),
    resultCount: $("#resultCount"),
    emptyState: $("#emptyState"),
    clearFilters: $("#clearFilters"),
    loadMore: $("#loadMore"),
    reviewGrid: $("#reviewGrid"),
    year: $("#year"),
    customizeModal: $("#customizeModal"),
    customizeForm: $("#customizeForm"),
    customizeImage: $("#customizeImage"),
    customizeCode: $("#customizeCode"),
    customizeName: $("#customizeName"),
    customizeBase: $("#customizeBase"),
    customizeTitle: $("#customizeTitle"),
    weightSelect: $("#weightSelect"),
    weightNote: $("#weightNote"),
    flavourSection: $("#flavourSection"),
    flavourOptions: $("#flavourOptions"),
    egglessToggle: $("#egglessToggle"),
    egglessNote: $("#egglessNote"),
    cakeMessage: $("#cakeMessage"),
    messageCount: $("#messageCount"),
    specialInstructions: $("#specialInstructions"),
    customizePrice: $("#customizePrice"),
    priceBreakdown: $("#priceBreakdown"),
    cartDrawer: $("#cartDrawer"),
    cartItems: $("#cartItems"),
    cartEmpty: $("#cartEmpty"),
    cartSubtotal: $("#cartSubtotal"),
    checkoutForm: $("#checkoutForm"),
    checkoutBtn: $("#checkoutBtn"),
    checkoutError: $("#checkoutError"),
    customerName: $("#customerName"),
    customerAddress: $("#customerAddress"),
    addressWrap: $("#addressWrap"),
    orderDate: $("#orderDate"),
    orderTime: $("#orderTime"),
    orderNotes: $("#orderNotes"),
    lightbox: $("#lightbox"),
    lightboxImage: $("#lightboxImage"),
    lightboxCode: $("#lightboxCode"),
    lightboxCodeOverlay: $("#lightboxCodeOverlay"),
    lightboxCaption: $("#lightboxCaption"),
    lightboxCustomize: $("#lightboxCustomize"),
    toast: $("#toast"),
    toastText: $("#toastText"),
  };

  const state = {
    catalog: [],
    activeCategory: "all",
    search: "",
    sort: "popular",
    visibleCount: PAGE_SIZE,
    activeCake: null,
    lightboxCake: null,
    selection: { weight: 1, flavour: "", eggless: false, premium: false },
    cart: [],
    observer: null,
    toastTimer: null,
  };

  /* ------------------------------------------------------------------------
     Small utilities
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
    const rounded = Math.round(Number(value) || 0);
    return `${CURRENCY}${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(rounded)}`;
  }

  function formatWeight(value) {
    const num = Number(value);
    return `${Number.isInteger(num) ? num : num.toFixed(1)} kg`;
  }

  function isPremium(name) {
    return (SITE.premiumFlavours || []).includes(name);
  }

  function computePrice(cake, weight, flavour, eggless) {
    const minWeight = Number(cake.minWeight) || 1;
    const basePerKg = Number(cake.price) / minWeight;
    const flavourPerKg = isPremium(flavour) ? Number(SITE.premiumSurcharge) || 0 : 0;
    const eggPerKg = eggless ? Number(SITE.egglessSurcharge) || 0 : 0;
    const base = Math.round(basePerKg * weight);
    const flavourCost = Math.round(flavourPerKg * weight);
    const eggCost = Math.round(eggPerKg * weight);
    return { base, flavour: flavourCost, eggless: eggCost, total: base + flavourCost + eggCost, basePerKg };
  }

  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function addDaysISO(iso, days) {
    const d = new Date(`${iso}T12:00:00`);
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function displayDate(iso) {
    if (!iso) return "";
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function hourLabel(hour) {
    const h = hour % 12 || 12;
    return `${h}:00 ${hour < 12 ? "AM" : "PM"}`;
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toastText.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2800);
  }

  function bounceCart() {
    if (!els.cartCount) return;
    els.cartCount.classList.remove("is-bouncing");
    void els.cartCount.offsetWidth;
    els.cartCount.classList.add("is-bouncing");
  }

  function scrollToMenu() {
    const target = $("#menu");
    if (!target) return;
    target.scrollIntoView({ behavior: REDUCED_MOTION ? "auto" : "smooth", block: "start" });
  }

  /* ------------------------------------------------------------------------
     Catalog loading: Supabase -> cakes.json -> embedded fallback
  ------------------------------------------------------------------------ */
  function mapSupabaseRow(row) {
    return {
      code: row.code,
      name: row.name,
      category: row.category,
      price: Number(row.price),
      minWeight: Number(row.min_weight ?? row.minWeight ?? 1),
      image: row.image || "images/fallback-cake.webp",
      flavourChoice: row.flavour_choice ?? row.flavourChoice ?? true,
      noEggless: row.no_eggless ?? row.noEggless ?? false,
      tags: Array.isArray(row.tags) ? row.tags : [],
      order: Number(row.sort_order ?? row.order ?? 0),
    };
  }

  function normalizeCatalog(rows) {
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((cake) => cake && cake.code && cake.name && cake.category)
      .map((cake, index) => ({
        code: String(cake.code).trim(),
        name: String(cake.name).trim(),
        category: String(cake.category).trim(),
        price: Math.max(0, Number(cake.price) || 0),
        minWeight: Math.max(0.5, Number(cake.minWeight ?? cake.min_weight) || 1),
        image: cake.image || "images/fallback-cake.webp",
        flavourChoice: cake.flavourChoice !== false,
        noEggless: Boolean(cake.noEggless),
        tags: Array.isArray(cake.tags) ? cake.tags : [],
        order: Number(cake.order) || index + 1,
      }));
  }

  async function fetchWithTimeout(url, options = {}, timeout = 4000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  async function loadCatalog() {
    const sb = SITE.supabase;
    if (sb && sb.url && sb.anonKey) {
      try {
        const base = String(sb.url).replace(/\/$/, "");
        const table = sb.table || "cakes";
        const res = await fetchWithTimeout(`${base}/rest/v1/${table}?select=*&order=sort_order.asc`, {
          headers: { apikey: sb.anonKey, Authorization: `Bearer ${sb.anonKey}` },
        });
        if (res.ok) {
          const rows = await res.json();
          const mapped = normalizeCatalog(rows.map(mapSupabaseRow));
          if (mapped.length) return mapped;
        }
      } catch (error) {
        console.warn("Supabase catalog unavailable, using local data.", error);
      }
    }

    try {
      const res = await fetchWithTimeout("cakes.json", { cache: "no-cache" });
      if (res.ok) {
        const rows = await res.json();
        const normalized = normalizeCatalog(rows);
        if (normalized.length) return normalized;
      }
    } catch (error) {
      console.warn("cakes.json unavailable, using embedded catalog.", error);
    }

    return normalizeCatalog(FALLBACK_CATALOG);
  }

  /* ------------------------------------------------------------------------
     Rendering the catalog
  ------------------------------------------------------------------------ */
  function categoryCount(id) {
    if (id === "all") return state.catalog.length;
    return state.catalog.filter((cake) => cake.category === id).length;
  }

  function renderChips() {
    if (!els.categoryChips) return;
    els.categoryChips.innerHTML = CATEGORIES.filter((cat) => cat.id === "all" || categoryCount(cat.id) > 0)
      .map(
        (cat) => `
        <button class="chip" type="button" data-category="${esc(cat.id)}" aria-pressed="${
          state.activeCategory === cat.id
        }">
          <span aria-hidden="true">${cat.emoji}</span>
          <span>${esc(cat.label)}</span>
          <span class="chip__count">${categoryCount(cat.id)}</span>
        </button>`
      )
      .join("");
  }

  function primaryTag(cake) {
    if (cake.tags.includes("new")) return "New";
    if (cake.tags.includes("bestseller")) return "Bestseller";
    if (cake.tags.includes("trending")) return "Trending";
    return "";
  }

  function cakeCard(cake, index) {
    const tag = primaryTag(cake);
    const thumb =
      cake.image.startsWith("images/cakes/") && cake.image.endsWith(".webp")
        ? cake.image.replace("images/cakes/", "images/cakes/thumbs/")
        : "";
    const imageSrc = cake.image;
    const srcset = thumb ? `srcset="${esc(thumb)} 400w, ${esc(cake.image)} 800w"` : "";
    return `
      <article class="cake-card reveal" style="--reveal-delay: ${Math.min(index * 35, 210)}ms">
        <button class="cake-card__media" type="button" data-open-cake="${esc(cake.code)}" aria-label="View ${esc(
          cake.name
        )} full size">
          <img src="${esc(imageSrc)}" ${srcset} alt="${esc(cake.name)} — cake ${esc(cake.code)}" width="800" height="1000"
            loading="lazy" decoding="async" sizes="(max-width: 639px) 46vw, (max-width: 899px) 31vw, 23vw" />
          <span class="code-badge">${esc(cake.code)}</span>
          ${tag ? `<span class="tag-badge">${esc(tag)}</span>` : ""}
        </button>
        <div class="card-body">
          <div class="flex items-start justify-between gap-2">
            <h3 class="line-clamp-2 min-h-[2.5rem] font-display text-[1.02rem] leading-[1.15]">${esc(cake.name)}</h3>
          </div>
          <div class="flex items-center justify-between gap-2">
            <p class="price">from ${money(cake.price)}<span class="ml-1 font-sans text-[0.65rem] font-normal text-ink-soft">/ ${formatWeight(
              cake.minWeight
            )}</span></p>
            <span class="veg-dot ${cake.noEggless ? "veg-dot--egg" : ""}">${cake.noEggless ? "Contains egg" : "Eggless option"}</span>
          </div>
          <button class="btn btn-outline btn-sm mt-1 w-full" type="button" data-customize="${esc(cake.code)}">
            Customize &amp; Add
          </button>
        </div>
      </article>`;
  }

  function filteredCakes() {
    const query = state.search.trim().toLowerCase();
    let rows = state.catalog.slice();

    if (state.activeCategory !== "all") {
      rows = rows.filter((cake) => cake.category === state.activeCategory);
    }

    if (query) {
      rows = rows.filter(
        (cake) => cake.name.toLowerCase().includes(query) || cake.code.toLowerCase().includes(query)
      );
    }

    switch (state.sort) {
      case "price-asc":
        rows.sort((a, b) => a.price / a.minWeight - b.price / b.minWeight || a.order - b.order);
        break;
      case "price-desc":
        rows.sort((a, b) => b.price / b.minWeight - a.price / a.minWeight || a.order - b.order);
        break;
      case "new":
        rows.sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")) || a.order - b.order);
        break;
      default:
        rows.sort((a, b) => a.order - b.order);
    }
    return rows;
  }

  function renderCatalog() {
    if (!els.cakeGrid) return;
    const allRows = filteredCakes();
    const rows = allRows.slice(0, state.visibleCount);
    els.cakeGrid.innerHTML = rows.map(cakeCard).join("");
    els.cakeGrid.setAttribute("aria-busy", "false");
    els.cakeGrid.hidden = rows.length === 0;

    if (els.emptyState) els.emptyState.hidden = allRows.length > 0;
    if (els.resultCount) {
      els.resultCount.textContent = `${allRows.length} ${allRows.length === 1 ? "cake" : "cakes"}`;
    }
    if (els.clearFilters) {
      els.clearFilters.hidden = state.activeCategory === "all" && !state.search && state.sort === "popular";
    }
    if (els.loadMore) {
      const remaining = allRows.length - rows.length;
      els.loadMore.hidden = remaining <= 0;
      els.loadMore.textContent = remaining > 0 ? `Show more cakes (${remaining})` : "Show more cakes";
    }

    $$(".chip", els.categoryChips).forEach((chip) => {
      chip.setAttribute("aria-pressed", String(chip.dataset.category === state.activeCategory));
    });

    observeReveals(els.cakeGrid);
  }

  function renderSkeletons() {
    if (!els.cakeGrid) return;
    els.cakeGrid.innerHTML = Array.from({ length: 8 })
      .map(
        () => `
        <div class="cake-card" aria-hidden="true">
          <div class="aspect-[4/5] animate-pulse bg-sage-deep"></div>
          <div class="space-y-2 p-4">
            <div class="h-4 w-3/4 rounded bg-sage-deep animate-pulse"></div>
            <div class="h-4 w-1/2 rounded bg-sage-deep animate-pulse"></div>
            <div class="h-9 w-full rounded-full bg-sage-deep animate-pulse"></div>
          </div>
        </div>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------------
     Reviews
  ------------------------------------------------------------------------ */
  function renderReviews() {
    if (!els.reviewGrid) return;
    const reviews = Array.isArray(SITE.testimonials) ? SITE.testimonials.slice(0, 5) : [];
    const cards = reviews
      .map(
        (review) => `
        <article class="review-card reveal">
          <p class="stars" aria-label="5 out of 5 stars">★★★★★</p>
          <p class="text-[0.95rem] leading-relaxed">“${esc(review.quote)}”</p>
          <footer class="mt-auto flex items-center gap-3">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-pistachio font-display text-sm" aria-hidden="true">${esc(
              (review.name || "?").charAt(0)
            )}</span>
            <div>
              <p class="text-sm font-medium">${esc(review.name)}</p>
              <p class="font-label text-[0.62rem] uppercase tracking-[0.08em] text-ink-soft">${esc(review.detail)}</p>
            </div>
          </footer>
        </article>`
      )
      .join("");

    els.reviewGrid.innerHTML =
      cards +
      `<article class="review-card border-ink/20 bg-ink text-sage reveal">
        <p class="eyebrow text-pistachio">Google reviews</p>
        <p class="font-display text-2xl leading-tight">Read all ${esc(SITE.reviewCount || "our")} notes from the neighbourhood.</p>
        <p class="text-sm text-sage/65">No filters, no edits — just what people said after the candles were blown out.</p>
        <a class="btn btn-butter btn-sm mt-auto self-start" href="${esc(
          SITE.reviewUrl || "#"
        )}" target="_blank" rel="noopener">Open Google reviews</a>
      </article>`;

    $$("[data-review-link]").forEach((link) => {
      link.href = SITE.reviewUrl || "#";
    });
    observeReveals(els.reviewGrid);
  }

  /* ------------------------------------------------------------------------
     Scroll reveal + header behaviour
  ------------------------------------------------------------------------ */
  function observeReveals(root = document) {
    const items = $$(".reveal:not(.is-visible)", root);
    if (!state.observer || REDUCED_MOTION) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    items.forEach((item) => state.observer.observe(item));
  }

  function setupReveal() {
    if (REDUCED_MOTION) {
      $$(".reveal").forEach((el) => el.classList.add("is-visible"));
      return;
    }
    state.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            state.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observeReveals();
  }

  function setupHeader() {
    const onScroll = () => {
      if (!els.header) return;
      els.header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (els.menuToggle && els.mobileMenu) {
      els.menuToggle.addEventListener("click", () => {
        const isOpen = !els.mobileMenu.hidden;
        els.mobileMenu.hidden = isOpen;
        els.menuToggle.setAttribute("aria-expanded", String(!isOpen));
        els.menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      });
      $$("a", els.mobileMenu).forEach((link) => {
        link.addEventListener("click", () => {
          els.mobileMenu.hidden = true;
          els.menuToggle.setAttribute("aria-expanded", "false");
        });
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth >= 768 && !els.mobileMenu.hidden) {
          els.mobileMenu.hidden = true;
          els.menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    if (els.searchToggle) {
      els.searchToggle.addEventListener("click", () => {
        scrollToMenu();
        setTimeout(() => els.cakeSearch?.focus({ preventScroll: true }), REDUCED_MOTION ? 0 : 500);
      });
    }

    // Highlight nav item for the section in view.
    const sections = $$("main section[id]");
    if ("IntersectionObserver" in window && sections.length) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            $$(".nav-link").forEach((link) => {
              if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
              else link.removeAttribute("aria-current");
            });
          });
        },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      sections.forEach((section) => spy.observe(section));
    }
  }

  /* ------------------------------------------------------------------------
     Announcement + config-driven links
  ------------------------------------------------------------------------ */
  function setupAnnouncement() {
    if (!els.announcementBar) return;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(ANNOUNCEMENT_KEY) === "1";
    } catch (error) {
      dismissed = false;
    }
    if (dismissed) {
      els.announcementBar.hidden = true;
      return;
    }

    const announcement = SITE.announcement || {};
    if (announcement.text && els.announcementText) els.announcementText.textContent = announcement.text;
    if (els.announcementLink) {
      els.announcementLink.textContent = announcement.linkLabel || "Browse the menu";
      els.announcementLink.href = announcement.link || "#menu";
    }

    els.announcementClose?.addEventListener("click", () => {
      els.announcementBar.hidden = true;
      try {
        sessionStorage.setItem(ANNOUNCEMENT_KEY, "1");
      } catch (error) {
        /* storage can be unavailable — hiding still works */
      }
    });
  }

  function setupWhatsAppLinks() {
    $$("[data-wa-message]").forEach((link) => {
      const message = link.dataset.waMessage || `Hi ${SITE.name}! I'd like to order a cake.`;
      link.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
      link.target = "_blank";
      link.rel = "noopener";
    });
  }

  /* ------------------------------------------------------------------------
     Overlay helpers (focus trap, Esc, scroll lock)
  ------------------------------------------------------------------------ */
  const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  const focusReturn = new WeakMap();

  function focusable(container) {
    return $$(FOCUSABLE, container).filter((el) => el.getClientRects().length > 0);
  }

  function openOverlay(overlay, focusTarget) {
    if (!overlay) return;
    focusReturn.set(overlay, document.activeElement);
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => {
      if (!overlay.classList.contains("is-open")) return;
      const target = focusTarget || focusable(overlay)[0];
      target?.focus({ preventScroll: true });
    }, 60);
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (overlay === els.cartDrawer) {
      els.cartToggle?.setAttribute("aria-expanded", "false");
    }
    const previous = focusReturn.get(overlay);
    if (previous && document.contains(previous)) {
      previous.focus({ preventScroll: true });
    }
    if (!document.querySelector(".overlay.is-open")) {
      document.body.style.overflow = "";
    }
  }

  function trapFocus(overlay) {
    overlay?.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const items = focusable(overlay);
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

  // Escape is handled at document level so it works even if focus has not
  // landed inside a freshly opened overlay yet.
  function setupEscape() {
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const open = $$(".overlay.is-open").pop();
      if (!open) return;
      event.preventDefault();
      closeOverlay(open);
    });
  }

  /* ------------------------------------------------------------------------
     Customize modal
  ------------------------------------------------------------------------ */
  function weightOptionsFor(cake) {
    const step = Number(SITE.weightStep) || 0.5;
    const max = Number(SITE.maxWeight) || 8;
    const excluded = Array.isArray(SITE.excludedWeights) ? SITE.excludedWeights.map(Number) : [];
    const options = [];
    for (let w = Number(cake.minWeight) || 1; w <= max + 0.001; w += step) {
      const rounded = Math.round(w * 10) / 10;
      if (rounded === cake.minWeight || !excluded.includes(rounded)) options.push(rounded);
    }
    return options;
  }

  function openCustomize(cake, trigger) {
    if (!cake) return;
    state.activeCake = cake;
    state.selection = {
      weight: Number(cake.minWeight) || 1,
      flavour: (SITE.freeFlavours || [])[0] || (SITE.premiumFlavours || [])[0] || "Vanilla",
      eggless: false,
      premium: false,
    };

    els.customizeName.textContent = cake.name;
    els.customizeTitle.textContent = cake.name;
    els.customizeCode.textContent = cake.code;
    els.customizeBase.textContent = `from ${money(cake.price)} / ${formatWeight(cake.minWeight)}`;
    els.customizeImage.src = cake.image;
    els.customizeImage.alt = `${cake.name} — cake ${cake.code}`;

    const weights = weightOptionsFor(cake);
    els.weightSelect.innerHTML = weights
      .map((w) => `<option value="${w}">${formatWeight(w)}</option>`)
      .join("");
    els.weightSelect.value = String(state.selection.weight);
    els.weightNote.textContent = `Choose ${formatWeight(cake.minWeight)}–${formatWeight(
      Number(SITE.maxWeight) || 8
    )} in ${formatWeight(Number(SITE.weightStep) || 0.5)} steps.`;

    if (cake.flavourChoice === false) {
      els.flavourSection.hidden = true;
      state.selection.flavour = "Bakery's choice";
    } else {
      els.flavourSection.hidden = false;
      const free = SITE.freeFlavours || [];
      const premium = SITE.premiumFlavours || [];
      const freeButtons = free
        .map(
          (name) => `<button class="option" type="button" data-flavour="${esc(name)}" aria-pressed="${
            name === state.selection.flavour
          }">
            <span class="option__dot" aria-hidden="true"></span>
            <span>${esc(name)}</span>
          </button>`
        )
        .join("");
      const premiumButtons = premium
        .map(
          (name) => `<button class="option" type="button" data-flavour="${esc(name)}" data-premium="true" aria-pressed="false">
            <span class="option__dot" aria-hidden="true"></span>
            <span class="flex-1">${esc(name)}</span>
            <span class="font-label text-[0.58rem] text-berry">+${money(SITE.premiumSurcharge || 0)}</span>
          </button>`
        )
        .join("");
      els.flavourOptions.innerHTML = freeButtons + premiumButtons;
    }

    els.egglessToggle.disabled = Boolean(cake.noEggless);
    els.egglessToggle.checked = false;
    if (cake.noEggless) {
      els.egglessNote.textContent = "This recipe contains egg — eggless is not available.";
    } else {
      els.egglessNote.textContent = `+${money(SITE.egglessSurcharge || 0)} per kg · available for this cake`;
    }

    els.cakeMessage.value = "";
    els.specialInstructions.value = "";
    els.messageCount.textContent = "0";
    els.checkoutError.textContent = "";

    updateCustomizePrice();
    openOverlay(els.customizeModal);
    window.setTimeout(() => {
      if (els.customizeModal.classList.contains("is-open")) {
        els.weightSelect.focus({ preventScroll: true });
      }
    }, 80);
  }

  function updateCustomizePrice() {
    const cake = state.activeCake;
    if (!cake) return;
    const { weight, flavour, eggless } = state.selection;
    const price = computePrice(cake, weight, flavour, eggless);

    els.customizePrice.textContent = money(price.total);
    const parts = [`${formatWeight(weight)} × ${money(price.basePerKg)} base`];
    if (price.flavour > 0) parts.push(`flavour +${money(price.flavour)}`);
    if (price.eggless > 0) parts.push(`eggless +${money(price.eggless)}`);
    els.priceBreakdown.textContent = parts.join(" · ");

    const egglessBadge = els.egglessToggle.closest(".rounded-xl")?.querySelector(".font-label");
    if (egglessBadge) {
      egglessBadge.textContent = cake.noEggless ? "Not available" : "Optional";
    }
  }

  function setupCustomize() {
    if (!els.customizeModal) return;
    trapFocus(els.customizeModal);

    $$("[data-close-customize]").forEach((btn) => {
      btn.addEventListener("click", () => closeOverlay(els.customizeModal));
    });

    els.weightSelect.addEventListener("change", () => {
      state.selection.weight = Number(els.weightSelect.value);
      updateCustomizePrice();
    });

    els.flavourOptions.addEventListener("click", (event) => {
      const button = event.target.closest("[data-flavour]");
      if (!button) return;
      state.selection.flavour = button.dataset.flavour;
      state.selection.premium = button.dataset.premium === "true";
      $$("[data-flavour]", els.flavourOptions).forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      updateCustomizePrice();
    });

    els.egglessToggle.addEventListener("change", () => {
      state.selection.eggless = els.egglessToggle.checked;
      updateCustomizePrice();
    });

    els.cakeMessage.addEventListener("input", () => {
      els.messageCount.textContent = String(els.cakeMessage.value.length);
    });

    els.customizeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      addSelectionToCart();
    });
  }

  /* ------------------------------------------------------------------------
     Cart
  ------------------------------------------------------------------------ */
  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (item) =>
            item &&
            item.code &&
            item.name &&
            Number(item.weight) > 0 &&
            Number(item.unitPrice) >= 0 &&
            Number(item.qty) > 0
        )
        .map((item) => ({
          ...item,
          weight: Number(item.weight),
          unitPrice: Number(item.unitPrice),
          qty: Math.max(1, Math.floor(Number(item.qty))),
          eggless: Boolean(item.eggless),
        }));
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
    } catch (error) {
      /* private mode or quota — cart still works for this session */
    }
  }

  function reconcileCart() {
    if (!state.cart.length) return;
    state.cart.forEach((item) => {
      const cake = state.catalog.find((row) => row.code === item.code);
      if (!cake) return;
      item.name = cake.name;
      item.image = cake.image;
      item.unitPrice = computePrice(cake, item.weight, item.flavour, item.eggless).total;
    });
    saveCart();
  }

  function cartCountTotal() {
    return state.cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function cartSubtotal() {
    return state.cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }

  function addSelectionToCart() {
    const cake = state.activeCake;
    if (!cake) return;
    const { weight, flavour, eggless } = state.selection;
    const message = els.cakeMessage.value.trim().slice(0, 30);
    const instructions = els.specialInstructions.value.trim();
    const price = computePrice(cake, weight, flavour, eggless).total;
    const id = [cake.code, weight, flavour, eggless ? "eggless" : "regular", message, instructions].join("|");

    const existing = state.cart.find((item) => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        id,
        code: cake.code,
        name: cake.name,
        image: cake.image,
        weight,
        flavour,
        eggless,
        message,
        instructions,
        unitPrice: price,
        qty: 1,
      });
    }

    saveCart();
    renderCart();
    bounceCart();
    closeOverlay(els.customizeModal);
    showToast(`${cake.name} added to your cake bag`);
  }

  function renderCart() {
    if (!els.cartItems) return;
    const count = cartCountTotal();
    const subtotal = cartSubtotal();

    if (els.cartCount) {
      els.cartCount.textContent = count > 99 ? "99+" : String(count);
      els.cartCount.hidden = count === 0;
      els.cartToggle?.setAttribute(
        "aria-label",
        count ? `Open cake bag, ${count} ${count === 1 ? "item" : "items"}` : "Open cake bag"
      );
    }

    els.cartItems.innerHTML = state.cart
      .map(
        (item, index) => `
        <div class="cart-line" data-cart-index="${index}">
          <img src="${esc(item.image)}" alt="${esc(item.name)}" width="170" height="212" loading="lazy" decoding="async" />
          <div class="min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-label text-[0.58rem] tracking-[0.12em] text-ink-soft">${esc(item.code)}</p>
                <p class="truncate text-sm font-medium leading-tight">${esc(item.name)}</p>
              </div>
              <button class="grid h-7 w-7 flex-none place-items-center rounded-full border border-ink/15 text-ink-soft hover:border-berry hover:text-berry"
                type="button" data-cart-action="remove" aria-label="Remove ${esc(item.name)} from cake bag">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" /></svg>
              </button>
            </div>
            <p class="mt-1 text-[0.72rem] leading-relaxed text-ink-soft">
              ${formatWeight(item.weight)} · ${esc(item.flavour)}${item.eggless ? " · Eggless" : ""} · Qty ${item.qty}
            </p>
            ${
              item.message
                ? `<p class="mt-1 text-[0.7rem] text-ink-soft">Message: “${esc(item.message)}”</p>`
                : ""
            }
            ${
              item.instructions
                ? `<p class="mt-1 line-clamp-2 text-[0.7rem] text-ink-soft">Note: ${esc(item.instructions)}</p>`
                : ""
            }
            <div class="mt-2 flex items-center justify-between gap-2">
              <div class="qty" aria-label="Quantity for ${esc(item.name)}">
                <button type="button" data-cart-action="dec" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-cart-action="inc" aria-label="Increase quantity">+</button>
              </div>
              <div class="text-right">
                <p class="price text-sm">${money(item.unitPrice * item.qty)}</p>
                ${item.qty > 1 ? `<p class="font-label text-[0.58rem] text-ink-soft">${money(item.unitPrice)} each</p>` : ""}
              </div>
            </div>
          </div>
        </div>`
      )
      .join("");

    if (els.cartSubtotal) els.cartSubtotal.textContent = money(subtotal);
    if (els.cartEmpty) els.cartEmpty.hidden = state.cart.length > 0;
    els.cartItems.hidden = state.cart.length === 0;
    if (els.checkoutForm) els.checkoutForm.hidden = state.cart.length === 0;
    if (els.checkoutBtn) {
      els.checkoutBtn.disabled = state.cart.length === 0;
      els.checkoutBtn.setAttribute("aria-disabled", String(state.cart.length === 0));
    }
    if (els.checkoutError) {
      els.checkoutError.textContent = "";
      els.checkoutError.hidden = true;
    }

    els.cartItems.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        if (img.dataset.fallback) return;
        img.dataset.fallback = "1";
        img.src = "images/fallback-cake.webp";
      });
    });
  }

  function setupCart() {
    if (!els.cartDrawer) return;
    trapFocus(els.cartDrawer);

    els.cartToggle?.addEventListener("click", () => {
      els.toast?.classList.remove("is-visible");
      openOverlay(els.cartDrawer, $("[data-close-cart]", els.cartDrawer));
      els.cartToggle.setAttribute("aria-expanded", "true");
      if (els.cartItems.innerHTML) {
        const body = $(".drawer-body", els.cartDrawer);
        if (body) body.scrollTop = 0;
      }
    });

    $$("[data-close-cart]").forEach((btn) => {
      btn.addEventListener("click", () => {
        closeOverlay(els.cartDrawer);
        els.cartToggle?.setAttribute("aria-expanded", "false");
      });
    });

    $$("[data-browse]", els.cartDrawer).forEach((btn) => {
      btn.addEventListener("click", () => {
        closeOverlay(els.cartDrawer);
        els.cartToggle?.setAttribute("aria-expanded", "false");
        scrollToMenu();
      });
    });

    els.cartItems.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-cart-action]");
      if (!actionButton) return;
      const line = actionButton.closest("[data-cart-index]");
      if (!line) return;
      const index = Number(line.dataset.cartIndex);
      const item = state.cart[index];
      if (!item) return;

      switch (actionButton.dataset.cartAction) {
        case "inc":
          item.qty += 1;
          break;
        case "dec":
          item.qty -= 1;
          if (item.qty <= 0) state.cart.splice(index, 1);
          break;
        case "remove":
          state.cart.splice(index, 1);
          showToast("Removed from your cake bag");
          break;
        default:
          return;
      }
      saveCart();
      renderCart();
      bounceCart();
    });

    setupCheckout();
  }

  /* ------------------------------------------------------------------------
     Checkout form + WhatsApp message
  ------------------------------------------------------------------------ */
  function setupCheckout() {
    const minDate = todayISO();
    els.orderDate.min = minDate;
    els.orderDate.value = addDaysISO(minDate, 1);

    const start = Number(SITE.deliveryHours?.opens?.split(":")[0]) || 10;
    const end = Number(SITE.deliveryHours?.closes?.split(":")[0]) || 21;
    const slots = [];
    for (let hour = start; hour <= end; hour += 1) slots.push(hour);
    els.orderTime.innerHTML = slots.map((hour) => `<option value="${hourLabel(hour)}">${hourLabel(hour)}</option>`).join("");

    const syncMode = () => {
      const checked = $("input[name='orderMode']:checked", els.checkoutForm);
      const delivery = checked?.value === "delivery";
      els.addressWrap.hidden = !delivery;
      els.customerAddress.required = delivery;
      $$("[data-mode-option]", els.checkoutForm).forEach((label) => {
        const input = $("input", label);
        label.setAttribute("aria-pressed", String(Boolean(input?.checked)));
      });
    };
    $$("input[name='orderMode']", els.checkoutForm).forEach((input) => input.addEventListener("change", syncMode));
    syncMode();

    els.checkoutForm.addEventListener("submit", handleCheckout);
  }

  function showCheckoutError(message, focusEl) {
    els.checkoutError.textContent = message;
    els.checkoutError.hidden = false;
    focusEl?.focus({ preventScroll: false });
  }

  function validateCheckout() {
    if (!state.cart.length) return { error: "Add a cake to your bag first." };

    const name = els.customerName.value.trim();
    if (name.length < 2) return { error: "Please add your name.", focus: els.customerName };

    const mode = $("input[name='orderMode']:checked", els.checkoutForm)?.value || "pickup";
    const address = els.customerAddress.value.trim();
    if (mode === "delivery" && address.length < 8) {
      return { error: "Please add a delivery address (street and landmark).", focus: els.customerAddress };
    }

    const date = els.orderDate.value;
    if (!date) return { error: "Please choose a date.", focus: els.orderDate };
    if (date < todayISO()) return { error: "Please choose today or a future date.", focus: els.orderDate };

    const time = els.orderTime.value;
    if (!time) return { error: "Please choose a time slot.", focus: els.orderTime };

    return { name, mode, address, date, time };
  }

  function buildOrderMessage(details) {
    const lines = [];
    lines.push(`🎂 New Order – ${SITE.name}`);
    lines.push(`Name: ${details.name}`);
    lines.push(`Date: ${displayDate(details.date)} | Time: ${details.time}`);
    lines.push(
      `Mode: ${details.mode === "delivery" ? `Delivery (${details.address})` : "Pickup"}`
    );

    const notes = els.orderNotes.value.trim();
    if (notes) lines.push(`Notes: ${notes.replace(/\s+/g, " ")}`);
    lines.push("");

    state.cart.forEach((item, index) => {
      lines.push(`${index + 1}) ${item.code} – ${item.name}`);
      const meta = [formatWeight(item.weight), item.flavour];
      if (item.eggless) meta.push("Eggless");
      meta.push(`Qty ${item.qty}`);
      lines.push(`   ${meta.join(" · ")}`);
      if (item.message) lines.push(`   Message: "${item.message}"`);
      if (item.instructions) lines.push(`   Notes: ${item.instructions.replace(/\s+/g, " ")}`);
      try {
        lines.push(`   Photo: ${new URL(item.image, window.location.href).href}`);
      } catch (error) {
        lines.push(`   Photo: ${item.image}`);
      }
      lines.push(`   ${money(item.unitPrice * item.qty)}`);
    });

    lines.push("");
    lines.push(`Subtotal: ${money(cartSubtotal())}`);
    lines.push("(Final price confirmed by the bakery)");
    return lines.join("\n");
  }

  function handleCheckout(event) {
    event.preventDefault();
    const result = validateCheckout();
    if (result.error) {
      showCheckoutError(result.error, result.focus);
      if (!result.focus) showToast(result.error);
      return;
    }

    const message = buildOrderMessage(result);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    showToast("WhatsApp opened — send the message to confirm.");
  }

  /* ------------------------------------------------------------------------
     Lightbox (cake photos + gallery)
  ------------------------------------------------------------------------ */
  function setupLightbox() {
    if (!els.lightbox) return;
    trapFocus(els.lightbox);

    $$("[data-close-lightbox]").forEach((btn) => {
      btn.addEventListener("click", () => closeOverlay(els.lightbox));
    });

    els.lightboxCustomize?.addEventListener("click", () => {
      const cake = state.lightboxCake;
      if (!cake) return;
      closeOverlay(els.lightbox);
      openCustomize(cake);
    });
  }

  function openCakeLightbox(code) {
    const cake = state.catalog.find((row) => row.code === code);
    if (!cake) return;
    state.lightboxCake = cake;
    els.lightboxImage.src = cake.image;
    els.lightboxImage.alt = `${cake.name} — cake ${cake.code}`;
    els.lightboxCode.textContent = cake.code;
    els.lightboxCodeOverlay.textContent = cake.code;
    els.lightboxCodeOverlay.hidden = false;
    els.lightboxCaption.textContent = cake.name;
    els.lightboxCustomize.hidden = false;
    openOverlay(els.lightbox);
  }

  function openGalleryLightbox(button) {
    state.lightboxCake = null;
    els.lightboxImage.src = button.dataset.lightboxSrc;
    els.lightboxImage.alt = button.dataset.lightboxCaption || "Cake from our gallery";
    els.lightboxCode.textContent = "Our work";
    els.lightboxCodeOverlay.hidden = true;
    els.lightboxCaption.textContent = button.dataset.lightboxCaption || "Gallery";
    els.lightboxCustomize.hidden = true;
    openOverlay(els.lightbox);
  }

  /* ------------------------------------------------------------------------
     Menu interactions
  ------------------------------------------------------------------------ */
  function setupMenu() {
    els.categoryChips?.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-category]");
      if (!chip) return;
      state.activeCategory = chip.dataset.category;
      state.visibleCount = PAGE_SIZE;
      renderCatalog();
    });

    els.cakeSearch?.addEventListener("input", () => {
      state.search = els.cakeSearch.value;
      state.visibleCount = PAGE_SIZE;
      renderCatalog();
    });

    els.sortSelect?.addEventListener("change", () => {
      state.sort = els.sortSelect.value;
      state.visibleCount = PAGE_SIZE;
      renderCatalog();
    });

    els.clearFilters?.addEventListener("click", () => {
      state.activeCategory = "all";
      state.search = "";
      state.sort = "popular";
      state.visibleCount = PAGE_SIZE;
      if (els.cakeSearch) els.cakeSearch.value = "";
      if (els.sortSelect) els.sortSelect.value = "popular";
      renderCatalog();
    });

    els.loadMore?.addEventListener("click", () => {
      state.visibleCount += PAGE_SIZE;
      renderCatalog();
    });

    els.cakeGrid?.addEventListener("click", (event) => {
      const openButton = event.target.closest("[data-open-cake]");
      if (openButton) {
        openCakeLightbox(openButton.dataset.openCake);
        return;
      }
      const customizeButton = event.target.closest("[data-customize]");
      if (customizeButton) {
        const cake = state.catalog.find((row) => row.code === customizeButton.dataset.customize);
        openCustomize(cake);
      }
    });

    $$("button[data-lightbox-src]").forEach((button) => {
      button.addEventListener("click", () => openGalleryLightbox(button));
    });

    // Global image fallback keeps a missing photo from breaking a card.
    document.addEventListener(
      "error",
      (event) => {
        const img = event.target;
        if (!(img instanceof HTMLImageElement)) return;
        const loaded = img.currentSrc || img.src;
        if (loaded.includes("/thumbs/")) {
          img.removeAttribute("srcset");
          img.removeAttribute("sizes");
          img.src = loaded.replace("/thumbs/", "/");
          return;
        }
        if (img.dataset.fallback) return;
        img.dataset.fallback = "1";
        img.src = "images/fallback-cake.webp";
      },
      true
    );
  }

  /* ------------------------------------------------------------------------
     Init
  ------------------------------------------------------------------------ */
  function setupMisc() {
    if (els.year) els.year.textContent = String(new Date().getFullYear());
    $$("[data-review-link]").forEach((link) => {
      link.href = SITE.reviewUrl || "#";
    });
  }

  /* ------------------------------------------------------------------------
     Custom order request: reference photos → WhatsApp
     Photos are resized in the browser and uploaded to the public
     `custom-requests` bucket when Supabase is configured. The request always
     ends in WhatsApp, even if the upload fails.
  ------------------------------------------------------------------------ */
  const PHOTO_MAX_FILES = 3;
  const PHOTO_MAX_SIDE = 1280;
  const PHOTO_QUALITY = 0.82;
  const PHOTO_BUCKET = "custom-requests";
  const photos = [];
  let photoBusy = false;

  function photoUploadReady() {
    const sb = SITE.supabase;
    return Boolean(sb && sb.url && sb.anonKey);
  }

  function randomToken(bytes = 12) {
    const values = new Uint8Array(bytes);
    crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function showPhotoError(message, focus) {
    const error = $("#photoError");
    error.textContent = message;
    error.hidden = false;
    if (focus) focus.focus();
  }

  function clearPhotoError() {
    $("#photoError").hidden = true;
  }

  // createImageBitmap reads the File directly, so no blob: URL is needed.
  // The site's CSP does not allow blob: images.
  async function shrinkPhoto(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Could not encode photo"))),
        "image/jpeg",
        PHOTO_QUALITY
      );
    });

    const thumb = document.createElement("canvas");
    const thumbScale = Math.min(1, 160 / Math.max(canvas.width, canvas.height));
    thumb.width = Math.round(canvas.width * thumbScale);
    thumb.height = Math.round(canvas.height * thumbScale);
    thumb.getContext("2d").drawImage(canvas, 0, 0, thumb.width, thumb.height);
    return { blob, preview: thumb.toDataURL("image/jpeg", 0.7) };
  }

  async function addPhotos(fileList) {
    const picked = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    if (!picked.length) return;
    const room = PHOTO_MAX_FILES - photos.length;
    if (room <= 0) {
      showPhotoError(`You can add up to ${PHOTO_MAX_FILES} photos.`);
      return;
    }

    clearPhotoError();
    for (const file of picked.slice(0, room)) {
      try {
        photos.push(await shrinkPhoto(file));
      } catch (error) {
        showPhotoError("One photo could not be read. Try a JPG or PNG.");
      }
    }
    if (picked.length > room) {
      showPhotoError(`Only ${PHOTO_MAX_FILES} photos fit. The rest were skipped.`);
    }
    renderPhotos();
  }

  function renderPhotos() {
    $("#photoPreviews").innerHTML = photos
      .map(
        (photo, index) => `
        <div class="relative">
          <img src="${photo.preview}" alt="Reference photo ${index + 1}" class="h-24 w-full rounded-lg object-cover" />
          <button class="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink" type="button" data-remove-photo="${index}" aria-label="Remove photo ${index + 1}">×</button>
        </div>`
      )
      .join("");
    $("#photoCount").textContent = `${photos.length}/${PHOTO_MAX_FILES}`;
    $("#photoPickBtn").disabled = photos.length >= PHOTO_MAX_FILES;
  }

  async function uploadRequestPhoto(blob) {
    const sb = SITE.supabase;
    const base = String(sb.url).replace(/\/$/, "");
    const path = `${Date.now().toString(36)}-${randomToken()}.jpg`;
    const response = await fetchWithTimeout(
      `${base}/storage/v1/object/${PHOTO_BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: sb.anonKey,
          Authorization: `Bearer ${sb.anonKey}`,
          "Content-Type": "image/jpeg",
        },
        body: blob,
      },
      30000
    );
    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);
    return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
  }

  function syncPhotoMode() {
    const form = $("#photoRequestForm");
    const delivery = $("input[name='photoMode']:checked", form)?.value === "delivery";
    $("#photoAddressWrap").classList.toggle("hidden", !delivery);
    $("#photoAddress").required = delivery;
  }

  function readPhotoRequest() {
    const form = $("#photoRequestForm");
    const name = $("#photoName").value.trim();
    if (name.length < 2) return { error: "Please add your name.", focus: $("#photoName") };

    const date = $("#photoDate").value;
    if (!date) return { error: "Please choose a date.", focus: $("#photoDate") };
    if (date < todayISO()) return { error: "Please choose today or a future date.", focus: $("#photoDate") };

    const mode = $("input[name='photoMode']:checked", form)?.value || "pickup";
    const address = $("#photoAddress").value.trim();
    if (mode === "delivery" && address.length < 5) {
      return { error: "Please add a delivery address (street and landmark).", focus: $("#photoAddress") };
    }

    const details = {
      name,
      date,
      mode,
      address,
      occasion: $("#photoOccasion").value,
      size: $("#photoSize").value.trim(),
      flavour: $("#photoFlavour").value.trim(),
      message: $("#photoMessage").value.trim(),
      eggless: $("#photoEggless").checked,
      changes: $("#photoChanges").value.trim(),
    };

    if (!photos.length && !details.changes && !details.size) {
      return { error: "Add a photo, or describe the cake you want.", focus: $("#photoChanges") };
    }
    return details;
  }

  function buildPhotoMessage(details, links, photoNote) {
    const lines = [];
    lines.push(`🎂 Custom Cake Request – ${SITE.name}`);
    lines.push(`Name: ${details.name}`);
    const mode =
      details.mode === "delivery" ? `Delivery (${details.address.replace(/\s+/g, " ")})` : "Pickup";
    lines.push(`Date: ${displayDate(details.date)} | Mode: ${mode}`);

    const spec = [details.occasion, details.size, details.flavour, details.eggless ? "Eggless" : ""];
    const specText = spec.filter(Boolean).join(" · ");
    if (specText) lines.push(`Cake: ${specText}`);
    if (details.message) lines.push(`Message on cake: "${details.message}"`);
    if (details.changes) lines.push(`Design notes: ${details.changes.replace(/\s+/g, " ")}`);

    if (links.length) {
      lines.push("Reference photos:");
      links.forEach((link, index) => lines.push(`${index + 1}) ${link}`));
    } else if (photoNote) {
      lines.push(photoNote);
    }

    lines.push("");
    lines.push("Please send a quote.");
    return lines.join("\n");
  }

  async function handlePhotoRequest(event) {
    event.preventDefault();
    if (photoBusy) return;
    clearPhotoError();

    const details = readPhotoRequest();
    if (details.error) {
      showPhotoError(details.error, details.focus);
      return;
    }

    // Open the tab now, while the click still counts as user input. Browsers
    // block window.open calls made after the photo upload has finished.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;

    photoBusy = true;
    const submit = $("#photoSubmitBtn");
    submit.disabled = true;
    submit.textContent = "Preparing your request…";

    let links = [];
    let photoNote = "";
    if (photos.length) {
      if (!photoUploadReady()) {
        photoNote = "Reference photos: I'll attach them in this chat.";
      } else {
        try {
          links = await Promise.all(photos.map((photo) => uploadRequestPhoto(photo.blob)));
        } catch (error) {
          photoNote = "Reference photos did not upload: I'll attach them in this chat.";
        }
      }
    }

    const message = buildPhotoMessage(details, links, photoNote);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    if (tab) tab.location.href = url;
    else window.location.href = url;

    photoBusy = false;
    submit.disabled = false;
    submit.textContent = "Send request on WhatsApp";
    photos.length = 0;
    renderPhotos();
    $("#photoRequestForm").reset();
    syncPhotoMode();
    closeOverlay($("#photoRequestModal"));
    showToast("WhatsApp opened. Send the message to confirm.");
  }

  function setupPhotoRequest() {
    const modal = $("#photoRequestModal");
    const form = $("#photoRequestForm");
    if (!modal || !form) return;
    trapFocus(modal);

    $$("[data-open-photo]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        $("#photoDate").min = todayISO();
        openOverlay(modal, $("#photoName"));
      });
    });
    $$("[data-close-photo]").forEach((btn) => btn.addEventListener("click", () => closeOverlay(modal)));

    const input = $("#photoInput");
    $("#photoPickBtn").addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      await addPhotos(input.files);
      input.value = "";
    });

    $("#photoPreviews").addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-photo]");
      if (!button) return;
      photos.splice(Number(button.dataset.removePhoto), 1);
      renderPhotos();
    });

    $$("input[name='photoMode']", form).forEach((radio) => radio.addEventListener("change", syncPhotoMode));
    form.addEventListener("submit", handlePhotoRequest);
    renderPhotos();
    syncPhotoMode();
  }

  async function init() {
    setupMisc();
    setupAnnouncement();
    setupWhatsAppLinks();
    setupHeader();
    setupReveal();
    renderReviews();
    setupMenu();
    setupCustomize();
    setupPhotoRequest();
    setupCart();
    setupLightbox();
    setupEscape();
    renderSkeletons();

    state.cart = loadCart();
    renderCart();

    state.catalog = await loadCatalog();
    reconcileCart();
    renderChips();
    renderCatalog();
    renderCart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
