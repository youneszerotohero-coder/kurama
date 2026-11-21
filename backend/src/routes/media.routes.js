import { Router } from 'express';
import prisma from '../config/db.js';
import { decodeDataUrl, isDataUrl, storedValue } from '../lib/media.js';

const router = Router();

const models = {
  product: (id) => prisma.product.findUnique({ where: { id }, select: { id: true, image: true, images: true } }),
  category: (id) => prisma.category.findUnique({ where: { id }, select: { id: true, image: true } }),
  brand: (id) => prisma.brand.findUnique({ where: { id }, select: { id: true, image: true } }),
  gamme: (id) => prisma.gamme.findUnique({ where: { id }, select: { id: true, image: true } }),
};

// Small in-memory cache of decoded images (keyed by URL, which includes the content hash)
const cache = new Map();
const MAX_ENTRIES = 300;
const remember = (key, value) => {
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(key, value);
};

router.get('/:type/:id/:key', async (req, res) => {
  const { type, key } = req.params;
  const id = Number(req.params.id);
  const load = models[type];
  if (!load || !Number.isInteger(id) || !/^(main|\d+)$/.test(key)) return res.status(404).end();

  try {
    let entry = cache.get(req.originalUrl);
    if (!entry) {
      const value = storedValue(await load(id), key);
      if (!value) return res.status(404).end();
      if (!isDataUrl(value)) return res.redirect(302, value);
      entry = decodeDataUrl(value);
      if (!entry) return res.status(404).end();
      remember(req.originalUrl, entry);
    }
    // Versioned URLs (?v=<hash>) never change content
    res.set('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
    res.type(entry.mime);
    return res.send(entry.buffer);
  } catch (error) {
    console.error('Media error:', error.message);
    return res.status(500).end();
  }
});

export default router;
