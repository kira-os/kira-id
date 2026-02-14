import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Connect wallet - create or get profile
app.post('/api/connect/wallet', async (req, res) => {
  const { wallet, signature, message } = req.body;
  
  // Verify signature (implement SIWS)
  // For now, trust the wallet address
  
  let { data: profile } = await supabase
    .from('kira_identities')
    .select('*')
    .eq('wallet_address', wallet)
    .single();
  
  if (!profile) {
    // Create new profile
    const { data, error } = await supabase
      .from('kira_identities')
      .insert({ wallet_address: wallet })
      .select()
      .single();
    
    if (error) return res.status(500).json({ error: error.message });
    profile = data;
  }
  
  res.json({ success: true, profile });
});

// Link Telegram
app.post('/api/connect/telegram', async (req, res) => {
  const { wallet, telegramHandle, telegramUserId } = req.body;
  
  const { data, error } = await supabase
    .from('kira_identities')
    .update({ 
      telegram_handle: telegramHandle,
      telegram_user_id: telegramUserId 
    })
    .eq('wallet_address', wallet)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, profile: data });
});

// Link X
app.post('/api/connect/x', async (req, res) => {
  const { wallet, xHandle, xUserId } = req.body;
  
  const { data, error } = await supabase
    .from('kira_identities')
    .update({ 
      x_handle: xHandle,
      x_user_id: xUserId 
    })
    .eq('wallet_address', wallet)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, profile: data });
});

// Get profile
app.get('/api/profile/:wallet', async (req, res) => {
  const { data, error } = await supabase
    .from('kira_identities')
    .select('*')
    .eq('wallet_address', req.params.wallet)
    .single();
  
  if (error) return res.status(404).json({ error: 'Profile not found' });
  res.json({ profile: data });
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  const { data, error } = await supabase
    .from('kira_identities')
    .select('*')
    .order('kira_score', { ascending: false })
    .limit(50);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ leaderboard: data });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`KIRA ID API on port ${PORT}`));
