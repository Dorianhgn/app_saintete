import * as migration_20260424_102051 from './20260424_102051';
import * as migration_20260427_143317_add_chapelet_catechese_fields from './20260427_143317_add_chapelet_catechese_fields';

export const migrations = [
  {
    up: migration_20260424_102051.up,
    down: migration_20260424_102051.down,
    name: '20260424_102051',
  },
  {
    up: migration_20260427_143317_add_chapelet_catechese_fields.up,
    down: migration_20260427_143317_add_chapelet_catechese_fields.down,
    name: '20260427_143317_add_chapelet_catechese_fields'
  },
];
