import { describe, expect, it } from 'vitest';
import { shuffle } from '../src/core/shuffle.js';

describe('shuffle', () => {
  it('conserva todos los elementos', () => {
    const xs = [1, 2, 3, 4, 5];
    expect(shuffle(xs).sort()).toEqual(xs);
  });

  it('no muta el array original', () => {
    const xs = [1, 2, 3];
    shuffle(xs, () => 0);
    expect(xs).toEqual([1, 2, 3]);
  });

  it('es determinista con un rng inyectado', () => {
    const rng = () => 0;
    expect(shuffle([1, 2, 3], rng)).toEqual(shuffle([1, 2, 3], rng));
  });
});
