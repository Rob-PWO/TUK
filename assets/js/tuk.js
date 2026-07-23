/* ==========================================================================
   TACKLEUK - Shared interaction layer (vanilla JS, no dependencies)
   Defensive: every feature checks for its elements, so one file powers
   every page. Conversion features: predictive search, cart drawer + free
   delivery progress, quick-view, sticky buy bar, countdown, toasts,
   wishlist, filters, tabs, recently-viewed.
   ========================================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const money = (n) => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const FREE_DELIVERY = 150;

  /* ---- tiny global store (persisted) ---------------------------------- */
  const store = {
    get cart() { try { return JSON.parse(localStorage.getItem("tuk_cart") || "[]"); } catch { return []; } },
    set cart(v) { localStorage.setItem("tuk_cart", JSON.stringify(v)); },
    get wish() { try { return JSON.parse(localStorage.getItem("tuk_wish") || "[]"); } catch { return []; } },
    set wish(v) { localStorage.setItem("tuk_wish", JSON.stringify(v)); },
  };

  /* ---- toast ----------------------------------------------------------- */
  let toastWrap;
  function toast(msg, sub) {
    if (!toastWrap) {
      toastWrap = document.createElement("div");
      toastWrap.className = "toast-wrap";
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML =
      '<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
      '<div><div>' + msg + '</div>' + (sub ? '<div style="font-weight:500;opacity:.75;font-size:.8rem">' + sub + '</div>' : '') + '</div>';
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ---- header scroll shadow ------------------------------------------- */
  const header = $(".header");
  if (header) {
    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- predictive search ---------------------------------------------- */
  const search = $(".search");
  if (search) {
    const input = $("input", search);
    const sug = $(".s-suggest", search);
    if (input && sug) {
      const show = () => sug.classList.add("open");
      const hide = () => sug.classList.remove("open");
      input.addEventListener("focus", show);
      input.addEventListener("input", show);
      document.addEventListener("click", (e) => { if (!search.contains(e.target)) hide(); });
      input.addEventListener("keydown", (e) => { if (e.key === "Escape") { hide(); input.blur(); } });
    }
  }

  /* ---- cart count badges ---------------------------------------------- */
  function cartCount() { return store.cart.reduce((s, i) => s + i.qty, 0); }
  function cartTotal() { return store.cart.reduce((s, i) => s + i.price * i.qty, 0); }
  function syncCount() {
    const n = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = n; el.style.display = n ? "" : "none"; });
  }

  /* ---- free delivery progress ----------------------------------------- */
  function syncProgress() {
    const total = cartTotal();
    const pct = Math.min(100, (total / FREE_DELIVERY) * 100);
    const remain = Math.max(0, FREE_DELIVERY - total);
    $$("[data-ship-bar]").forEach((b) => (b.style.width = pct + "%"));
    $$("[data-ship-msg]").forEach((m) => {
      m.innerHTML = remain <= 0
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Your order qualifies for <b>free next-day delivery</b>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Add <b>' + money(remain) + '</b> more for FREE delivery';
    });
  }

  /* ---- cart drawer ----------------------------------------------------- */
  const drawer = $("#cartDrawer");
  const overlay = $("#overlay");
  function openDrawer() { if (drawer) { renderDrawer(); drawer.classList.add("open"); overlay && overlay.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeAll() {
    drawer && drawer.classList.remove("open");
    $$(".modal.open").forEach((m) => m.classList.remove("open"));
    $$(".filters.open").forEach((f) => f.classList.remove("open"));
    $$(".menu-drawer.open").forEach((m) => m.classList.remove("open"));
    const hb = $(".hamburger");
    hb && hb.setAttribute("aria-expanded", "false");
    overlay && overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  overlay && overlay.addEventListener("click", closeAll);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  $$("[data-open-cart]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); openDrawer(); }));
  $$("[data-close]").forEach((b) => b.addEventListener("click", closeAll));

  /* ---- mobile menu (hamburger + off-canvas, built from the existing nav) */
  (function buildMobileMenu() {
    const hostRow = $(".header-main .container");
    const nav = $(".nav");
    if (!hostRow || !nav || $(".menu-drawer")) return;

    const burger = document.createElement("button");
    burger.className = "hamburger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Open menu");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "mobileMenu");
    burger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    hostRow.insertBefore(burger, hostRow.firstChild);

    const chevD = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    const chevR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

    let cats = "";
    $$(".nav-item", nav).forEach((item) => {
      const link = $(".nav-link", item);
      if (!link) return;
      const label = link.textContent.trim();
      const href = link.getAttribute("href") || "category.html";
      const isClear = link.classList.contains("clearance");
      const subLinks = $$(".mega ul li a", item);
      if (subLinks.length) {
        const subs = subLinks.map((a) => '<a href="' + (a.getAttribute("href") || "category.html") + '">' + a.textContent.trim() + "</a>").join("");
        cats += '<div class="menu-cat"><button type="button">' + label + chevD + '</button><div class="sub"><a class="all" href="' + href + '">Shop all ' + label + "</a>" + subs + "</div></div>";
      } else {
        cats += '<div class="menu-cat"><a class="' + (isClear ? "is-clear" : "") + '" href="' + href + '">' + label + chevR + "</a></div>";
      }
    });

    const ic = {
      account: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      wish: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      van: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    };

    const md = document.createElement("aside");
    md.className = "menu-drawer";
    md.id = "mobileMenu";
    md.setAttribute("role", "dialog");
    md.setAttribute("aria-modal", "true");
    md.setAttribute("aria-label", "Main menu");
    md.innerHTML =
      '<div class="md-head"><a href="index.html" class="logo"><img src="assets/img/logo-white.webp" alt="TackleUK - the home of fishing" height="34"></a>' +
      '<button class="drawer-close" type="button" aria-label="Close menu"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>' +
      '<div class="md-usp">' + ic.van + " FREE next-day delivery over £150</div>" +
      '<div class="md-body">' + cats + '<div class="md-cue" aria-hidden="true"><span>Scroll for more</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>' + "</div>" +
      '<div class="md-foot">' +
      '<a href="#">' + ic.account + " My Account</a>" +
      '<a href="#">' + ic.wish + " Wishlist</a>" +
      '<a href="#">' + ic.help + " Help &amp; Contact</a>" +
      '<a href="#">' + ic.store + " Store Finder</a>" +
      "</div>";
    document.body.appendChild(md);

    const mdBody = $(".md-body", md);
    const updateCue = () => {
      if (!mdBody) return;
      const more = mdBody.scrollHeight - mdBody.clientHeight - mdBody.scrollTop > 24;
      md.classList.toggle("has-more", more);
    };
    mdBody && mdBody.addEventListener("scroll", updateCue, { passive: true });

    burger.addEventListener("click", () => {
      md.classList.add("open");
      burger.setAttribute("aria-expanded", "true");
      overlay && overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      requestAnimationFrame(updateCue);
    });
    $(".drawer-close", md).addEventListener("click", closeAll);
    $$(".menu-cat > button", md).forEach((b) => b.addEventListener("click", () => { b.parentElement.classList.toggle("open"); requestAnimationFrame(updateCue); }));
  })();

  function renderDrawer() {
    const body = $("[data-cart-body]", drawer);
    if (!body) return;
    const cart = store.cart;
    if (!cart.length) {
      body.innerHTML = '<div style="text-align:center;padding:60px 10px;color:var(--ink-500)">' +
        '<svg viewBox="0 0 24 24" width="54" height="54" fill="none" stroke="currentColor" stroke-width="1.4" style="margin:0 auto 14px;opacity:.4"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
        '<p style="font-weight:700;color:var(--navy-900);font-family:var(--display)">Your basket is empty</p>' +
        '<p style="font-size:.85rem;margin-top:6px">Let\'s find you some gear.</p>' +
        '<a href="category.html" class="btn btn-primary" style="margin-top:18px">Start shopping</a></div>';
    } else {
      body.innerHTML = cart.map((it, i) =>
        '<div class="cart-line">' +
        '<div class="ph"><img src="' + it.img + '" alt="" loading="lazy"></div>' +
        '<div class="ci"><div class="n">' + it.name + '</div>' +
        (it.variant ? '<div class="meta">' + it.variant + '</div>' : '') +
        '<div class="row"><div class="qty-sm"><button data-dec="' + i + '">−</button><span>' + it.qty + '</span><button data-inc="' + i + '">+</button></div>' +
        '<div class="price">' + money(it.price * it.qty) + '</div></div>' +
        '<button class="rm" data-rm="' + i + '">Remove</button></div></div>'
      ).join("");
      $$("[data-inc]", body).forEach((b) => b.onclick = () => chQty(+b.dataset.inc, 1));
      $$("[data-dec]", body).forEach((b) => b.onclick = () => chQty(+b.dataset.dec, -1));
      $$("[data-rm]", body).forEach((b) => b.onclick = () => { const c = store.cart; c.splice(+b.dataset.rm, 1); store.cart = c; afterCart(); renderDrawer(); });
    }
    const sub = $("[data-cart-sub]", drawer);
    if (sub) sub.textContent = money(cartTotal());
    syncProgress();
  }
  function chQty(i, d) { const c = store.cart; if (!c[i]) return; c[i].qty = Math.max(1, c[i].qty + d); store.cart = c; afterCart(); renderDrawer(); }

  function afterCart() {
    syncCount(); syncProgress();
    // keep an already-open drawer live (e.g. upsell "Add" clicked inside it)
    if (drawer && drawer.classList.contains("open")) renderDrawer();
  }

  function addToCart(p, openIt = true) {
    p.variant = p.variant == null ? null : p.variant; // normalise so null/undefined dedupe as one line
    const c = store.cart;
    const ex = c.find((i) => i.id === p.id && (i.variant == null ? null : i.variant) === p.variant);
    if (ex) ex.qty += p.qty || 1; else c.push({ ...p, qty: p.qty || 1 });
    store.cart = c;
    afterCart();
    if (openIt) openDrawer();
    else toast(p.name + " added to basket", "Total " + money(cartTotal()));
  }

  /* ---- add-to-cart buttons (data-attrs) -------------------------------- */
  $$("[data-add]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const d = btn.dataset;
      const qtyEl = d.qtyFrom ? $(d.qtyFrom) : null;
      addToCart({
        id: d.add, name: d.name, price: +d.price, img: d.img,
        variant: d.variant || (qtyEl ? null : null),
        qty: qtyEl ? +qtyEl.value || 1 : 1,
      }, d.silent !== "true");
      pushRecent(d);
        if (!btn.classList.contains("added")) {
        const prev = btn.innerHTML;
        btn.classList.add("added");
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' + (btn.textContent.trim() ? " Added" : "");
        setTimeout(() => { btn.classList.remove("added"); btn.innerHTML = prev; }, 1300);
      }
    });
  });

  /* ---- quick view ------------------------------------------------------ */
  const qvModal = $("#quickView");
  $$("[data-quickview]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!qvModal) return;
      const d = btn.dataset;
      $("[data-qv-img]", qvModal).src = d.img;
      $("[data-qv-name]", qvModal).textContent = d.name;
      $("[data-qv-brand]", qvModal).textContent = d.brand || "";
      $("[data-qv-price]", qvModal).textContent = money(+d.price);
      $("[data-qv-desc]", qvModal).textContent = d.desc || "";
      const addBtn = $("[data-qv-add]", qvModal);
      addBtn.dataset.add = d.quickview; addBtn.dataset.name = d.name;
      addBtn.dataset.price = d.price; addBtn.dataset.img = d.img;
      if (d.variant) addBtn.dataset.variant = d.variant; else delete addBtn.dataset.variant;
      qvModal.classList.add("open"); overlay && overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });
  if (qvModal) {
    const addBtn = $("[data-qv-add]", qvModal);
    addBtn && addBtn.addEventListener("click", () => {
      addToCart({ id: addBtn.dataset.add, name: addBtn.dataset.name, price: +addBtn.dataset.price, img: addBtn.dataset.img, variant: addBtn.dataset.variant, qty: 1 }, false);
      closeAll(); setTimeout(openDrawer, 260);
    });
  }

  /* ---- wishlist -------------------------------------------------------- */
  function syncWish() {
    const w = store.wish;
    $$("[data-wish]").forEach((b) => b.classList.toggle("on", w.includes(b.dataset.wish)));
    $$("[data-wish-count]").forEach((el) => { el.textContent = w.length; el.style.display = w.length ? "" : "none"; });
  }
  $$("[data-wish]").forEach((b) => b.addEventListener("click", (e) => {
    e.preventDefault(); e.stopPropagation();
    const id = b.dataset.wish; const w = store.wish; const i = w.indexOf(id);
    if (i > -1) { w.splice(i, 1); toast("Removed from wishlist"); } else { w.push(id); toast("Saved to wishlist"); }
    store.wish = w; syncWish();
  }));

  /* ---- desktop mega menu: hover intent, instant switching, indicator --- */
  (function megaMenu() {
    const nav = $("nav.nav");
    if (!nav) return;
    const links = $$(".nav-link", nav);
    if (!links.length) return;

    // sliding underline that follows the pointer
    const ind = document.createElement("span");
    ind.className = "nav-ind";
    nav.appendChild(ind);
    function moveInd(link) {
      const r = link.getBoundingClientRect(), n = nav.getBoundingClientRect();
      ind.style.width = r.width + "px";
      ind.style.transform = "translateX(" + (r.left - n.left) + "px)";
      ind.classList.toggle("red", link.classList.contains("clearance"));
      ind.classList.add("on");
    }
    links.forEach((l) => l.addEventListener("mouseenter", () => moveInd(l)));
    nav.addEventListener("mouseleave", () => ind.classList.remove("on"));

    const withMega = $$(".nav-item", nav).filter((i) => $(".mega", i));
    if (!withMega.length) return;

    const dim = document.createElement("div");
    dim.className = "nav-dim";
    document.body.appendChild(dim);

    let current = null, openT = null, closeT = null;
    function snap(item) { // suppress the entrance/exit animation for one frame
      const m = $(".mega", item);
      m.classList.add("no-anim");
      requestAnimationFrame(() => m.classList.remove("no-anim"));
    }
    function openItem(item) {
      if (current === item) return;
      if (current) { snap(current); current.classList.remove("open"); snap(item); }
      item.classList.add("open");
      dim.classList.add("on");
      current = item;
    }
    function closeMega() {
      clearTimeout(openT); clearTimeout(closeT);
      if (current) current.classList.remove("open");
      current = null;
      dim.classList.remove("on");
    }
    withMega.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(closeT); clearTimeout(openT);
        openT = setTimeout(() => openItem(item), current ? 0 : 70); // hover intent
      });
      item.addEventListener("mouseleave", () => {
        clearTimeout(openT);
        closeT = setTimeout(closeMega, 170); // forgiving diagonal travel
      });
      const link = $(".nav-link", item);
      link && link.addEventListener("focus", () => openItem(item));
    });
    $$(".nav-item", nav).filter((i) => !$(".mega", i)).forEach((i) =>
      i.addEventListener("mouseenter", () => { clearTimeout(closeT); closeT = setTimeout(closeMega, 60); }));
    nav.addEventListener("mouseleave", () => { clearTimeout(openT); closeT = setTimeout(closeMega, 130); });
    nav.addEventListener("focusout", (e) => { if (!nav.contains(e.relatedTarget)) closeMega(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMega(); });
    window.addEventListener("resize", () => ind.classList.remove("on"));
  })();

  /* ---- PDP option pills: selection drives price, SKU and cart variant -- */
  const optGroups = $$(".buybox .opt-group");
  if (optGroups.length) {
    const els = {
      now: $(".price-block .now"), was: $(".price-block .was"), save: $(".price-block .save-note"),
      monthly: $(".buybox .monthly"), vat: $(".buybox .vat-line"), sku: $(".buybox [data-sku-val]"),
      klarna: $(".klarna-box p"), badge: $(".gallery .badges .badge-sale"), sticky: $(".sticky-bar .sb-info .p"),
    };
    function applySelection() {
      const vals = []; let price = null, rrp = null, sku = null;
      optGroups.forEach((g) => {
        const s = $(".opt-pill.sel", g);
        if (!s) return;
        vals.push(s.dataset.value);
        if (s.dataset.price) { price = +s.dataset.price; rrp = +(s.dataset.rrp || s.dataset.price); sku = s.dataset.sku; }
      });
      const variant = vals.join(" · ");
      if (price != null) {
        const save = rrp - price, mo = money(price / 36);
        els.now && (els.now.textContent = money(price));
        els.was && (els.was.textContent = money(rrp), els.was.style.display = save > 0 ? "" : "none");
        els.save && (els.save.textContent = "You save " + money(save), els.save.style.display = save > 0 ? "" : "none");
        els.monthly && (els.monthly.innerHTML = "or from <b>" + mo + "/mo</b>");
        els.vat && (els.vat.textContent = "RRP " + money(rrp));
        els.sku && sku && (els.sku.textContent = sku);
        els.klarna && (els.klarna.innerHTML = "Pay in 3 interest-free instalments of <b>" + money(price / 3) + "</b> or spread over 36 months.");
        els.badge && (els.badge.textContent = "Save " + money(save), els.badge.style.display = save > 0 ? "" : "none");
        els.sticky && (els.sticky.innerHTML = money(price) + ' <span class="was">' + money(rrp) + '</span><span class="mo">· from ' + mo + "/mo</span>");
      }
      $$(".buybox [data-add], .sticky-bar [data-add]").forEach((b) => {
        b.dataset.variant = variant;
        if (price != null) b.dataset.price = price;
      });
    }
    optGroups.forEach((g) => $$(".opt-pill", g).forEach((p) => p.addEventListener("click", () => {
      $$(".opt-pill", g).forEach((x) => x.classList.remove("sel"));
      p.classList.add("sel");
      applySelection();
    })));
    applySelection();
  }

  /* ---- qty steppers (generic) ----------------------------------------- */
  $$("[data-qty]").forEach((q) => {
    const inp = $("input", q);
    $("[data-qminus]", q) && $("[data-qminus]", q).addEventListener("click", () => inp.value = Math.max(1, (+inp.value || 1) - 1));
    $("[data-qplus]", q) && $("[data-qplus]", q).addEventListener("click", () => inp.value = (+inp.value || 1) + 1);
  });

  /* ---- PDP gallery ----------------------------------------------------- */
  const gallery = $(".gallery");
  if (gallery) {
    const main = $(".main img", gallery);
    $$(".thumbs button", gallery).forEach((t) => t.addEventListener("click", () => {
      $$(".thumbs button", gallery).forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      const img = $("img", t); if (img && main) main.src = img.src.replace("w=160", "w=900");
    }));
  }

  /* ---- PDP gallery hover-zoom (pointer devices only) -------------------- */
  const zoomBox = $(".gallery .main");
  if (zoomBox && window.matchMedia("(hover:hover)").matches) {
    const zImg = $("img", zoomBox);
    zoomBox.addEventListener("mousemove", (e) => {
      const r = zoomBox.getBoundingClientRect();
      zImg.style.transformOrigin = ((e.clientX - r.left) / r.width) * 100 + "% " + ((e.clientY - r.top) / r.height) * 100 + "%";
      zImg.style.transform = "scale(1.9)";
    });
    zoomBox.addEventListener("mouseleave", () => { zImg.style.transform = ""; });
  }

  /* ---- tabs ------------------------------------------------------------ */
  $$("[data-tabs]").forEach((group) => {
    const btns = $$("[data-tab]", group);
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const tgt = b.dataset.tab;
      $$(".tabpanel", group.parentElement).forEach((p) => p.classList.toggle("active", p.dataset.panel === tgt));
    }));
  });

  /* ---- anchors that target a tab panel: activate the tab first -------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href").slice(1);
    const panel = id && (document.getElementById(id) || document.querySelector('[data-panel="' + id + '"]'));
    if (!panel || !panel.classList.contains("tabpanel")) return;
    e.preventDefault();
    const btn = $('[data-tab="' + panel.dataset.panel + '"]');
    btn && btn.click();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  /* ---- filter accordions + mobile filter toggle ----------------------- */
  $$(".filter-group h5").forEach((h) => h.addEventListener("click", () => h.parentElement.classList.toggle("collapsed")));
  $$("[data-filter-toggle]").forEach((b) => b.addEventListener("click", () => {
    const f = $(".filters"); if (f) { f.classList.add("open"); overlay && overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
  }));
  $$("[data-filter-close]").forEach((b) => b.addEventListener("click", closeAll));

  /* ---- sticky buy bar (PDP) ------------------------------------------- */
  const stickyBar = $(".sticky-bar");
  const buyAnchor = $("[data-buy-anchor]");
  if (stickyBar && buyAnchor) {
    const io = new IntersectionObserver(([e]) => stickyBar.classList.toggle("show", !e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(buyAnchor);
  }

  /* ---- countdown to dispatch cut-off (today 15:00) -------------------- */
  $$("[data-countdown]").forEach((el) => {
    function tick() {
      const now = new Date();
      const cutoff = new Date(now); cutoff.setHours(15, 0, 0, 0);
      let label = "for same-day dispatch";
      if (now >= cutoff) { cutoff.setDate(cutoff.getDate() + 1); label = "for next-day dispatch"; }
      let diff = Math.floor((cutoff - now) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
      const s = String(diff % 60).padStart(2, "0");
      el.innerHTML = 'Order within <span class="cd">' + h + ":" + m + ":" + s + '</span> ' + label;
    }
    tick(); setInterval(tick, 1000);
  });

  /* ---- hero slider ----------------------------------------------------- */
  const hero = $("[data-hero]");
  if (hero) {
    const slides = $$(".hero-slide", hero);
    const dots = $$(".hero-dots button", hero);
    let idx = 0;
    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, k) => s.style.display = k === idx ? "flex" : "none");
      dots.forEach((d, k) => d.classList.toggle("active", k === idx));
    }
    if (slides.length > 1) {
      // stop auto-rotation once the user takes control of the dots
      const auto = setInterval(() => go(idx + 1), 6000);
      dots.forEach((d, k) => d.addEventListener("click", () => { clearInterval(auto); go(k); }));
      go(0);
    }
  }

  /* ---- carousels ------------------------------------------------------- */
  $$("[data-carousel]").forEach((c) => {
    const track = $(".carousel-track", c);
    if (!track) return;
    const scope = c.closest("section") || document; // nav arrows may live in the section header
    const prev = $("[data-prev]", scope), next = $("[data-next]", scope);
    const step = () => Math.min(track.clientWidth * 0.8, 600);
    prev && prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next && next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  });

  /* ---- recently viewed ------------------------------------------------- */
  function pushRecent(d) {
    if (!d || !d.add) return;
    try {
      let r = JSON.parse(localStorage.getItem("tuk_recent") || "[]");
      r = r.filter((x) => x.id !== d.add);
      r.unshift({ id: d.add, name: d.name, price: d.price, img: d.img });
      localStorage.setItem("tuk_recent", JSON.stringify(r.slice(0, 8)));
    } catch {}
  }

  /* ---- delivery / payment selectors ----------------------------------- */
  $$("[data-ship-opt]").forEach((o) => o.addEventListener("click", () => {
    $$("[data-ship-opt]").forEach((x) => x.classList.remove("sel"));
    o.classList.add("sel");
  }));
  $$("[data-pay-method] .pm-head").forEach((h) => h.addEventListener("click", () => {
    $$("[data-pay-method]").forEach((x) => x.classList.remove("sel"));
    h.parentElement.classList.add("sel");
  }));

  /* ---- voucher demo ---------------------------------------------------- */
  $$("[data-voucher]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("input", form).value.trim().toUpperCase();
    if (v) toast(v === "FISH10" ? "Code FISH10 applied - 10% off!" : "Voucher \"" + v + "\" applied", v === "FISH10" ? "You saved on this order" : "Checking eligibility…");
    $("input", form).value = "";
  }));

  /* ---- newsletter demo ------------------------------------------------- */
  $$("[data-newsletter]").forEach((form) => form.addEventListener("submit", (e) => {
    e.preventDefault(); toast("You're subscribed", "Check your inbox for 10% off your next order"); form.reset();
  }));

  /* ---- back to top ----------------------------------------------------- */
  const btt = $(".back-to-top");
  if (btt) {
    window.addEventListener("scroll", () => btt.classList.toggle("show", window.scrollY > 600), { passive: true });
    btt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---- static basket page: make the demo rows behave like a real cart - */
  const bRows = $$("[data-cart-row]");
  if (bRows.length) {
    const basketRecalc = () => {
      let count = 0, rrp = 0, total = 0;
      const rows = $$("[data-cart-row]");
      rows.forEach((r) => {
        const inp = $("input", r);
        const q = Math.max(1, +(inp && inp.value) || 1);
        const unit = +r.dataset.unit;
        const rr = +(r.dataset.rrp || r.dataset.unit);
        count += q; total += unit * q; rrp += rr * q;
        const lp = $("[data-line-price]", r); if (lp) lp.textContent = money(unit * q);
        const lw = $("[data-line-was]", r); if (lw) lw.textContent = money(rr * q);
      });
      const save = rrp - total;
      const freeDel = total >= FREE_DELIVERY;
      const grand = total + (freeDel ? 0 : 4.99);
      $$("[data-sum-count]").forEach((e) => e.textContent = count);
      $$("[data-sum-rrp]").forEach((e) => e.textContent = money(rrp));
      $$("[data-sum-save]").forEach((e) => { e.textContent = "-" + money(save); const row = e.closest(".sumline"); if (row) row.style.display = save > 0 ? "" : "none"; });
      $$("[data-sum-save-tag]").forEach((e) => { e.textContent = "You're saving " + money(save) + " on this order"; const w = e.closest(".savings-tag"); if (w) w.style.display = save > 0 ? "" : "none"; });
      $$("[data-sum-del]").forEach((e) => { e.textContent = freeDel ? "FREE" : money(4.99); e.classList.toggle("free", freeDel); });
      $$("[data-sum-total]").forEach((e) => e.textContent = money(grand));
      $$("[data-sum-klarna]").forEach((e) => e.textContent = money(grand / 3));
      const bb = $("[data-basket-ship-bar]");
      if (bb) bb.style.width = Math.min(100, (total / FREE_DELIVERY) * 100) + "%";
      const bm = $("[data-basket-ship-msg]");
      if (bm) bm.innerHTML = freeDel
        ? '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="var(--green-600)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Your order qualifies for <b style="margin-left:3px">free next-day delivery</b>'
        : 'Add <b>' + money(FREE_DELIVERY - total) + '</b> more for FREE next-day delivery';
      if (!rows.length) {
        const wrap = $(".cart-items");
        if (wrap) wrap.innerHTML = '<div style="text-align:center;padding:56px 20px;color:var(--ink-500)">' +
          '<p style="font-weight:800;color:var(--navy-900);font-family:var(--display);font-size:1.2rem">Your basket is empty</p>' +
          '<p style="font-size:.9rem;margin:8px 0 20px">Browse the range to get started.</p>' +
          '<a href="category.html" class="btn btn-primary">Start shopping</a></div>';
      }
    };
    bRows.forEach((r) => {
      $$("[data-qminus],[data-qplus]", r).forEach((b) => b.addEventListener("click", basketRecalc));
      const inp = $("input", r); inp && inp.addEventListener("input", basketRecalc);
      const rm = $("[data-row-remove]", r); rm && rm.addEventListener("click", () => { r.remove(); basketRecalc(); toast("Item removed from basket"); });
      const sv = $("[data-row-save]", r); sv && sv.addEventListener("click", () => toast("Saved for later"));
    });
    basketRecalc();
  }

  /* ---- frequently bought together: add the whole bundle --------------- */
  $$("[data-bundle-add]").forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    const wrap = btn.closest("[data-bundle]") || document;
    $$("[data-bundle-item]", wrap).forEach((it) => {
      const d = it.dataset;
      addToCart({ id: d.id, name: d.name, price: +d.price, img: d.img, variant: d.variant, qty: 1 }, false);
    });
    openDrawer();
  }));

  /* ---- PWA service worker (HTTPS or localhost only) -------------------- */
  if ("serviceWorker" in navigator &&
      (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  /* ---- init ------------------------------------------------------------ */
  syncCount(); syncWish(); syncProgress();
  window.TUK = { addToCart, toast, openDrawer };
})();

/* ---- rotating "typed" search placeholder (real TackleUK search terms) --- */
(function () {
  var inputs = [].slice.call(document.querySelectorAll('.search input[type="search"]'));
  if (!inputs.length) return;
  var terms = ["Barbless hooks", "Korda", "Float rods", "Boilies", "Preston Innovations",
    "Frozen bait", "Monofilament", "T-shirts", "Chair", "Nash", "Carp Rods", "Feeder tips",
    "Top kits", "Leads", "Vouchers", "Floats", "Matrix", "Swivels", "MAP", "Delkim"];
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  inputs.forEach(function (input) {
    var base = input.getAttribute("placeholder") || "Search…";
    var ti = 0, ci = 0, deleting = false, timer = null, active = true;
    function frame() {
      if (!active) return;
      var term = terms[ti];
      if (!deleting) {
        ci++;
        input.placeholder = "Search for " + term.slice(0, ci);
        if (ci >= term.length) { deleting = true; timer = setTimeout(frame, 1600); return; }
        timer = setTimeout(frame, 62);
      } else {
        ci--;
        input.placeholder = "Search for " + term.slice(0, ci);
        if (ci <= 0) { deleting = false; ti = (ti + 1) % terms.length; timer = setTimeout(frame, 360); return; }
        timer = setTimeout(frame, 28);
      }
    }
    input.addEventListener("focus", function () { active = false; clearTimeout(timer); input.placeholder = base; });
    input.addEventListener("blur", function () {
      if (!input.value) { active = true; ci = 0; deleting = false; clearTimeout(timer); timer = setTimeout(frame, 220); }
    });
    if (reduce) { input.placeholder = 'Search for "Korda", "Boilies", "Nash"…'; return; }
    timer = setTimeout(frame, 700);
  });
})();

/* ---- honest dispatch message: weekend-aware, minute granularity (no ticking seconds) */
(function () {
  var el = document.querySelector("[data-dispatch]");
  if (!el) return;
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function nextWorkingDay(from) {
    var d = new Date(from);
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
    return d;
  }
  function render() {
    var now = new Date();
    var weekend = now.getDay() === 0 || now.getDay() === 6;
    var cutoff = new Date(now); cutoff.setHours(15, 0, 0, 0);
    if (!weekend && now < cutoff) {
      var mins = Math.ceil((cutoff - now) / 60000);
      var h = Math.floor(mins / 60), m = mins % 60, t;
      if (h > 0) t = h + " hr" + (h > 1 ? "s" : "") + (m > 0 ? " " + m + " min" + (m > 1 ? "s" : "") : "");
      else t = m + " min" + (m !== 1 ? "s" : "");
      el.innerHTML = "Order within <b>" + t + "</b> for same-day dispatch";
    } else {
      var nd = nextWorkingDay(now);
      var tom = new Date(now); tom.setDate(tom.getDate() + 1);
      var label = nd.toDateString() === tom.toDateString() ? "tomorrow" : DAYS[nd.getDay()];
      el.innerHTML = "Order now for dispatch <b>" + label + "</b>";
    }
  }
  render();
  setInterval(render, 30000);
})();

/* ---- stock level: "N in stock" (1-9), "10+ in stock" (>=10), "Out of stock" (0) */
(function () {
  document.querySelectorAll("[data-stock]").forEach(function (el) {
    var n = parseInt(el.getAttribute("data-stock"), 10);
    if (isNaN(n)) return;
    var label = el.querySelector("[data-stock-label]") || el;
    label.textContent = n <= 0 ? "Out of stock" : (n >= 10 ? "10+ in stock" : n + " in stock");
    el.classList.toggle("is-out", n <= 0);
  });
})();
