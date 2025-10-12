/* ===== Utilities ===== */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

const STATE = {
  bikes: [],
  dataURLPlaceholder: `data:image/svg+xml,` + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='#e6ecf7'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='#2E5AAC'>Bike photo</text></svg>`),
  baseUrl() {
    // return origin + path up to index.html (assumes repo root)
    return location.href.replace(/(#.*)$/,'').replace(/(\?.*)$/,'');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  loadData().then(initRouter);
});

/* ===== Data load with local fallback ===== */
async function loadData(){
  try{
    const res = await fetch('./bikes.json', {cache:'no-store'});
    if(!res.ok) throw new Error('Fetch failed');
    STATE.bikes = await res.json();
  }catch(e){
    console.warn('Falling back to embedded sample bikes because fetching bikes.json failed.', e);
    STATE.bikes = [
      {
        "id":"olive-racer",
        "name":"Olive Racer",
        "color":"matte olive",
        "serial_masked":"SN•••7231",
        "photos": ["/assets/olive1.jpg","/assets/olive2.jpg"],
        "characteristics":["F# squeaky front brake","tiny dent under seatpost"],
        "proof":{"notes":"Sticker under BB says 'GAL'","doc_image":"/assets/receipt_redacted.jpg"},
        "contact":{"phone":"+972-5X-XXX-XXXX","whatsapp":"+9725XXXXXXXX","email":"me@example.com"}
      },
      {
        "id":"cobalt-commuter",
        "name":"Cobalt Commuter",
        "color":"cobalt blue",
        "serial_masked":"SN•••9914",
        "photos": ["/assets/cobalt1.jpg","/assets/cobalt2.jpg"],
        "characteristics":["Rear rack squeaks on bumps","Bell sounds like a tiny duck"],
        "proof":{"notes":"Custom bar tape pattern","doc_image":"/assets/receipt_redacted.jpg"},
        "contact":{"phone":"+972-5X-XXX-XXXX","whatsapp":"+9725XXXXXXXX","email":"me@example.com"}
      }
    ];
  }
}

/* ===== Routing (hash-based) =====
   Supported:
   #/                     Home
   #/about                About
   #/b/<id>               Bike detail
   #/b/<id>?found=1       Found Mode
   #/found/<id>           Found Mode (alt)
*/
function initRouter(){
  window.addEventListener('hashchange', route);
  if(!location.hash) location.hash = '#/';
  route();
}

function parseHash(){
  // Separate path and query
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  return { path, params };
}

function route(){
  const { path, params } = parseHash();
  const app = $('#app');
  app.innerHTML = ''; // clear

  if(path === '/' || path === ''){
    renderHome(app);
    return;
  }
  if(path === '/about'){
    renderAbout(app);
    return;
  }
  // /found/<id> -> found mode
  const foundAlt = path.match(/^\/found\/([^/]+)$/);
  if(foundAlt){
    const id = decodeURIComponent(foundAlt[1]);
    renderBike(app, id, true);
    return;
  }
  // /b/<id>
  const m = path.match(/^\/b\/([^/]+)$/);
  if(m){
    const id = decodeURIComponent(m[1]);
    const found = params.get('found') === '1';
    renderBike(app, id, found);
    return;
  }

  renderNotFound(app, 'Page not found');
}

/* ===== Views ===== */
function renderHome(root){
  const el = document.createElement('div');
  el.innerHTML = `
    <section class="hero">
      <div class="panel">
        <h1>They’re friendly, house-trained, and very attached to me.</h1>
        <p>Hi, I’m Gal. These are my bicycles. If you found one, thank you — you’re already awesome. Open its page and tap <strong>Found Mode</strong>.</p>
        <div style="margin-top:12px;">
          <a class="button" href="#/about" aria-label="Learn more about this site">About this site</a>
        </div>
      </div>
      <img src="/assets/hero.jpg" alt="Two cheerful bikes posing heroically" loading="lazy" onerror="this.src='${STATE.dataURLPlaceholder}'" />
    </section>

    <section aria-labelledby="bikes-heading">
      <h2 id="bikes-heading" style="margin:0 0 12px 0;">My Bikes</h2>
      <div class="grid" id="bikes-grid" role="list"></div>
    </section>
  `;
  root.appendChild(el);

  const grid = $('#bikes-grid', el);
  STATE.bikes.forEach(b => {
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('role','listitem');
    card.innerHTML = `
      <a href="#/b/${encodeURIComponent(b.id)}" aria-label="Open ${escapeHTML(b.name)} details">
        <img src="${(b.photos && b.photos[0]) || ''}" alt="${escapeHTML(b.name)} photo" loading="lazy" onerror="this.src='${STATE.dataURLPlaceholder}'" />
      </a>
      <div class="content">
        <div class="badge">${escapeHTML(b.color || 'unknown color')}</div>
        <h3 style="margin:8px 0 4px">${escapeHTML(b.name)}</h3>
        <p class="hint" style="margin:0">ID: ${escapeHTML(b.id)}</p>
        <div style="margin-top:10px;">
          <a class="button" href="#/b/${encodeURIComponent(b.id)}">View</a>
          <a class="button" href="#/b/${encodeURIComponent(b.id)}?found=1">Found Mode</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderAbout(root){
  const box = document.createElement('div');
  box.className = 'alert';
  box.innerHTML = `
    <h2 style="margin:4px 0 6px 0;">About</h2>
    <p>This is a tiny static site that lists my bikes and helps kind humans return them if found.
    It uses zero backends, just <em>bikes.json</em>, vanilla JS, and hash-routing so it works on GitHub Pages.</p>
    <p>If you scanned a QR on a bicycle, open its <strong>Found Mode</strong> for big, friendly buttons that contact me fast.</p>
  `;
  root.appendChild(box);
}

function renderNotFound(root, reason='Bike not found'){
  const box = document.createElement('div');
  box.className = 'alert';
  box.innerHTML = `
    <h2 style="margin:4px 0 6px 0;">${escapeHTML(reason)}</h2>
    <p>Try going back to the <a href="#/">homepage</a>. If you scanned a QR code, please ensure the link includes the correct bike id.</p>
  `;
  root.appendChild(box);
}

function renderBike(root, id, forceFound=false){
  const bike = STATE.bikes.find(b => b.id === id);
  if(!bike){ renderNotFound(root); return; }

  const isFoundMode = forceFound || (new URLSearchParams((location.hash.split('?')[1]||''))).get('found') === '1';

  const el = document.createElement('div');
  el.innerHTML = `
    ${isFoundMode ? `
      <div class="found-banner" role="status" aria-live="polite">
        🚨 This bicycle misses Gal. You can be today’s hero.
      </div>
    ` : ``}

    <section class="detail" aria-labelledby="bike-title">
      <div>
        <h1 id="bike-title" style="margin:0 0 10px 0;">${escapeHTML(bike.name)}</h1>
        <div class="gallery">
          ${((bike.photos||[]).slice(0,4)).map((src,i)=>`
            <img src="${src}" alt="${escapeHTML(bike.name)} photo ${i+1}" loading="lazy" onerror="this.src='${STATE.dataURLPlaceholder}'" tabindex="0" />
          `).join('')}
        </div>

        <div class="meta" style="margin-top:12px">
          <ul class="kv">
            <li><div class="k">Color</div><div>${escapeHTML(bike.color||'-')}</div></li>
            <li><div class="k">Serial</div><div>
              <button class="serial-mask" id="reveal-serial" aria-label="Reveal serial number">${escapeHTML(bike.serial_masked||'masked')}</button>
            </div></li>
            <li><div class="k">Proof notes</div><div>${escapeHTML(bike.proof?.notes||'-')}</div></li>
            <li><div class="k">Proof doc</div><div>
              <img src="${bike.proof?.doc_image || ''}" alt="Redacted receipt or proof of ownership" loading="lazy" onerror="this.src='${STATE.dataURLPlaceholder}'" style="width:100%;max-width:360px;border-radius:10px" />
            </div></li>
            <li><div class="k">Characteristics</div><div>
              <ul class="bullets">
                ${(bike.characteristics||[]).map(c=>`<li>${escapeHTML(c)}</li>`).join('')}
              </ul>
            </div></li>
          </ul>
        </div>
      </div>

      <div>
        ${isFoundMode ? renderFoundPanelHTML(bike) : renderOwnerPanelHTML(bike)}
      </div>
    </section>

    ${!isFoundMode ? `
      <div class="alert" role="note">
        Tip: If someone scans your QR, their link opens <strong>Found Mode</strong> automatically: <code>#/b/${encodeURIComponent(bike.id)}?found=1</code>
      </div>
    ` : ``}
  `;
  root.appendChild(el);

  // Serial reveal
  const reveal = $('#reveal-serial', el);
  if(reveal){
    reveal.addEventListener('click', ()=>{
      reveal.classList.add('revealed');
      reveal.textContent = (bike.serial || bike.serial_masked || '').replace('•','').replace(/•/g,''); // if full serial provided, show it; else just unmask visually
    });
  }

  // Bind found panel interactions
  if(isFoundMode){
    bindFoundActions(el, bike);
    confettiSmall(); // nice-to-have
  } else {
    const foundBtn = $('#go-found', el);
    if(foundBtn) foundBtn.addEventListener('click', ()=>location.hash = `#/b/${encodeURIComponent(bike.id)}?found=1`);
  }
}

function renderOwnerPanelHTML(bike){
  return `
    <div class="meta">
      <h2 style="margin:4px 0 8px 0;">Owner Panel</h2>
      <p class="hint">Share this page, print a QR, or switch to <strong>Found Mode</strong> for big contact buttons.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <button class="button" id="go-found" aria-label="Open Found Mode">Open Found Mode</button>
        <a class="button" href="${qrURLSpec(bike)}" target="_blank" rel="noopener">QR Spec Link</a>
        <a class="button" href="/assets/qr_${encodeURIComponent(bike.id)}.png" download>Download QR label</a>
      </div>
    </div>
  `;
}

function renderFoundPanelHTML(bike){
  const url = canonicalBikeURL(bike.id, true);
  const textBase = encodeURIComponent(`Hi! I found "${bike.name}" (ID: ${bike.id}). Link: ${url}`);
  const waHref = `https://wa.me/${encodeURIComponent((bike.contact?.whatsapp||'').replace(/[^+\d]/g,''))}?text=${textBase}`;
  const smsHref = `sms:${encodeURIComponent((bike.contact?.phone||''))}?&body=${textBase}`;
  const telHref = `tel:${encodeURIComponent((bike.contact?.phone||''))}`;

  return `
    <div class="found-panel">
      <h2 style="margin:4px 0 8px 0;">Found Mode</h2>
      <p class="hint">Big friendly buttons. No small talk required.</p>
      <div class="cta-stack">
        <a class="cta" href="${telHref}" aria-label="Call owner now">📞 Call</a>
        <a class="cta secondary" id="wa-btn" href="${waHref}" aria-label="WhatsApp the owner">💬 WhatsApp</a>
        <a class="cta neutral" id="sms-btn" href="${smsHref}" aria-label="Text the owner">✉️ SMS/Text</a>
        <button class="cta" id="share-location" aria-label="Share your location with the owner">📍 Share Location</button>
      </div>
      <p class="hint" id="geo-hint" style="margin-top:8px"></p>
      <div class="alert" style="margin-top:12px">
        If location access is denied: open your Maps app, drop a pin (long-press), copy the coordinates, and paste them into your message.
      </div>
    </div>
  `;
}

/* ===== Found Mode actions ===== */
function canonicalBikeURL(id, found=false){
  const base = STATE.baseUrl().split('#')[0].replace(/index\.html$/,'');
  // Use hash routes so GH Pages & file:// both work
  return `${base}#/b/${encodeURIComponent(id)}${found?'?found=1':''}`;
}
function qrURLSpec(bike){
  // Example for README spec; placeholder username 'username'
  return `https://<username>.github.io/bikes/#/b/${encodeURIComponent(bike.id)}?found=1&utm_source=qr`;
}

function bindFoundActions(scope, bike){
  const geoBtn = $('#share-location', scope);
  const waBtn = $('#wa-btn', scope);
  const smsBtn = $('#sms-btn', scope);
  const hint = $('#geo-hint', scope);

  let coordsText = '';
  geoBtn?.addEventListener('click', ()=>{
    if(!navigator.geolocation){
      hint.textContent = 'Geolocation not supported. You can still share a dropped pin from your Maps app.';
      return;
    }
    geoBtn.disabled = true;
    hint.textContent = 'Requesting location…';
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const {latitude, longitude} = pos.coords;
        coordsText = `\nLocation: ${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        // Update prefilled texts
        const url = canonicalBikeURL(bike.id, true);
        const baseMsg = `Hi! I found "${bike.name}" (ID: ${bike.id}). Link: ${url}${coordsText}`;
        const encoded = encodeURIComponent(baseMsg);
        if(waBtn) waBtn.href = `https://wa.me/${encodeURIComponent((bike.contact?.whatsapp||'').replace(/[^+\d]/g,''))}?text=${encoded}`;
        if(smsBtn) smsBtn.href = `sms:${encodeURIComponent((bike.contact?.phone||''))}?&body=${encoded}`;

        // Open Google Maps in new tab with the coords
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        window.open(mapsUrl, '_blank', 'noopener');

        hint.textContent = `Location attached. If needed, also share the pin: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        geoBtn.disabled = false;
      },
      err=>{
        geoBtn.disabled = false;
        hint.textContent = 'Couldn’t get location. Open your Maps app, long-press to drop a pin, then send the coords.';
      },
      {enableHighAccuracy:true, timeout:10000, maximumAge:0}
    );
  });
}

/* ===== Confetti (lightweight, no deps) ===== */
function confettiSmall(){
  const n = 18;
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    Object.assign(s.style,{
      position:'fixed',left:(Math.random()*100)+'vw',top:'-10px',width:'8px',height:'8px',
      background: i%2? 'var(--accent)':'var(--accent-2)', borderRadius:'2px', zIndex:9999,
      transform:`rotate(${Math.random()*360}deg)`,
      pointerEvents:'none', transition:'transform 1.2s linear, top 1.2s linear, opacity 1.2s linear'
    });
    document.body.appendChild(s);
    requestAnimationFrame(()=>{
      s.style.top = (80+Math.random()*20)+'vh';
      s.style.transform = `translateY(0) rotate(${Math.random()*720}deg)`;
      s.style.opacity = '0';
    });
    setTimeout(()=>s.remove(), 1400);
  }
}

/* ===== Helpers ===== */
function escapeHTML(str=''){
  return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}
