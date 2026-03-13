
export async function onRequestPost({ request, env }) {
  try {
    const form = await request.formData(); const file=form.get('file'); const to=form.get('to');
    const subject=form.get('subject')||'Quotation'; const from=form.get('from'); const replyTo=form.get('replyTo');
    if(!file) return new Response('file is required', { status: 400 }); if(!to) return new Response('to is required', { status: 400 });
    const sgKey=env.SENDGRID_API_KEY; if(!sgKey) return new Response('Missing SENDGRID_API_KEY', { status: 500 });

    const ab = await file.arrayBuffer(); const pdfB64 = bytesToBase64(ab);
    const FROM_EMAIL = from || 'lukshikan@rubyia.lk'; const REPLY_TO = replyTo || 'lukshikan@rubyia.lk';
    const fname = (file.name||'quotation').toLowerCase().endsWith('.pdf')? file.name : (file.name||'quotation')+'.pdf';

    const body = { personalizations: [{ to: [{ email: to }] }], from: { email: FROM_EMAIL }, reply_to: { email: REPLY_TO }, subject, content: [{ type:'text/plain', value:'See attached quotation.' }], attachments: [{ content: pdfB64, filename: fname, type:'application/pdf', disposition:'attachment' }] };
    const mail = await fetch('https://api.sendgrid.com/v3/mail/send', { method:'POST', headers:{ 'Authorization': `Bearer ${sgKey}`, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    if(mail.status>=200 && mail.status<300) return new Response('OK', { status:200 }); return new Response(await mail.text()||'SendGrid error', { status: mail.status });
  } catch(e){ return new Response(String(e), { status:500 }); }
}
function bytesToBase64(buf){ const u=new Uint8Array(buf); let s=''; for(let i=0;i<u.byteLength;i++) s+=String.fromCharCode(u[i]); return btoa(s); }
