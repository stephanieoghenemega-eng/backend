const { StellarSdk } = require('../config/stellar');

const challenges = new Map();

/**
 * GET /api/auth/challenge?wallet= — issue a nonce for the wallet to sign
 */
function issueChallenge(req, res) {
  const { wallet } = req.query;
  if (!wallet) return res.status(400).json({ error: 'wallet required' });

  const nonce = `oyaship:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  challenges.set(wallet, { nonce, expires: Date.now() + 60_000 });
  res.json({ nonce });
}

/**
 * POST /api/auth/verify — verify signed nonce, return wallet address
 */
function verifySignature(req, res) {
  const { wallet, signature } = req.body;
  if (!wallet || !signature) return res.status(400).json({ error: 'wallet and signature required' });

  const entry = challenges.get(wallet);
  if (!entry || Date.now() > entry.expires)
    return res.status(401).json({ error: 'Challenge expired or not found' });

  try {
    const keypair    = StellarSdk.Keypair.fromPublicKey(wallet);
    const msgBuffer  = Buffer.from(entry.nonce);
    const sigBuffer  = Buffer.from(signature, 'base64');
    const valid      = keypair.verify(msgBuffer, sigBuffer);

    if (!valid) return res.status(401).json({ error: 'Invalid signature' });

    challenges.delete(wallet);
    res.json({ wallet, verified: true });
  } catch {
    res.status(401).json({ error: 'Signature verification failed' });
  }
}

/**
 * Middleware: require x-wallet-address header on protected routes.
 */
function requireAuth(req, res, next) {
  const wallet = req.headers['x-wallet-address'];
  if (!wallet) return res.status(401).json({ error: 'Missing x-wallet-address header' });
  try {
    StellarSdk.Keypair.fromPublicKey(wallet);
  } catch {
    return res.status(401).json({ error: 'Invalid wallet address' });
  }
  req.wallet = wallet;
  next();
}

module.exports = { issueChallenge, verifySignature, requireAuth };
