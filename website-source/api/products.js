/** Free, self-hosted catalog API for Vercel. NOT an official Godrej API.
 * GET /api/products?category=smart&q=neo
 */
const fs = require('node:fs');
const path = require('node:path');
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') { res.statusCode = 405; return res.end(JSON.stringify({error:'Method not allowed'})); }
  try {
    const catalog = JSON.parse(fs.readFileSync(path.join(process.cwd(),'data','products.json'),'utf8'));
    const cat = String(req.query?.category || '').toLowerCase();
    const q = String(req.query?.q || '').trim().toLowerCase();
    let products = catalog.products;
    if (cat && cat !== 'all') products = products.filter(p=>p.category === cat);
    if (q) products = products.filter(p=>[p.name,p.description,p.finish,...p.features].join(' ').toLowerCase().includes(q));
    res.statusCode = 200;
    return res.end(JSON.stringify({meta:catalog.meta,count:products.length,products}));
  } catch(e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({error:'Catalog temporarily unavailable'}));
  }
};
