const { Router } = require('express');
const supabase   = require('../config/supabase');
const router = Router();

const VALID_CATEGORIES = [
  'electronics', 'fashion', 'home', 'beauty',
  'sports', 'food', 'automotive', 'industrial', 'other',
];

// GET /api/listings
router.get('/', async (req, res) => {
  let { category, search } = req.query;

  if (category && !VALID_CATEGORIES.includes(category.toLowerCase()))
    return res.status(400).json({ error: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}` });

  // Sanitize search — strip SQL wildcard characters to prevent injection
  if (search) search = search.replace(/[%_\\]/g, '').trim().slice(0, 100);

  let query = supabase
    .from('listings')
    .select('*, users(handle, display_name, avatar_url)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category.toLowerCase());
  if (search)   query = query.ilike('title', `%${search}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/listings
router.post('/', async (req, res) => {
  const { seller_id, title, description, price, category, moq, ship_days, image_url } = req.body;
  if (!seller_id || !title || !price)
    return res.status(400).json({ error: 'seller_id, title, and price are required' });

  if (category && !VALID_CATEGORIES.includes(category.toLowerCase()))
    return res.status(400).json({ error: `Invalid category. Valid values: ${VALID_CATEGORIES.join(', ')}` });

  if (price <= 0)
    return res.status(400).json({ error: 'price must be a positive number' });

  const { data: seller } = await supabase
    .from('users').select('role').eq('id', seller_id).single();
  if (!seller || !['seller', 'both'].includes(seller.role))
    return res.status(403).json({ error: 'Seller role required' });

  const { data, error } = await supabase
    .from('listings')
    .insert({ seller_id, title, description, price, category: category?.toLowerCase(), moq, ship_days, image_url, status: 'active' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET /api/listings/:id
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*, users(handle, display_name, avatar_url)')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ error: 'Listing not found' });
  res.json(data);
});

module.exports = router;
