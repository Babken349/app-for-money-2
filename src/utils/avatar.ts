import { UserProfile } from '../types';
import { AVATAR_FRAMES } from '../data/frames';

export function getAvatarClasses(user?: Partial<UserProfile>, sizeClass?: 'small' | 'large') {
  if (!user) return 'border border-slate-700';

  const subStatus = user.subscriptionStatus || 'free';
  const customFrame = user.frameId ? AVATAR_FRAMES.find(f => f.id === user.frameId) : null;

  if (customFrame) {
    return customFrame.classes;
  }

  // Fallback defaults without animate-pulse
  if (sizeClass === 'large') {
    if (subStatus === 'elite') return 'ring-4 ring-rose-500 ring-offset-4 ring-offset-slate-900 shadow-[0_0_20px_rgba(244,63,94,0.4)]';
    if (subStatus === 'pro') return 'ring-4 ring-lime-400 ring-offset-4 ring-offset-slate-900 shadow-[0_0_20px_rgba(163,230,53,0.3)]';
    if (subStatus === 'member') return 'ring-4 ring-cyan-400 ring-offset-4 ring-offset-slate-900';
    return 'border-2 border-slate-700';
  } else {
    if (subStatus === 'elite') return 'ring-2 ring-rose-500 border-transparent shadow-[0_0_10px_rgba(244,63,94,0.5)]';
    if (subStatus === 'pro') return 'ring-2 ring-lime-400 border-transparent shadow-[0_0_10px_rgba(163,230,53,0.4)]';
    if (subStatus === 'member') return 'ring-2 ring-cyan-400 border-transparent';
    return 'border border-slate-700';
  }
}
