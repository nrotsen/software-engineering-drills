import { useEffect, useRef } from 'react';

/**
 * Halo dorado suave que sigue al cursor con easing.
 *
 * Decisiones:
 *   - Toda la animacion vive en un solo `transform: translate3d(...)` — el
 *     compositor lo mueve en GPU sin recalcular layout ni paint.
 *   - Loop propio con `requestAnimationFrame`, NO por cada evento mousemove.
 *     Un mouse moderno dispara ~60-100 eventos/s; batchear con rAF los recorta
 *     a un solo update por frame.
 *   - Easing exponencial simple (`t += (target - t) * k`): sensacion de peso
 *     sin necesidad de una lib de springs.
 *   - Cuando el cursor esta quieto, el loop se detiene solo (no se acumula
 *     trabajo). Se re-arma en el proximo mousemove.
 *   - Desactivado en touch (no hay puntero real) via `matchMedia('(pointer: fine)')`.
 *   - `prefers-reduced-motion` lo esconde por CSS (ver index.css, `.mouse-aura`).
 */
const SIZE = 480; // px, diametro del halo
const EASING = 0.14;

export function MouseAurora() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // En dispositivos sin puntero fino (mobile), la aura no tiene mucho sentido
    // y ademas se dispararia por cada tap. Salteamos el listener.
    if (typeof window.matchMedia === 'function' && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const el = ref.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let rafId = 0;
    let visible = false;

    const paint = () => {
      const dx = targetX - currentX;
      const dy = targetY - currentY;
      currentX += dx * EASING;
      currentY += dy * EASING;
      el.style.transform = `translate3d(${currentX - SIZE / 2}px, ${currentY - SIZE / 2}px, 0)`;
      // Cuando ya "alcanzamos" al cursor, cortamos el rAF. Cualquier mousemove
      // futuro lo re-arma. Ahorra ciclos cuando el usuario no mueve el mouse.
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
        rafId = requestAnimationFrame(paint);
      } else {
        rafId = 0;
      }
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        // Se muestra recien al primer mousemove: si aparece de una en su
        // posicion inicial hardcodeada, se ve como un salto extraño.
        el.style.opacity = '1';
        visible = true;
      }
      if (!rafId) rafId = requestAnimationFrame(paint);
    };

    // Al salir del viewport ocultamos suave para que no quede pegada en el borde.
    const onLeave = () => {
      el.style.opacity = '0';
      visible = false;
    };
    const onEnter = () => {
      el.style.opacity = '1';
      visible = true;
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="mouse-aura pointer-events-none fixed top-0 left-0 rounded-full opacity-0 transition-opacity duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        background:
          'radial-gradient(circle at center, rgba(234, 179, 8, 0.22), rgba(251, 191, 36, 0.10) 40%, transparent 68%)',
        willChange: 'transform, opacity',
        filter: 'blur(6px)',
        zIndex: 0,
      }}
    />
  );
}
