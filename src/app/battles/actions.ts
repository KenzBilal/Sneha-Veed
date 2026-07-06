'use server';

import { revalidatePath } from 'next/cache';
import { recordBattleResult } from '@/lib/db';

export async function submitBattleVote(questionId: string, winnerId: string, loserId: string) {
  const { error } = await recordBattleResult(questionId, winnerId, loserId);
  if (error) throw new Error(error.message);
  
  // Revalidate paths that might care about new tags
  revalidatePath('/');
  revalidatePath(`/profile/${winnerId}`);
  revalidatePath(`/profile/${loserId}`);
}
