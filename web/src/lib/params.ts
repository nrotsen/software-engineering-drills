import { SECTION_ORDER } from '@core/content/registry';
import type { LevelNumber, SectionId } from '@core/domain/section';

/**
 * Los parametros de la URL son strings arbitrarios: entrada NO confiable.
 * Estas dos guardas son la unica puerta por la que un string se convierte en
 * un `SectionId` / `LevelNumber` del dominio. Todo lo de adentro ya esta tipado.
 */
export function isSectionId(value: string | undefined): value is SectionId {
  return value !== undefined && (SECTION_ORDER as readonly string[]).includes(value);
}

export function toLevelNumber(value: string | undefined): LevelNumber | undefined {
  return value === '0' || value === '1' || value === '2' || value === '3'
    ? (Number(value) as LevelNumber)
    : undefined;
}
