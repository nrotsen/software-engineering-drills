/**
 * Paleta de los diagramas, aparte de la de la UI.
 *
 * Regla que se respeta en todo el proyecto: VERDE y ROJO estan reservados
 * exclusivamente para "correcto / incorrecto". Si un diagrama usara verde para
 * decorar, el feedback dejaria de leerse de un vistazo — que es justo lo que
 * un diagrama tiene que dar.
 */
export const D = {
  ink: '#0f172a',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#cbd5e1',
  grid: '#eef2f6',
  surface: '#ffffff',
  band: '#f8fafc',
  accent: '#2563eb',
  /** Un color por tarea, estable entre paneles para que el ojo las siga. */
  taskA: '#38bdf8',
  taskB: '#6366f1',
  taskC: '#f59e0b',
} as const;

export const FONT = {
  label: 13,
  small: 11,
  tiny: 10,
  title: 13,
} as const;
