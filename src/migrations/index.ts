import * as migration_20260421_121832_initial from './20260421_121832_initial';

export const migrations = [
  {
    up: migration_20260421_121832_initial.up,
    down: migration_20260421_121832_initial.down,
    name: '20260421_121832_initial'
  },
];
