
function showStatus(msg, ok){ const el=document.getElementById('status'); el.textContent=msg; el.style.display='block'; el.style.borderColor= ok? '#10B981':'#ef4444'; }

const form=document.getElementById('excelSendForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd=new FormData(form);
  const file = document.getElementById('xf').files[0];
  if(!file){ alert('Choose a file'); return; }
  const lower=(file.name||'').toLowerCase();
  let endpoint='/api/convert_excel_and_send';
  if(lower.endsWith('.pdf')) endpoint='/api/pdf_passthrough_and_send';
  const res = await fetch(endpoint, { method:'POST', body:fd });
  if(res.ok) showStatus('Email sent.', true); else showStatus('Failed: '+await res.text(), false);
});

document.getElementById('btn_download_pdf').addEventListener('click', async ()=>{
  const f=document.getElementById('xf'); if(!f.files.length) { alert('Choose a file'); return; }
  const file=f.files[0]; const lower=(file.name||'').toLowerCase();
  if(lower.endsWith('.pdf')){ // download original
    const a=document.createElement('a'); a.href=URL.createObjectURL(file); a.download=file.name; a.click(); return;
  }
  const fd=new FormData(); fd.append('file', file);
  const res=await fetch('/api/convert_excel', { method:'POST', body:fd });
  if(!res.ok){ showStatus('Convert failed: '+await res.text(), false); return; }
  const blob=await res.blob(); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=(file.name||'quotation')+'.pdf'; a.click();
});
