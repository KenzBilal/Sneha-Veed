/**
 * Spawns a floating emoji that pops up from a click/touch position
 * and floats away with a fade. Works anywhere — no React needed.
 */
export function emojiPop(
  emoji: string,
  event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
  options?: { count?: number; spread?: number }
) {
  const { count = 1, spread = 0 } = options ?? {};

  const getXY = () => {
    if ('touches' in event && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
    if ('clientX' in event) {
      return { x: event.clientX, y: event.clientY };
    }
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  };

  const { x, y } = getXY();

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const offsetX = spread ? (Math.random() - 0.5) * spread : 0;
    const offsetY = spread ? (Math.random() - 0.5) * spread * 0.5 : 0;
    const drift = (Math.random() - 0.5) * 40;

    el.textContent = emoji;
    el.style.cssText = `
      position: fixed;
      left: ${x + offsetX}px;
      top: ${y + offsetY}px;
      transform: translate(-50%, -50%);
      font-size: ${1.6 + Math.random() * 0.8}rem;
      pointer-events: none;
      z-index: 9999;
      user-select: none;
      animation: emojiFloat ${0.7 + Math.random() * 0.3}s ease-out forwards;
      --drift: ${drift}px;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}
