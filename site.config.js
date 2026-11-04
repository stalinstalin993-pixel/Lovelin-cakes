/*
 * Lovely Home Made Cakes — single source of business settings.
 * Replace the values marked TODO with the bakery's real details before launch.
 * This file is loaded on every page before app.js / festive.js / admin.js.
 */
window.SITE = {
  // --- Identity -------------------------------------------------------------
  name: "Lovely Home Made Cakes", // TODO: bakery name
  shortName: "LHC",
  tagline: "Baked slowly, celebrated loudly.",
  owner: "Ananya",
  ownerRole: "Baker & founder",
  tamilLine: "அன்போடு சுட்ட இனிப்புகள்",

  // --- Location -------------------------------------------------------------
  town: "Kanyakumari", // TODO: town
  district: "Kanyakumari",
  state: "Tamil Nadu",
  pin: "629702",
  country: "IN",
  address: "Kanyakumari, Tamil Nadu 629702", // TODO
  geo: { lat: 8.0883, lng: 77.5385 },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Kanyakumari+Tamil+Nadu+629702", // TODO
  mapEmbedUrl:
    "https://www.google.com/maps?q=Kanyakumari%2C%20Tamil%20Nadu%20629702&output=embed", // TODO

  // --- Contact --------------------------------------------------------------
  phoneDisplay: "+91 90807 24358", // TODO
  phoneHref: "+919080724358",
  whatsapp: "919080724358", // TODO: country code + number, digits only
  email: "hello@lchomemade.in",
  instagram: "https://instagram.com/lchomemade", // TODO
  facebook: "https://facebook.com/lchomemade", // TODO
  reviewUrl:
    "https://www.google.com/maps/search/?api=1&query=Lovely+Home+Made+Cakes+Kanyakumari", // TODO: Google reviews link
  reviewRating: "4.9",
  reviewCount: "128",

  // --- Opening hours --------------------------------------------------------
  hours: "Open daily, 9:00 AM – 9:30 PM", // TODO
  hoursShort: "Daily · 9 AM – 9:30 PM",
  openingHours: { opens: "09:00", closes: "21:30" },
  deliveryHours: { opens: "10:00", closes: "21:00" },

  // --- Orders ---------------------------------------------------------------
  deliveryNote: "Free within 5 km of Kanyakumari. ₹50 beyond 5 km.", // TODO
  deliveryFee: 50,
  freeDeliveryKm: 5,
  advanceNotice: "Order 1–2 days ahead. Same-day for selected cakes.",
  paymentInfo: "UPI, cash on pickup or delivery. 50% advance for custom designs.",
  cancellation: "Free cancellation up to 24 hours before pickup or delivery.",
  maxWeight: 8,
  weightStep: 0.5,
  excludedWeights: [], // e.g. [0.5, 5.5]
  egglessSurcharge: 100, // ₹ per kg
  freeFlavours: [
    "White Forest",
    "Black Forest",
    "Mango",
    "Pineapple",
    "Strawberry",
    "Black Currant",
    "Vanilla",
  ],
  premiumFlavours: ["Rasamalai", "Blueberry", "Butterscotch", "Choco Truffle", "Honey Almond"],
  premiumSurcharge: 150, // ₹ per kg
  currency: "₹",
  siteUrl: "https://lchomemade.netlify.app", // TODO: live domain, no trailing slash
  announcement: {
    text: "Fresh bakes daily · Custom orders need 1–2 days",
    link: "#menu",
    linkLabel: "Browse the menu",
  },

  // --- Reviews (shown on the site) -----------------------------------------
  testimonials: [
    {
      quote:
        "The pistachio rose cake was the quiet star of my mother's 60th. Not too sweet, and the rose was so delicate.",
      name: "Meera R.",
      detail: "Birthday cake · Kanyakumari",
    },
    {
      quote:
        "Ordered a last-minute eggless chocolate cake for my son. It arrived on time and tasted like a proper bakery bake.",
      name: "Karthik S.",
      detail: "Same-day order · Nagercoil",
    },
    {
      quote:
        "We sent a blurry inspiration photo and got back a design that felt even more 'us'. Guests kept asking where it was from.",
      name: "Divya & Arjun",
      detail: "Engagement cake · Suchindram",
    },
    {
      quote:
        "The brownie boxes are dangerously good. We now order one every other week, and the packaging is lovely.",
      name: "Nivetha M.",
      detail: "Brownie box · Kottar",
    },
    {
      quote:
        "Clear communication on WhatsApp, honest pricing, and a cake that looked exactly like the mock-up. Rare combination.",
      name: "Rahul V.",
      detail: "Custom cake · Marthandam",
    },
  ],

  // --- Supabase (optional admin) -------------------------------------------
  // Leave blank to use cakes.json only. See README > Admin setup.
  supabase: {
    url: "https://ihjteigxyrxlqibtgrsa.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloanRlaWd4eXJ4bHFpYnRncnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NDE4NTMsImV4cCI6MjEwOTMxNzg1M30.hB55-GMZhDl8ibq0daEQwp0iY7Pjnj43IopYSYZE3qg",
    table: "cakes",
    bucket: "cake-photos",
  },

  // --- Festive skins --------------------------------------------------------
  festive: {
    enabled: true,
    mode: "auto", // "auto" follows the calendar, "fixed" locks to `theme`, "off" disables
    theme: null, // "christmas" | "deepavali" | "new-year" | "valentines" | "pongal"
    offers: {
      christmas: "Christmas plum cakes and stollen are open for pre-order.",
      deepavali: "Deepavali hampers: add a box of assorted bites to any cake.",
      "new-year": "New Year celebration cakes — order by 28 December.",
      valentines: "Valentine's hearts and mini cakes, made in small batches.",
      pongal: "Pongal special: sakkarai pongal cupcakes and jaggery brownies.",
    },
    announcementByTheme: {
      christmas: "Pre-order Christmas plum cakes now · Limited batches",
      deepavali: "Deepavali hampers are here · Add sweets to any cake order",
      "new-year": "New Year cakes open for pre-order · Order by 28 December",
      valentines: "Valentine's mini cakes · Pre-order before 12 February",
      pongal: "Pongal specials are live · Jaggery brownies and sakkarai pongal cupcakes",
    },
  },
};
