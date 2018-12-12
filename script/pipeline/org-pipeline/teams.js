'use strict'

var {promisify} = require('util')
var chalk = require('chalk')
var pSeries = require('p-series')
var run = promisify(require('../team-pipeline').run)

module.exports = teams

async function teams(ctx) {
  const {structure} = ctx
  const {org} = ctx

  console.log(chalk.bold('teams') + ' for %s', org)

  // Sort teams as ancestors first, children last.
  // To do: looks a bit funky but seems to work.
  const teams = structure
    .concat()
    .sort(
      (a, b) =>
        (a.parent === b.name ? 1 : 0) - (b.parent === a.name ? 1 : 0) ||
        (a.parent ? 1 : 0) - (b.parent ? 1 : 0)
    )

  await pSeries(teams.map(structure => () => run({ctx, structure})))
}
