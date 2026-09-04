/**
 * Milestone 4 E2E Acceptance Test Entrypoint
 * (Referenced in PROJECT.md § Code Layout)
 */

'use strict';

const { main } = require('./verify_oauth');

if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
