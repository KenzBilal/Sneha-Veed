async function checkStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  let totalBytes = 0;
  let totalFiles = 0;
  const buckets = ['photos', 'avatars'];

  for (const bucket of buckets) {
    const res = await fetch(`${url}/storage/v1/object/list/${bucket}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ prefix: '', limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } })
    });
    
    if (!res.ok) {
      console.error(`Error fetching bucket ${bucket}:`, await res.text());
      continue;
    }

    const files = await res.json();
    for (const file of files) {
      if (file.name.startsWith('.')) continue;
      const size = file.metadata?.size || 0;
      totalBytes += size;
      totalFiles++;
    }
  }

  const avgBytes = totalFiles > 0 ? totalBytes / totalFiles : 0;
  const gbLimit = 1 * 1024 * 1024 * 1024; // 1 GB free tier assumed
  const remainingBytes = gbLimit - totalBytes;
  const remainingPhotos = avgBytes > 0 ? Math.floor(remainingBytes / avgBytes) : 0;

  console.log(`=== STORAGE ANALYSIS ===`);
  console.log(`Total Files: ${totalFiles}`);
  console.log(`Total Size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Average Size/File: ${(avgBytes / 1024).toFixed(2)} KB`);
  console.log(`Assumed Limit: 1 GB (Free Tier)`);
  console.log(`Remaining Capacity: ~${remainingPhotos.toLocaleString()} more photos`);
}

checkStorage();
