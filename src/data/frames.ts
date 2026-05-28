export interface AvatarFrame {
  id: string;
  name: string;
  tier: 'pro' | 'elite';
  classes: string; 
}

export const AVATAR_FRAMES: AvatarFrame[] = [
  // PRO Frames (15)
  { id: 'pro-1', name: 'Pro Neon', tier: 'pro', classes: 'ring-4 ring-lime-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.3)]' },
  { id: 'pro-2', name: 'Pro Ocean', tier: 'pro', classes: 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-3', name: 'Pro Solar', tier: 'pro', classes: 'ring-4 ring-amber-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-4', name: 'Pro Amethyst', tier: 'pro', classes: 'ring-4 ring-purple-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-5', name: 'Pro Rose', tier: 'pro', classes: 'ring-4 ring-rose-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-6', name: 'Pro Forest', tier: 'pro', classes: 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-7', name: 'Pro Sky', tier: 'pro', classes: 'ring-4 ring-sky-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.4)]' },
  { id: 'pro-8', name: 'Pro Crimson', tier: 'pro', classes: 'ring-4 ring-red-500 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-9', name: 'Pro Indigo', tier: 'pro', classes: 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-10', name: 'Pro Gold', tier: 'pro', classes: 'ring-2 ring-yellow-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' },
  { id: 'pro-11', name: 'Pro Silver', tier: 'pro', classes: 'ring-4 ring-slate-300 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-12', name: 'Pro Steel', tier: 'pro', classes: 'ring-4 ring-slate-500 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-13', name: 'Pro Tangerine', tier: 'pro', classes: 'ring-4 ring-orange-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-14', name: 'Pro Mint', tier: 'pro', classes: 'ring-4 ring-teal-400 ring-offset-4 ring-offset-slate-900' },
  { id: 'pro-15', name: 'Pro Midnight', tier: 'pro', classes: 'ring-4 ring-blue-900 ring-offset-4 ring-offset-slate-900' },

  // ELITE Frames (15 + 15 = 30 total available to elite)
  { id: 'elite-1', name: 'Elite Cosmic', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 shadow-[0_0_25px_rgba(192,38,211,0.5)]' },
  { id: 'elite-2', name: 'Elite Magma', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-500 shadow-[0_0_25px_rgba(239,68,68,0.5)]' },
  { id: 'elite-3', name: 'Elite Aurora', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 shadow-[0_0_25px_rgba(16,185,129,0.5)]' },
  { id: 'elite-4', name: 'Elite Nebula', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500' },
  { id: 'elite-5', name: 'Elite Champion Gold', tier: 'elite', classes: 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(250,204,21,0.6)]' },
  { id: 'elite-6', name: 'Elite Diamond', tier: 'elite', classes: 'ring-4 ring-cyan-200 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(165,243,252,0.6)]' },
  { id: 'elite-7', name: 'Elite Ruby', tier: 'elite', classes: 'ring-4 ring-rose-600 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(225,29,72,0.6)]' },
  { id: 'elite-8', name: 'Elite Emerald', tier: 'elite', classes: 'ring-4 ring-emerald-500 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(16,185,129,0.5)]' },
  { id: 'elite-9', name: 'Elite Sapphire', tier: 'elite', classes: 'ring-4 ring-blue-600 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(37,99,235,0.6)]' },
  { id: 'elite-10', name: 'Elite Obsidian', tier: 'elite', classes: 'ring-4 ring-slate-950 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(0,0,0,0.8)]' },
  { id: 'elite-11', name: 'Elite Plasma', tier: 'elite', classes: 'p-1.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_20px_rgba(167,139,250,0.6)]' },
  { id: 'elite-12', name: 'Elite Toxic', tier: 'elite', classes: 'ring-4 ring-lime-500 ring-offset-4 ring-offset-slate-900 shadow-[0_0_25px_rgba(132,204,22,0.7)]' },
  { id: 'elite-13', name: 'Elite Arctic', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-b from-blue-100 to-blue-300 shadow-[0_0_25px_rgba(191,219,254,0.6)]' },
  { id: 'elite-14', name: 'Elite Sunset', tier: 'elite', classes: 'p-1.5 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 shadow-[0_0_20px_rgba(251,146,60,0.5)]' },
  { id: 'elite-15', name: 'Elite Void', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-r from-slate-900 to-black ring-2 ring-purple-900 shadow-[0_0_30px_rgba(88,28,135,0.5)]' },
  
  // Additional 15 ELITE Frames (making it 30 total)
  { id: 'elite-16', name: 'Elite Dragon', tier: 'elite', classes: 'ring-4 ring-red-700 ring-offset-4 ring-offset-slate-900 shadow-[0_0_40px_rgba(185,28,28,0.7)]' },
  { id: 'elite-17', name: 'Elite Cyber', tier: 'elite', classes: 'border-2 border-dashed border-cyan-400 ring-4 ring-cyan-900 ring-offset-4 ring-offset-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.6)]' },
  { id: 'elite-18', name: 'Elite Ghost', tier: 'elite', classes: 'ring-4 ring-slate-100 ring-offset-4 ring-offset-slate-900 opacity-90 shadow-[0_0_40px_rgba(241,245,249,0.5)]' },
  { id: 'elite-19', name: 'Elite Inferno', tier: 'elite', classes: 'p-2 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-amber-400 shadow-[0_0_35px_rgba(234,88,12,0.7)]' },
  { id: 'elite-20', name: 'Elite Abyssal', tier: 'elite', classes: 'ring-4 ring-indigo-900 ring-offset-4 ring-offset-slate-900 shadow-[0_0_40px_rgba(49,46,129,0.8)]' },
  { id: 'elite-21', name: 'Elite Neon Pulse', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-tr from-pink-500 to-lime-500 shadow-[0_0_30px_rgba(236,72,153,0.6)]' },
  { id: 'elite-22', name: 'Elite Celestial', tier: 'elite', classes: 'ring-4 ring-yellow-200 ring-offset-4 ring-offset-slate-900 shadow-[0_0_35px_rgba(254,240,138,0.7)]' },
  { id: 'elite-23', name: 'Elite Phantom', tier: 'elite', classes: 'ring-4 ring-purple-500 ring-offset-4 ring-offset-slate-950 shadow-[0_0_35px_rgba(168,85,247,0.6)]' },
  { id: 'elite-24', name: 'Elite Valkyrie', tier: 'elite', classes: 'p-1.5 rounded-full bg-gradient-to-br from-amber-200 to-yellow-600 shadow-[0_0_40px_rgba(217,119,6,0.6)]' },
  { id: 'elite-25', name: 'Elite Templar', tier: 'elite', classes: 'ring-4 ring-slate-300 ring-offset-4 ring-offset-red-900 shadow-[0_0_30px_rgba(153,27,27,0.7)]' },
  { id: 'elite-26', name: 'Elite Chronos', tier: 'elite', classes: 'p-1 rounded-full bg-gradient-to-tr from-teal-400 to-blue-600 shadow-[0_0_35px_rgba(45,212,191,0.6)]' },
  { id: 'elite-27', name: 'Elite Overlord', tier: 'elite', classes: 'ring-4 ring-rose-700 ring-offset-4 ring-offset-black shadow-[0_0_45px_rgba(190,18,60,0.8)]' },
  { id: 'elite-28', name: 'Elite Kraken', tier: 'elite', classes: 'p-1.5 rounded-full bg-gradient-to-bl from-cyan-600 to-emerald-700 shadow-[0_0_40px_rgba(8,145,178,0.7)]' },
  { id: 'elite-29', name: 'Elite Nova', tier: 'elite', classes: 'ring-4 ring-fuchsia-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_40px_rgba(232,121,249,0.7)]' },
  { id: 'elite-30', name: 'Elite Zenith', tier: 'elite', classes: 'p-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 shadow-[0_0_50px_rgba(251,191,36,0.8)]' },
];
