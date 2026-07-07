import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { cookies } from 'next/headers';
import { getProfile } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    let profileId: string | null | undefined = searchParams.get('profileId');
    
    if (!profileId) {
      const cookieStore = await cookies();
      profileId = cookieStore.get('activeProfileId')?.value;
    }

    if (!profileId) {
      return NextResponse.json({ error: 'Missing profile ID' }, { status: 400 });
    }

    const profile = await getProfile(profileId);
    if (!profile) {
      return NextResponse.json({ error: 'Invalid profile' }, { status: 401 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const roomName = 'SnehaVeedLounge';
    const participantName = profile.call_name;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: profileId,
      name: participantName,
    });
    
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({ token });
  } catch (error: any) {
    console.error('LiveKit Token Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
