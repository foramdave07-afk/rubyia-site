
export async function onRequestPost({ request, env }) {
  try {
    const { to, from, subject, html, filename } = await request.json();
    const apiKey = env.SENDGRID_API_KEY;
    if(!apiKey) return new Response(JSON.stringify({error:'Missing SENDGRID_API_KEY'}), {status:500});

    const enc = btoa(unescape(encodeURIComponent(html)));

    const body = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [{ type: 'text/html', value: html }],
      attachments: [
        {
          content: enc,
          filename: filename || 'quotation.html',
          type: 'text/html',
          disposition: 'attachment'
        }
      ]
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if(resp.status >= 200 && resp.status < 300){
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    } else {
      const t = await resp.text();
      return new Response(t || 'SendGrid error', { status: resp.status });
    }
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
}
