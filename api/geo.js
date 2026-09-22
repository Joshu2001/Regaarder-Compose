export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Content-Type', 'application/json');

  // Check standard CDN / hosting headers for country detection
  const headers = req.headers || {};
  const countryHeader =
    headers['x-vercel-ip-country'] ||
    headers['cf-ipcountry'] ||
    headers['x-country-code'] ||
    headers['cloudfront-viewer-country'] ||
    headers['x-real-ip-country'] ||
    null;

  const rawCountry = Array.isArray(countryHeader) ? countryHeader[0] : countryHeader;
  const country = rawCountry && typeof rawCountry === 'string' && rawCountry.trim().length === 2
    ? rawCountry.trim().toUpperCase()
    : null;

  return res.status(200).json({
    ok: true,
    country,
  });
}
