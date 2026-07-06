import Link from "next/link";
import { getProfiles, calculateTags, getPhotosByProfile } from "@/lib/db";
import { Home } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const profiles = await getProfiles();

  return (
    <div className="container animate-fade-in">
      <header className="header-nav">
        <div className="header-logo">
          <span>🏡</span> Sneha Veed <span>🌲</span>
        </div>
      </header>
      
      <main>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 className="title">Our Crazy Group</h1>
          <p className="subtitle">Upload embarrassing pics. Vote. Survive.</p>
        </div>

        {profiles.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p className="subtitle">No friends added yet! Let's add some to the database.</p>
          </div>
        )}

        <div className="masonry-grid">
          {await Promise.all(profiles.map(async (profile, i) => {
            const tags = await calculateTags(profile.id);
            const photos = await getPhotosByProfile(profile.id);
            const latestPhoto = photos[0]?.url || null;

            return (
              <Link href={`/profile/${profile.id}`} key={profile.id} className="card masonry-item stagger-1" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                {latestPhoto ? (
                  <img src={latestPhoto} alt={profile.name} className="masonry-img" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0, height: '250px' }} />
                ) : (
                  <div style={{ height: '150px', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>👻</span>
                  </div>
                )}
                
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.2rem' }}>{profile.call_name}</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>aka {profile.name}</p>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags.map(tag => (
                      <span key={tag} className={`tag ${tag.includes('Hated') ? 'negative' : ''}`}>
                        {tag}
                      </span>
                    ))}
                    {tags.length === 0 && <span className="tag">Newbie 👶</span>}
                  </div>
                </div>
              </Link>
            );
          }))}
        </div>
      </main>
    </div>
  );
}
