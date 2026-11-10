(() => {
  'use strict';
  const site = window.POONAM_CONFIG || {};
  const starter = window.POONAM_CATALOG || { meta: {}, products: [] };
  let products = starter.products || [];
  let activeCategory = 'all';
  let searchText = '';
  let sorting = 'featured';
  const PAGE_SIZE = 12;
  let visibleLimit = PAGE_SIZE;
  let lastFocused = null;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const currency = n => '₹' + Number(n).toLocaleString('en-IN');
  const label = {all:'All locks',smart:'Smart locks',rim:'Rim locks',mortise:'Mortise locks',padlock:'Padlocks',knob:'Knob locks'};
  const fallback = categoryOrProduct => {
    if(typeof categoryOrProduct === 'object') return `assets/product-fallbacks/${categoryOrProduct.id}.svg`;
    return `assets/${categoryOrProduct}-fallback.svg`;
  };
  const safe = value => String(value == null ? '' : value).replace(/[&<>"']/g, chr => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[chr]));
  const iconPaths = {
    'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'wrench':'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.3-3.3a6 6 0 0 1-8 8l-7.1 7.1a2.1 2.1 0 0 1-3-3L10 11a6 6 0 0 1 8-8z"/>',
    'message-circle':'<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    'lock-keyhole':'<rect width="14" height="11" x="5" y="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="1"/>',
    'search':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'search-x':'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M9 9l4 4m0-4-4 4"/>',
    'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'check':'<path d="m4 12 5 5L20 6"/>',
    'hammer':'<path d="m15 12-8.4 8.4a2 2 0 0 1-2.8-2.8L12 9m3-6 6 6-3 3-6-6z"/><path d="m6 6 12 12"/>',
    'refresh-cw':'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.8 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.2-3"/>',
    'messages-square':'<path d="M10 7h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4l-4 3v-3h-2a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M15 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/>'
  };
  function icon(name) { return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.check}</svg>`; }
  function applyIcons(){ $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
  function imageTag(product, extraClass='', loading='lazy') {
    // Display a local illustration immediately. Replace it with official media only once loaded.
    const image = product.image || '';
    return `<img class="${extraClass}" src="${safe(fallback(product))}" alt="${safe(product.name)} product" loading="${loading}" data-remote="${safe(image)}" data-fallback="${safe(fallback(product))}"/>`;
  }
  function bindImageFallbacks(root=document){
    $$('img[data-fallback]',root).forEach(img => {
      const remote=img.dataset.remote;
      if(!remote)return;
      const photo=new Image();
      photo.onload=()=>{if(img.isConnected)img.src=remote;};
      photo.onerror=()=>{
        const optimized=new Image();
        const proxied='https://shop.godrejsecure.com/_next/image?url='+encodeURIComponent(remote)+'&w=1920&q=85';
        optimized.onload=()=>{if(img.isConnected)img.src=proxied;};
        optimized.src=proxied;
      };
      photo.src=remote;
    });
  }
  const categoryDescriptions = {
    smart:['DIGITAL ACCESS','Smart locks','Intelligent everyday access','NEOPRIME'],
    rim:['MAIN DOOR SECURITY','Rim locks','Solid protection for entrances','TRIBOLT'],
    mortise:['FINISHING DETAILS','Mortise locks','Security meets fine design','BM02BRASS'],
    padlock:['EVERYDAY ESSENTIALS','Padlocks','Reliable for every utility','NAVTAL8'],
    knob:['INTERIOR HARDWARE','Knob locks','Small details, secure spaces','KNOB5835']
  };
  function renderCategories(){
    $('#categoryCards').innerHTML = Object.keys(categoryDescriptions).map(cat => {
      const [upper,title,desc,featured] = categoryDescriptions[cat];
      const product = products.find(p=>p.id===featured) || products.find(p=>p.category===cat);
      if (!product) return '';
      return `<button class="category-card" type="button" data-select-category="${cat}"><div class="category-image">${imageTag(product)}<span class="category-chip">${upper}</span></div><div class="category-bottom"><div><strong>${title}</strong><small>${desc} · ${products.filter(p=>p.category===cat).length} styles</small></div><span class="arrow-circle" aria-hidden="true">↗</span></div></button>`;
    }).join('');
    bindImageFallbacks($('#categoryCards'));
  }
  function renderFilters(){
    $('#filterButtons').innerHTML = Object.entries(label).map(([id,name]) => `<button type="button" class="filter-btn ${activeCategory===id?'active':''}" aria-pressed="${activeCategory===id}" data-filter="${id}">${name}</button>`).join('');
  }
  function filteredProducts(){
    let items = products.filter(p=>(activeCategory==='all'||p.category===activeCategory) && [p.name,p.description,p.finish,p.category,...p.features].join(' ').toLowerCase().includes(searchText));
    if(sorting==='priceAsc') items.sort((a,b)=>a.price-b.price);
    if(sorting==='priceDesc') items.sort((a,b)=>b.price-a.price);
    if(sorting==='name') items.sort((a,b)=>a.name.localeCompare(b.name));
    return items;
  }
  function renderProducts(){
    renderFilters();
    const all = filteredProducts();
    const list = all.slice(0, visibleLimit);
    $('#resultsCount').textContent = `Showing ${list.length} of ${all.length} ${all.length===1?'product':'products'}`;
    const loadMore = $('#loadMore');
    loadMore.hidden = list.length >= all.length;
    if (all.length > list.length) loadMore.textContent = `Load more locks  ·  ${all.length-list.length} remaining  ↗`;
    $('#productGrid').innerHTML = list.map(p=>`<article class="product-card"><div class="product-picture">${p.tag?`<span class="product-tag">${safe(p.tag)}</span>`:''}${imageTag(p)}<button class="product-quick" type="button" title="View ${safe(p.name)} details" aria-label="View ${safe(p.name)} details" data-view="${safe(p.id)}">${icon('eye')}</button></div><div class="product-info"><span class="product-category">GODREJ · ${safe(label[p.category])}</span><h3>${safe(p.name)}</h3><p class="product-description">${safe(p.description)}</p><div class="product-pricing"><strong class="price-now">${currency(p.price)}</strong><span class="price-old">${currency(p.mrp)}</span></div><div class="product-actions"><button class="product-enquire" type="button" data-enquire-product="${safe(p.id)}">Enquire now ↗</button><button class="product-details" type="button" aria-label="More about ${safe(p.name)}" title="Product details" data-view="${safe(p.id)}">→</button></div></div></article>`).join('');
    $('#emptyState').hidden = all.length !== 0;
    bindImageFallbacks($('#productGrid'));
  }
  function chooseCategory(category){
    activeCategory = category;
    visibleLimit = PAGE_SIZE;
    renderProducts();
    $('#products').scrollIntoView({behavior:'smooth'});
  }
  function setModalOpen(el,open){
    el.classList.toggle('open',open);
    el.setAttribute('aria-hidden',String(!open));
    document.body.classList.toggle('modal-open',$$('.modal-overlay.open').length>0);
    if(open){lastFocused=document.activeElement; setTimeout(()=>{const f=el.querySelector('.modal-close');if(f)f.focus();},0);}
    else if(lastFocused?.focus)lastFocused.focus();
  }
  function closeModal(el){setModalOpen(el,false)}
  function viewProduct(id){
    const p=products.find(item=>item.id===id);if(!p)return;
    const modal=$('#productModal');
    $('#productModalContent').innerHTML=`<div class="modal-product-grid"><div class="modal-product-image">${imageTag(p,'','eager')}</div><div class="modal-product-info"><span class="section-kicker">GODREJ / ${safe(label[p.category])}</span><h2 id="modalProductTitle">${safe(p.name)}</h2><p>${safe(p.description)}</p><div class="product-pricing"><strong class="price-now">${currency(p.price)}</strong><span class="price-old">${currency(p.mrp)}</span></div><div class="feature-list">${p.features.map(f=>`<div>${icon('check')}${safe(f)}</div>`).join('')}</div><div class="spec-row"><span>Finish</span><strong>${safe(p.finish)}</strong></div><div class="spec-row"><span>Warranty</span><strong>${safe(p.warranty)}</strong></div><div class="modal-actions"><button class="btn btn-primary" data-enquire-product="${safe(p.id)}">Enquire about this lock ↗</button><a class="modal-official" href="${safe(p.officialUrl)}" target="_blank" rel="noopener noreferrer">${p.linkType==='category'?'Browse range at Godrej ↗':'View at Godrej ↗'}</a></div><p class="modal-disclaimer">Indicative online reference price, not a live quote. Final price, installation charges, stock and suitability must be confirmed.</p></div></div>`;
    bindImageFallbacks($('#productModalContent'));setModalOpen(modal,true);
  }
  function openEnquiry(service='Sales enquiry',product=''){
    closeModal($('#productModal'));
    const form=$('#enquiryForm');form.reset();
    $('#enquiryService').value=Array.from($('#enquiryService').options).some(o=>o.value===service)?service:'General enquiry';
    $('#enquiryProduct').value=product;
    $('#enquiryResult').hidden=true;form.hidden=false;
    setModalOpen($('#enquiryModal'),true);
  }
  let toastTimeout;
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3200);}
  function preparedText(form){
    const formData = new FormData(form);
    const name=String(formData.get('name')||'').trim();
    const phone=String(formData.get('phone')||'').trim();
    const service=String(formData.get('service')||'').trim();
    const prod=String(formData.get('product')||'').trim();
    const msg=String(formData.get('message')||'').trim();
    return `Hello Poonam Enterprises,\n\nI would like assistance with: ${service}.\n\nName: ${name}\nPhone: ${phone}${prod?'\nProduct: '+prod:''}${msg?'\nDetails: '+msg:''}\n\nPlease share the details and availability. Thank you.`;
  }
  function configContact(){
    const contacts=[];
    if(site.phone)contacts.push(`<a href="tel:${safe(site.phone.replace(/[^\d+]/g,''))}">${safe(site.phone)}</a>`);
    if(site.email)contacts.push(`<a href="mailto:${safe(site.email)}">${safe(site.email)}</a>`);
    if(site.address)contacts.push(site.mapsUrl?`<a href="${safe(site.mapsUrl)}" target="_blank" rel="noopener noreferrer">${safe(site.address)} ↗</a>`:`<span>${safe(site.address)}</span>`);
    $('#contactDetails').innerHTML=contacts.length?contacts.join('<span class="contact-separator"> · </span>'):'Business contact details can be added before launch.';
    $('#footerContact').innerHTML=site.phone?`<a href="tel:${safe(site.phone.replace(/[^\d+]/g,''))}">${safe(site.phone)}</a>`:'';
  }
  function init(){
    $('#year').textContent=String(new Date().getFullYear());
    applyIcons();renderCategories();renderProducts();configContact();
    $('#catalogCount').textContent = `${products.length}+ styles`;
    $('#categoryCount').textContent = `${Object.keys(categoryDescriptions).length} collections`;
    const hero=products.find(p=>p.id==='GSLD1');
    if(hero?.image){const el=$('#heroProductImage');el.dataset.remote=hero.image;el.dataset.fallback=fallback('smart');bindImageFallbacks(el.parentElement);}
    $('#productSearch').addEventListener('input',e=>{searchText=e.target.value.trim().toLowerCase();visibleLimit=PAGE_SIZE;renderProducts()});
    $('#sortSelect').addEventListener('change',e=>{sorting=e.target.value;visibleLimit=PAGE_SIZE;renderProducts()});
    $('#resetFilters').addEventListener('click',()=>{activeCategory='all';visibleLimit=PAGE_SIZE;searchText='';$('#productSearch').value='';renderProducts()});
    $('#loadMore').addEventListener('click',()=>{visibleLimit+=PAGE_SIZE;renderProducts();});
    document.addEventListener('click',event=>{
      const filter=event.target.closest('[data-filter]');if(filter){activeCategory=filter.dataset.filter;visibleLimit=PAGE_SIZE;renderProducts();return;}
      const cat=event.target.closest('[data-select-category],[data-category]');if(cat){chooseCategory(cat.dataset.selectCategory||cat.dataset.category);return;}
      const view=event.target.closest('[data-view]');if(view){viewProduct(view.dataset.view);return;}
      const productEnq=event.target.closest('[data-enquire-product]');if(productEnq){const p=products.find(p=>p.id===productEnq.dataset.enquireProduct);openEnquiry('Sales enquiry',p?.name||'');return;}
      const enq=event.target.closest('.open-enquiry');if(enq){openEnquiry(enq.dataset.service||'General enquiry');return;}
      const close=event.target.closest('[data-close-modal]');if(close){closeModal(close.closest('.modal-overlay'));return;}
      const overlay=event.target.closest('.modal-overlay');if(overlay===event.target){closeModal(overlay);return;}
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal-overlay.open').forEach(closeModal);});
    const menu=$('#menuBtn');menu.addEventListener('click',()=>{let isOpen=$('#nav').classList.toggle('mobile-open');menu.setAttribute('aria-expanded',String(isOpen));menu.setAttribute('aria-label',isOpen?'Close menu':'Open menu');});
    $$('.nav-link').forEach(link=>link.addEventListener('click',()=>{$('#nav').classList.remove('mobile-open');menu.setAttribute('aria-expanded','false');}));
    $('#enquiryForm').addEventListener('submit',event=>{
      event.preventDefault();
      const txt=preparedText(event.target);
      $('#preparedMessage').value=txt;
      event.target.hidden=true;
      $('#enquiryResult').hidden=false;
      const whats=String(site.whatsapp||'').replace(/\D/g,'');
      const link=$('#sendWhatsapp');
      if(whats){link.hidden=false;link.href=`https://wa.me/${whats}?text=${encodeURIComponent(txt)}`;$('#resultHelp').textContent='Review the message below, then send it on WhatsApp or copy it.';}
      else{link.hidden=true;$('#resultHelp').textContent='This is a prepared message, not a submitted enquiry. Add the business WhatsApp number in config.js to enable direct sending.';}
    });
    $('#editEnquiry').addEventListener('click',()=>{$('#enquiryForm').hidden=false;$('#enquiryResult').hidden=true;});
    $('#copyEnquiry').addEventListener('click',async()=>{
      const text=$('#preparedMessage').value;
      try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);}else{const field=$('#preparedMessage');field.focus();field.select();if(!document.execCommand('copy'))throw Error('copy failed');}toast('Enquiry message copied!');}
      catch{const field=$('#preparedMessage');field.focus();field.select();toast('Select and copy your enquiry message.');}
    });
    // A first-party, free /api/products endpoint is included for Vercel hosting.
    // Local files and static hosts use catalog-data.js as a full offline fallback.
    if(location.protocol.startsWith('http')){
      fetch('/api/products',{headers:{'Accept':'application/json'}}).then(r=>{if(!r.ok)throw Error('Static host');return r.json()}).then(data=>{
        if(Array.isArray(data.products)&&data.products.length){products=data.products;renderCategories();renderProducts();$('#catalogCount').textContent=`${products.length}+ styles`;}
      }).catch(()=>{});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
