export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', zIndex: 9999
    }}>
      <div className="loader" style={{
        fontSize: '3rem',
        animation: 'bounce 1s infinite alternate'
      }}>
        ⏳
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-20px); }
        }
      `}} />
    </div>
  );
}
