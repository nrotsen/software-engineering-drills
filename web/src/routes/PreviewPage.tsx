import { useParams } from 'react-router-dom';
import { isScorable, type Item } from '@core/domain/item';
import { grade, type Answer } from '@core/grading';
import { useSection } from '../hooks/useSection.js';
import { ItemView } from '../items/ItemView.js';
import { isSectionId, toLevelNumber } from '../lib/params.js';

/**
 * Ruta SOLO de desarrollo: renderiza todos los items de un nivel, de una, ya
 * corregidos. Es el equivalente web de `npm run preview` en la CLI: sirve para
 * revisar como quedan los diagramas y el feedback despues de tocar contenido,
 * sin tener que jugar el nivel entero a mano.
 *
 * Se monta solo si `import.meta.env.DEV`, asi que no llega al bundle de prod.
 */
export function PreviewPage() {
  const { sectionId, level } = useParams();
  const levelNumber = toLevelNumber(level);
  const state = useSection(isSectionId(sectionId) ? sectionId : 'concurrency');

  if (state.status !== 'ready' || levelNumber === undefined) return <p>…</p>;
  const found = state.section.levels.find((l) => l.level === levelNumber);
  if (!found) return <p>No existe ese nivel.</p>;

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Preview · {state.section.title} · Nivel {levelNumber} · {found.items.length} ítems
      </p>
      {found.items.map((item) => (
        <ItemView
          key={item.id}
          item={item}
          answered={fakeAnswer(item)}
          choiceOrder={item.kind === 'multipleChoice' ? item.choices.map((_, i) => i) : undefined}
          onAnswer={() => {}}
        />
      ))}
    </div>
  );
}

/** Responde siempre la primera opción, para ver el estado "ya corregido". */
function fakeAnswer(item: Item) {
  if (!isScorable(item)) return undefined;
  const answer: Answer =
    item.kind === 'multipleChoice'
      ? { kind: 'multipleChoice', choiceIndex: 0 }
      : item.kind === 'trueFalse'
        ? { kind: 'trueFalse', value: true }
        : item.kind === 'numeric'
          ? { kind: 'numeric', value: item.answer }
          : { kind: 'code', selfGrade: 0.5 };
  return { answer, outcome: grade(item, answer) };
}
