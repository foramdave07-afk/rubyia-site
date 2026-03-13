
const $ = (id)=>document.getElementById(id);
const elGrid = $('grid');
const elMore = $('btn_more');
const elSelCount = $('sel_count');
let DATA = [];          // full data
let VIEW = [];          // filtered & sorted list
let CURSOR = 0;         // current offset for pagination
const PAGE_SIZE = 60;   // items per page
let SELECT_MODE = false;
let SELECTED = new Map(); // key -> record

function loadCart(){ try{ return JSON.parse(localStorage.getItem('enquiry_cart')||'[]'); }catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem('enquiry_cart', JSON.stringify(cart)); }
function addOne(rec){ const cart = loadCart(); cart.push(rec); saveCart(cart); }
function addMany(recs){ const cart = loadCart(); recs.forEach(r=>cart.push(r)); saveCart(cart); }

async function loadData(){ if(DATA.length) return DATA; const res = await fetch('/data/items.json'); DATA = await res.json(); return DATA; }
function uniqueSorted(arr, key){ const s = new Set(); arr.forEach(o=>{ const v=(o[key]||'').trim(); if(v) s.add(v); }); return Array.from(s).sort((a,b)=>a.localeCompare(b)); }
function populateFilters(){ const groups = uniqueSorted(DATA, 'group'); const brands = uniqueSorted(DATA, 'brand'); const countries = uniqueSorted(DATA, 'country'); const g=$('f_group'), b=$('f_brand'), c=$('f_country'); groups.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; g.appendChild(o); }); brands.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; b.appendChild(o); }); countries.forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; c.appendChild(o); }); }
function matchesFilters(rec){ const q = $('q').value.trim().toLowerCase(); const g = $('f_group').value; const b=$('f_brand').value; const c=$('f_country').value; if(g && (rec.group||'')!==g) return false; if(b && (rec.brand||'')!==b) return false; if(c && (rec.country||'')!==c) return false; if(!q) return true; const hay=(rec.name+' '+(rec.alias||'')+' '+(rec.description||'')+' '+(rec.material||'')+' '+(rec.schedule||'')).toLowerCase(); return hay.includes(q); }
function sortView(list){ const by = $('f_sort').value; const key = by==='name' ? 'name' : by; return list.sort((a,b)=> (a[key]||'').localeCompare(b[key]||'')); }
function rebuildView(){ VIEW = sortView(DATA.filter(matchesFilters)); CURSOR = 0; elGrid.innerHTML = ''; SELECTED.clear(); updateSelectedCount(); renderMore(); }
function cardHTML(r, idx){ const chips = []; if(r.alias) chips.push('Code: '+r.alias); if(r.unit) chips.push('Unit: '+r.unit); if(r.brand) chips.push(r.brand); if(r.country) chips.push(r.country); if(r.material) chips.push(r.material); const checkbox = SELECT_MODE ? '<input type="checkbox" class="pick" data-idx="'+idx+'"> ' : ''; return ('<div class="card">'+'<h3>'+checkbox+ (r.name||'') +'</h3>'+'<div class="meta">'+ chips.map(t=>'<span class="badge">'+t+'</span>').join('') +'</div>'+(r.description? '<div style="font-size:.92rem">'+r.description+'</div>' : '')+'<div class="buttonbar">'+'<button class="btn add" data-idx="'+idx+'">Add to Enquiry</button>'+'</div>'+'</div>'); }
function renderMore(){ const slice = VIEW.slice(CURSOR, CURSOR+PAGE_SIZE); const frag = document.createDocumentFragment(); slice.forEach((r,i)=>{ const idx = CURSOR + i; const div = document.createElement('div'); div.innerHTML = cardHTML(r, idx); frag.appendChild(div.firstElementChild); }); elGrid.appendChild(frag); CURSOR += slice.length; elMore.style.display = CURSOR < VIEW.length ? 'inline-flex' : 'none'; }
function toggleSelectMode(on){ SELECT_MODE = !!on; rebuildView(); }
function updateSelectedCount(){ elSelCount.textContent = String(SELECTED.size); $('btn_add_selected').disabled = SELECTED.size===0; }

document.addEventListener('DOMContentLoaded', async ()=>{ await loadData(); populateFilters(); rebuildView(); $('q').addEventListener('input', rebuildView); $('f_group').addEventListener('change', rebuildView); $('f_brand').addEventListener('change', rebuildView); $('f_country').addEventListener('change', rebuildView); $('f_sort').addEventListener('change', rebuildView); elMore.addEventListener('click', renderMore); $('toggle_select').addEventListener('change', (e)=> toggleSelectMode(e.target.checked)); elGrid.addEventListener('click', (e)=>{ const t = e.target; if(t.classList.contains('add')){ const idx = Number(t.dataset.idx); addOne(VIEW[idx]); t.textContent = 'Added'; setTimeout(()=> t.textContent='Add to Enquiry', 900); } if(t.classList.contains('pick')){ const idx = Number(t.dataset.idx); if(t.checked){ SELECTED.set(idx, VIEW[idx]); } else { SELECTED.delete(idx); } updateSelectedCount(); } }); elGrid.addEventListener('change', (e)=>{ const t = e.target; if(t.classList.contains('pick')){ const idx = Number(t.dataset.idx); if(t.checked){ SELECTED.set(idx, VIEW[idx]); } else { SELECTED.delete(idx); } updateSelectedCount(); } }); $('btn_add_selected').addEventListener('click', ()=>{ addMany(Array.from(SELECTED.values())); SELECTED.clear(); updateSelectedCount(); alert('Selected items added to Enquiry'); }); });
