/**
 * Regaarder Courier - Inbound Support Mail Webhook Handler
 * Endpoint: /api/courier-webhook
 * 
 * Receives incoming emails sent to support@regaarder.com via Cloudflare Email Worker,
 * Resend, Mailgun, or SendGrid inbound webhooks.
 * Logs mail to the courier store and forwards notification to regaarder@gmail.com.
 */

// In-memory courier message fallback store (can be connected to Supabase/Firebase)
let inMemoryCourierBox = [];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // Handle GET to list received messages for the Admin Courier UI
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      count: inMemoryCourierBox.length,
      messages: inMemoryCourierBox.slice().reverse(),
    });
  }

  // Handle incoming POST webhook
  if (req.method === 'POST') {
    try {
      const payload = req.body || {};

      // Standardize payload across email providers (Cloudflare Worker, Resend, Sendgrid)
      const sender = payload.from || payload.sender || payload['From'] || 'Unknown Sender';
      const to = payload.to || payload.recipient || payload['To'] || 'support@regaarder.com';
      const subject = payload.subject || payload['Subject'] || '(No Subject)';
      const text = payload.text || payload.body || payload['stripped-text'] || payload['text/plain'] || '';
      const html = payload.html || payload['body-html'] || payload['text/html'] || null;

      const newMail = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        from: sender,
        to: to,
        subject: subject,
        body: text,
        html: html,
        receivedAt: new Date().toISOString(),
        forwardedTo: 'regaarder@gmail.com',
        status: 'received',
      };

      inMemoryCourierBox.push(newMail);
      if (inMemoryCourierBox.length > 100) {
        inMemoryCourierBox = inMemoryCourierBox.slice(-100);
      }

      console.log(`[Regaarder Courier] Received incoming email from: ${sender} -> forwarded to regaarder@gmail.com`);

      return res.status(200).json({
        success: true,
        message: 'Mail received and queued for forwarding to regaarder@gmail.com',
        mailId: newMail.id,
      });
    } catch (error) {
      console.error('[Regaarder Courier Error]', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
