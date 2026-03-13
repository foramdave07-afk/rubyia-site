
function showStatus(msg, ok){
  const el = document.getElementById('status');
  el.textContent = msg; el.classList.remove('hidden');
  el.style.borderColor = ok ? '#10B981' : '#ef4444';
}

const form = document.getElementById('excelSendForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const res = await fetch('/api/convert_excel_and_send', { method:'POST', body: fd });
  if(res.ok){ showStatus('Email sent successfully.', true); }
  else { showStatus('Failed: '+ await res.text(), false); }
});

const btn = document.getElementById('btn_download_pdf');
btn.addEventListener('click', async ()=>{
  const f = document.getElementById('xf');
  if(!f.files.length){ alert('Choose an Excel file first.'); return; }
  const fd = new FormData(); fd.append('file', f.files[0]);
  const res = await fetch('/api/convert_excel', { method:'POST', body: fd });
  if(!res.ok){ showStatus('Convert failed: '+await res.text(), false); return; }
  const blob = await res.blob();
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (f.files[0].name || 'quotation') + '.pdf'; a.click();
});
