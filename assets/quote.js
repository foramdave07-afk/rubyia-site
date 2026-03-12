
let DATA = [];
const VAT_PCT = 18; // locked
const money = (v, cur) => { const n=Number(v||0); const s=n.toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2}); return cur? `${cur} ${s}`: s; };
async function loadData(){ if(DATA.length) return DATA; const res=await fetch('/data/items.json'); DATA=await res.json(); return DATA; }
function loadCart(){ try{ return JSON.parse(localStorage.getItem('enquiry_cart')||'[]'); }catch(e){ return []; } }
function saveCart(cart){ localStorage.setItem('enquiry_cart', JSON.stringify(cart)); }
function amountInWords(num){ const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']; const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']; function inWords(n){ if(n<20) return a[n]; if(n<100) return b[Math.floor(n/10)] + (n%10? ' '+a[n%10] : ''); if(n<1000) return a[Math.floor(n/100)]+' Hundred'+(n%100? ' and '+inWords(n%100):''); if(n<100000) return inWords(Math.floor(n/1000))+' Thousand'+(n%1000? ' '+inWords(n%1000):''); if(n<10000000) return inWords(Math.floor(n/100000))+' Lakh'+(n%100000? ' '+inWords(n%100000):''); return inWords(Math.floor(n/10000000))+' Crore'+(n%10000000? ' '+inWords(n%10000000):''); }
  const whole=Math.floor(num); const cents=Math.round((num-whole)*100); let s=inWords(whole)+' Only'; if(cents) s=inWords(whole)+' and '+inWords(cents)+' Cents Only'; return s; }
function renderTable(){ const tbody=document.getElementById('tbody'); const currency=document.getElementById('q_currency').value||''; const cart=loadCart(); tbody.innerHTML=''; let subtotal=0; cart.forEach((r,idx)=>{ const qty=Number(r.qty||1); const price=Number(typeof r.price==='number'? r.price : (r.price||0)); const line=qty*price; subtotal+=line; const tr=document.createElement('tr'); tr.innerHTML=`
  <td>${idx+1}</td>
  <td><div><b>${r.name||''}</b>${r.alias? ` <span style='color:#6b7280'>(Code: ${r.alias})</span>`:''}</div><div style='font-size:.85rem;color:#6b7280'>${r.description||''}</div></td>
  <td>${r.country||''}</td>
  <td><input type='text' value='${r.warranty||"1 Year"}' data-idx='${idx}' class='warranty' style='width:110px'></td>
  <td><input type='number' min='1' value='${qty}' data-idx='${idx}' class='qty' style='width:90px'></td>
  <td><input type='number' step='0.01' value='${price||''}' data-idx='${idx}' class='price' style='width:130px'></td>
  <td>${r.unit||''}</td>
  <td class='line' data-line='${idx}'>${money(line, currency)}</td>
  <td class='no-print'><button class='btn rm' data-idx='${idx}'>Remove</button></td>`; tbody.appendChild(tr); });
  const vat = subtotal * (VAT_PCT/100); const withVat = subtotal + vat; const transport = Number(document.getElementById('t_transport').value || 0); const grand = withVat + transport; document.getElementById('t_vatlabel').textContent = String(VAT_PCT); document.getElementById('t_subtotal').textContent = money(subtotal, currency); document.getElementById('t_vat').textContent = money(vat, currency); document.getElementById('t_withvat').textContent = money(withVat, currency); document.getElementById('t_grand').textContent = money(grand, currency); document.getElementById('t_words').textContent=(currency? currency+' ' : '') + amountInWords(Math.round(grand)); }
function syncChanges(e){ const t=e.target; const cart=loadCart(); if(t.classList.contains('qty')){ const i=Number(t.dataset.idx); cart[i].qty=Number(t.value||1);} if(t.classList.contains('price')){ const i=Number(t.dataset.idx); cart[i].price=Number(t.value||0);} if(t.classList.contains('warranty')){ const i=Number(t.dataset.idx); cart[i].warranty=t.value;} saveCart(cart); renderTable(); }
function removeItem(e){ const t=e.target; if(!t.classList.contains('rm')) return; const idx=Number(t.dataset.idx); const cart=loadCart(); cart.splice(idx,1); saveCart(cart); renderTable(); }
async function addItemBySearch(){ const q=(document.getElementById('add_by_search').value||'').toLowerCase(); if(!q) return; const data=await loadData(); const found=data.find(r=> (r.name+' '+(r.alias||'')+' '+(r.description||'')).toLowerCase().includes(q)); if(found){ const cart=loadCart(); cart.push(found); saveCart(cart); renderTable(); } else alert('No matching item found'); }
function initDefaults(){ const today=new Date().toISOString().slice(0,10); document.getElementById('q_date').value=today; const tTransport=document.getElementById('t_transport'); tTransport.value=document.getElementById('q_transport').value||'0'; }
function printPDF(){ window.print(); }
function emailQuote(){ const subject=encodeURIComponent(`Quotation ${document.getElementById('q_number').value||''}`); const currency=document.getElementById('q_currency').value||''; const cart=loadCart(); const lines=cart.map((r,i)=> `${i+1}. ${r.name}${r.alias? ' (Code: '+r.alias+')':''} | Qty: ${r.qty||1} ${r.unit||''} | Price: ${r.price||0}`); const body=encodeURIComponent(`Company: ${document.getElementById('c_company').value}
Date: ${document.getElementById('q_date').value}  Quotation#: ${document.getElementById('q_number').value}
Sales: ${document.getElementById('q_sales').value}  Credit: ${document.getElementById('q_credit').value}
VAT#: ${document.getElementById('q_vatno').value}  VAT%: ${VAT_PCT}

Items:
${lines.join('
')}

Subtotal: ${document.getElementById('t_subtotal').textContent}
VAT: ${document.getElementById('t_vat').textContent}
Total with VAT: ${document.getElementById('t_withvat').textContent}
Transport: ${document.getElementById('t_transport').value}
Grand Total: ${document.getElementById('t_grand').textContent}
Amount in words: ${document.getElementById('t_words').textContent}

Terms:
${document.getElementById('q_terms').value}`); location.href=`mailto:?subject=${subject}&body=${body}`; }
async function emailServerless(){
  const to = prompt('Recipient email (To):'); if(!to) return; const from = prompt('From email (must be verified in provider):'); if(!from) return; const subject = `Quotation ${document.getElementById('q_number').value||''}`;
  const html = document.documentElement.outerHTML;
  const payload = { to, from, subject, html, filename: `quotation-${(document.getElementById('q_number').value||'draft')}.html` };
  const res = await fetch('/api/send_email', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
  if(res.ok){ alert('Email request sent. Check your inbox.'); } else { const t = await res.text(); alert('Email failed: '+t); }
}

document.addEventListener('DOMContentLoaded', async ()=>{ await loadData(); initDefaults(); renderTable(); document.getElementById('tbody').addEventListener('input', syncChanges); document.getElementById('tbody').addEventListener('click', removeItem); document.getElementById('btn_add').addEventListener('click', addItemBySearch); document.getElementById('btn_clear').addEventListener('click', ()=>{ saveCart([]); renderTable(); }); document.getElementById('t_transport').addEventListener('input', renderTable); document.getElementById('q_transport').addEventListener('input', (e)=>{ document.getElementById('t_transport').value=e.target.value; renderTable(); }); document.getElementById('q_currency').addEventListener('input', renderTable); document.getElementById('btn_print').addEventListener('click', printPDF); document.getElementById('btn_email').addEventListener('click', emailQuote); document.getElementById('btn_email_fn').addEventListener('click', emailServerless); });
