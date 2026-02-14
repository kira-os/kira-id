import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Handle /start with wallet linking
bot.command('start', async (ctx) => {
  const text = ctx.message.text;
  const args = text.split(' ');
  
  // Check if linking wallet
  if (args[1]?.startsWith('link_')) {
    const wallet = args[1].replace('link_', '');
    const telegramId = ctx.from?.id.toString();
    const username = ctx.from?.username;
    
    // Update profile in database
    const { error } = await supabase
      .from('kira_identities')
      .update({ 
        telegram_user_id: telegramId,
        telegram_handle: username 
      })
      .eq('wallet_address', wallet);
    
    if (error) {
      ctx.reply('❌ Failed to link. Please try again.');
      return;
    }
    
    ctx.reply(
      `✅ Telegram linked!\n\n` +
      `Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}\n` +
      `Telegram: @${username}\n\n` +
      `Your accounts are now connected. Earn points for engagement!`
    );
    return;
  }
  
  // Regular start
  ctx.reply(
    `🎉 Welcome to KIRA!\n\n` +
    `Connect your accounts to earn rewards:\n` +
    `1. Connect wallet at kiraos.live/connect\n` +
    `2. Return and click "Link Telegram"\n` +
    `3. Your accounts will be linked automatically\n\n` +
    `Commands:\n` +
    `/score - Check your KIRA score\n` +
    `/leaderboard - Top members\n` +
    `/help - More commands`
  );
});

// Check score
bot.command('score', async (ctx) => {
  const telegramId = ctx.from?.id.toString();
  
  const { data } = await supabase
    .from('kira_identities')
    .select('kira_score, tier, wallet_address')
    .eq('telegram_user_id', telegramId)
    .single();
  
  if (!data) {
    ctx.reply('❌ No linked wallet found. Connect at kiraos.live/connect first!');
    return;
  }
  
  ctx.reply(
    `📊 Your KIRA Stats:\n\n` +
    `Score: ${data.kira_score} points\n` +
    `Tier: ${data.tier}\n` +
    `Wallet: ${data.wallet_address.slice(0, 8)}...\n\n` +
    `Keep engaging to earn more!`
  );
});

// Leaderboard
bot.command('leaderboard', async (ctx) => {
  const { data } = await supabase
    .from('kira_identities')
    .select('telegram_handle, kira_score')
    .order('kira_score', { ascending: false })
    .limit(10);
  
  if (!data?.length) {
    ctx.reply('No users yet. Be the first to connect!');
    return;
  }
  
  let msg = '🏆 Top KIRA Members:\n\n';
  data.forEach((user, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
    msg += `${medal} ${i + 1}. ${user.telegram_handle || 'Anonymous'} - ${user.kira_score} pts\n`;
  });
  
  ctx.reply(msg);
});

bot.launch();
console.log('KIRA ID Telegram bot running...');
