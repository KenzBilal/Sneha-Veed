import { getProfile, getPhotosByProfile, calculateTags } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Uploader, PhotoActions } from "@/components/Uploader";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  
  if (!profile) {
    return notFound();
  }

  const tags = await calculateTags(id);
  const photos = await getPhotosByProfile(id);

  return (
    <div className="container animate-fade-in">
      <header className="header-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <ArrowLeft size={20} /> Back to Group
        </Link>
        <div className="header-logo">
          <span>🏡</span> Sneha Veed <span>🌲</span>
        </div>
      </header>

      <main>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="title" style={{ fontSize: '3.5rem' }}>{profile.call_name}</h1>
          <p className="subtitle" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{profile.name}</p>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', fontStyle: 'italic' }}>
            "{profile.description}"
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '1rem' }}>
            {tags.map(tag => (
              <span key={tag} className={`tag ${tag.includes('Hated') ? 'negative' : ''}`}>
                {tag}
              </span>
            ))}
          </div>
          
          <Uploader profileId={id} />
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Embarrassing Collection ({photos.length})
        </h3>

        {photos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface-color)', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: '4rem' }}>📸</span>
            <p className="subtitle" style={{ marginTop: '1rem' }}>No photos yet. Be the first to expose them!</p>
          </div>
        )}

        <div className="masonry-grid">
          {photos.map((photo, i) => (
            <div key={photo.id} className={`card masonry-item stagger-${(i % 3) + 1}`}>
              <img src={photo.url} alt="Photo" className="masonry-img" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} />
              <div style={{ padding: '1rem' }}>
                <PhotoActions 
                  photoId={photo.id} 
                  profileId={id} 
                  likes={photo.likes} 
                  dislikes={photo.dislikes} 
                />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
