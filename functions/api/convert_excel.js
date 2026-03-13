
export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData(); const file = form.get('file');
    if(!file) return new Response('file is required', { status: 400 });
    const apiKey = env.API2PDF_KEY; if(!apiKey) return new Response('Missing API2PDF_KEY', { status: 500 });

    const ab = await file.arrayBuffer(); const name=(file.name||'').toLowerCase();
    let mime = file.type || '';
    if(!mime){ if(name.endsWith('.xlsm')) mime='application/vnd.ms-excel.sheet.macroEnabled.12';
               else if(name.endsWith('.xlsx')) mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
               else if(name.endsWith('.xls')) mime='application/vnd.ms-excel'; }
    const dataUrl = `data:${mime||'application/octet-stream'};base64,${bytesToBase64(ab)}`;

    const r = await fetch('https://v2.api2pdf.com/libreoffice/any-to-pdf', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify({ file: dataUrl, fileName: file.name || 'quotation.xlsx', inline: false }) });
    if(!r.ok) return new Response(await r.text(), { status: r.status });
    const j = await r.json(); const pdfResp = await fetch(j.fileUrl); const pdfBuf = await pdfResp.arrayBuffer();
    return new Response(pdfBuf, { headers: { 'Content-Type':'application/pdf', 'Content-Disposition': `attachment; filename="${(file.name||'quotation')}.pdf"` }});
  } catch(e){ return new Response(String(e), { status: 500 }); }
}
function bytesToBase64(buf){ const u=new Uint8Array(buf); let s=''; for(let i=0;i<u.byteLength;i++) s+=String.fromCharCode(u[i]); return btoa(s); }
