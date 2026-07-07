'use server';

import { revalidatePath } from 'next/cache';
import { toggleOptionEliminated } from '@/lib/db';

export async function adminToggleEliminate(id: string, eliminated: boolean) {
  const { error } = await toggleOptionEliminated(id, eliminated);
  if (error) throw new Error(error.message);
  revalidatePath('/world-cup');
  revalidatePath('/admin');
}
