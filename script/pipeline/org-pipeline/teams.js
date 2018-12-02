'use strict'

var chalk = require('chalk')
var {childTeamAccept} = require('../constants')
var {team} = require('../util/clean')
var interpolate = require('../util/interpolate')

module.exports = teams

async function teams(ctx) {
  var {ghTeams, org, structure} = ctx
  var names = ghTeams.map(x => x.name)
  var missing = structure.filter(x => !names.includes(x.name))

  console.log(chalk.bold('teams') + ' for %s', org)

  structure
    .filter(x => names.includes(x.name))
    .forEach(x => {
      console.log('  ' + chalk.blue('ℹ') + ' %s exists', x.name)
    })

  // Add parents first, then children who could depend on those parents.
  var parents = await Promise.all(missing.filter(x => !x.parent).map(add))
  ghTeams = ghTeams.concat(parents)
  var children = await Promise.all(missing.filter(x => x.parent).map(add))

  return {
    ...ctx,
    ghTeams: ghTeams.concat(children)
  }

  async function add({name, description, parent}) {
    var parentTeam = parent ? ghTeams.find(x => x.name === parent) : null

    if (parent && !parentTeam) {
      throw new Error('Missing parent `' + parent + '` for team `' + name + '`')
    }

    return ctx
      .request('POST /orgs/:org/teams', {
        name,
        description: interpolate(ctx, description),
        org: ctx.org,
        parent_team_id: parentTeam ? parentTeam.id : undefined, // eslint-disable-line camelcase
        privacy: 'closed',
        headers: {accept: childTeamAccept}
      })
      .then(team)
      .then(result => {
        console.log('  ' + chalk.green('✓') + ' %s created', name)
        return result
      })
  }
}
