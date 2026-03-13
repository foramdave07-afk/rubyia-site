
export async function onRequestPost({ request, env }) {
  try {
    const { to, subject, html, pdfBase64, filename, from, replyTo } = await request.json();
    const apiKey = env.SENDGRID_API_KEY;
    if (!apiKey) return new Response('Missing SENDGRID_API_KEY', { status: 500 });

    const FROM_EMAIL = from || 'lukshikan@rubyia.lk';
    const REPLY_TO   = replyTo || 'lukshikan@rubyia.lk';

    const attachments = [];
    if (pdfBase64) {
      attachments.push({ content: pdfBase64, filename: filename || 'quotation.pdf', type: 'application/pdf', disposition: 'attachment' });
    } else if (html) {
      const enc = btoa(unescape(encodeURIComponent(html)));
      attachments.push({ content: enc, filename: filename || 'quotation.html', type: 'text/html', disposition: 'attachment' });
    }

    const body = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM_EMAIL },
      reply_to: { email: REPLY_TO },
      subject,
      content: [{ type: 'text/plain', value: 'See attached quotation.' }],
      attachments
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (resp.status >= 200 && resp.status < 300) return new Response('OK', { status: 200 });
    return new Response(await resp.text() || 'SendGrid error', { status: resp.status });
  } catch (e) { return new Response(String(e), { status: 500 }); }
}
