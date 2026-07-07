'use client';

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  useParticipants,
  DisconnectButton
} from '@livekit/components-react';
import '@livekit/components-styles';

interface Props {
  profileId: string;
  onLeave: () => void;
}

export default function LoungeRoom({ profileId, onLeave }: Props) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/livekit?profileId=${profileId}`);
        const data = await res.json();
        if (data.error) {
          if (active) setError(data.error);
          return;
        }
        if (active) setToken(data.token);
      } catch (e: any) {
        if (active) setError(e.message);
      }
    })();
    return () => { active = false; };
  }, [profileId]);

  if (error) {
    return (
      <div className="card fade-up">
        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: 'var(--red)', marginBottom: '1rem' }}>Connection Error</h2>
          <p>{error}</p>
          <button onClick={onLeave} className="btn" style={{ marginTop: '1.5rem' }}>Back</button>
        </div>
      </div>
    );
  }

  if (token === '') {
    return (
      <div className="card fade-up">
        <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
          <h2>Connecting to Server...</h2>
          <p style={{ color: 'var(--text-3)' }}>Getting secure access token</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      onDisconnected={onLeave}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        border: '1px solid var(--border)', overflow: 'hidden',
        minHeight: '400px'
      }}
    >
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 900 }}>Live Audio Lounge</h2>
        <p style={{ fontSize: '.85rem', color: 'var(--text-3)', marginTop: '.2rem' }}>Speak freely. Audio is end-to-end encrypted and crystal clear.</p>
      </div>

      <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
        <ParticipantsGrid />
      </div>

      <div style={{ padding: '1rem', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
        <ControlBar controls={{ camera: false, chat: false, screenShare: false }} />
        <DisconnectButton style={{ marginLeft: '1rem', padding: '.5rem 1rem', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--r-md)', fontWeight: 800, cursor: 'pointer' }}>
          Leave Lounge
        </DisconnectButton>
      </div>

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function ParticipantsGrid() {
  const participants = useParticipants();
  
  if (participants.length === 0) {
    return <div style={{ color: 'var(--text-3)' }}>Waiting for others...</div>;
  }

  return (
    <>
      {participants.map((p) => (
        <div key={p.identity} style={{ width: 120, height: 120, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem', flexDirection: 'column' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>
            {p.isSpeaking ? '🗣️' : '👤'}
          </div>
          <div style={{ fontSize: '.8rem', fontWeight: 700, wordBreak: 'break-word', color: p.isSpeaking ? 'var(--green)' : 'var(--text)' }}>
            {p.name || p.identity}
          </div>
        </div>
      ))}
    </>
  );
}
