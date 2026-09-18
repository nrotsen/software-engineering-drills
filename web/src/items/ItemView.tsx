import type { ComponentType } from 'react';
import type { Item, ItemKind } from '@core/domain/item';
import { TheoryView } from './TheoryView.js';
import { DiagramView } from './DiagramView.js';
import { MultipleChoiceView } from './MultipleChoiceView.js';
import { TrueFalseView } from './TrueFalseView.js';
import { NumericView } from './NumericView.js';
import { CodeView } from './CodeView.js';
import type { ItemViewProps } from './types.js';

/**
 * DISPATCH TABLE, version React.
 *
 * Es deliberadamente el mismo patron que `src/cli/handlers/index.ts`: un mapa
 * de `kind` a implementacion, con un tipo mapeado que obliga a cubrir todos
 * los kinds. Si manana agregas un tipo de item al dominio, el compilador te
 * frena en DOS lugares —la CLI y la web— y ninguno de los dos se te escapa.
 *
 * El unico `as` esta aca, igual que en la CLI: TypeScript no puede
 * correlacionar la union del item con la union de componentes en el punto de
 * llamada. Queda encapsulado en una linea.
 */
const views: { [K in ItemKind]: ComponentType<ItemViewProps<Extract<Item, { kind: K }>>> } = {
  theory: TheoryView,
  diagram: DiagramView,
  multipleChoice: MultipleChoiceView,
  trueFalse: TrueFalseView,
  numeric: NumericView,
  code: CodeView,
};

export function ItemView(props: ItemViewProps) {
  const View = views[props.item.kind] as ComponentType<ItemViewProps>;
  return <View {...props} />;
}
