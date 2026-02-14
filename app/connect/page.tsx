'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

interface UserProfile {
  wallet: string;
  telegram?: string;
  xHandle?: string;
  kiraScore: number;
  tier: string;
}

export default function ConnectPage() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [telegramInput, setTelegramInput] = useState('');
  const [xInput, setXInput] = useState('');

  useEffect(() => {
    if (connected && publicKey) {
      // Fetch balance
      connection.getBalance(publicKey).then(setBalance);
      
      // Fetch or create profile
      fetchProfile(publicKey.toString());
    }
  }, [connected, publicKey, connection]);

  const fetchProfile = async (wallet: string) => {
    // In production, fetch from API
    setProfile({
      wallet,
      kiraScore: 0,
      tier: 'bronze',
    });
  };

  const linkTelegram = async () => {
    if (!telegramInput) return;
    // Open Telegram bot with verification
    window.open(`https://t.me/kira_community_bot?start=link_${publicKey?.toString()}`, '_blank');
  };

  const linkX = async () => {
    if (!xInput) return;
    // X OAuth flow would go here
    alert(`Linking X account: ${xInput}`);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connect to KIRA</h1>
          <p className="text-slate-400 mb-8">Link your wallet, Telegram, and X to earn rewards</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your KIRA Identity</h1>
        
        {/* Wallet Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Wallet Connected</h2>
          <p className="font-mono text-sm text-slate-300 break-all">{publicKey?.toString()}</p>
          <p className="mt-2 text-green-400">Balance: {(balance ?? 0) / 1e9} SOL</p>
        </div>

        {/* Telegram Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Telegram</h2>
          {profile?.telegram ? (
            <p className="text-green-400">✅ Linked: @{profile.telegram}</p>
          ) : (
            <div>
              <input
                type="text"
                placeholder="@username"
                value={telegramInput}
                onChange={(e) => setTelegramInput(e.target.value)}
                className="w-full p-3 rounded bg-slate-700 text-white mb-3"
              />
              <button
                onClick={linkTelegram}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Link Telegram
              </button>
            </div>
          )}
        </div>

        {/* X Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🐦 X / Twitter</h2>
          {profile?.xHandle ? (
            <p className="text-green-400">✅ Linked: @{profile.xHandle}</p>
          ) : (
            <div>
              <input
                type="text"
                placeholder="@username"
                value={xInput}
                onChange={(e) => setXInput(e.target.value)}
                className="w-full p-3 rounded bg-slate-700 text-white mb-3"
              />
              <button
                onClick={linkX}
                className="bg-black hover:bg-slate-800 px-4 py-2 rounded border border-slate-600"
              >
                Link X Account
              </button>
            </div>
          )}
        </div>

        {/* Score Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">🏆 Your KIRA Score</h2>
          <p className="text-4xl font-bold">{profile?.kiraScore || 0}</p>
          <p className="text-purple-200">Tier: {profile?.tier || 'Bronze'}</p>
        </div>
      </div>
    </div>
  );
}
