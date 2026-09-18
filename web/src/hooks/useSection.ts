import { useEffect, useState } from 'react';
import type { Section, SectionId } from '@core/domain/section';
import { loadSection } from '@core/content/registry';

type State =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly section: Section }
  | { readonly status: 'error'; readonly message: string };

/**
 * El registry del core es asincronico (usa `import()` dinamico) y eso se
 * mantiene igual en la web: Vite lo convierte en un chunk aparte, asi que el
 * contenido de una seccion se descarga recien cuando entras. La misma decision
 * de diseno da lazy-loading en Node y code-splitting en el browser, gratis.
 */
export function useSection(id: SectionId): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    loadSection(id)
      .then((section) => alive && setState({ status: 'ready', section }))
      .catch((e: unknown) =>
        alive && setState({ status: 'error', message: e instanceof Error ? e.message : 'Error' }),
      );
    // El flag `alive` evita el warning de setState sobre un componente
    // desmontado si navegas rapido entre secciones.
    return () => {
      alive = false;
    };
  }, [id]);

  return state;
}
