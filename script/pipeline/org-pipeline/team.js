'use strict'

var {promisify} = require('util')
var run = promisify(require('../team-pipeline').run)

module.exports = team

async function team(ctx) {
  var results = await Promise.all(ctx.ghTeams.map(x => run({ctx, team: x})))

  return {
    ...ctx,
    ghTeams: results.map(x => x.team)
  }
}
