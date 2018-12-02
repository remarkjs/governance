'use strict'

var chalk = require('chalk')
var {Minimatch} = require('minimatch')
var {childTeamAccept} = require('../constants')
var interpolate = require('../util/interpolate')
var {repos} = require('../util/clean')

module.exports = repositories

async function repositories({team, ctx}) {
  var {org, structure, ghRepos, request, paginate} = ctx
  var headers = {accept: childTeamAccept}
  var definition = structure.find(x => x.name === team.name).repositories
  var right = definition.right
  var match = new Minimatch(interpolate(ctx, definition.scope))
  var expected = ghRepos.filter(repo => match.match(full(repo)))
  var teamRepos = await paginate('GET /teams/:team/repos', {
    team: team.id,
    headers
  }).then(repos)

  // Remove
  teamRepos
    .filter(x => !expected.find(y => y.name === x.name))
    .forEach(x => {
      console.log(
        '  ' + chalk.red('✖') + ' %s should not be governed by %s',
        x.name,
        team.name
      )
    })

  var incorrect = [].concat(
    // Current repos with wrong permissions.
    teamRepos.filter(repo => {
      var perms = repo.permissions
      var perm = perms.admin ? 'admin' : perms.push ? 'push' : 'pull'
      return perm !== right
    }),
    // Missing repos
    expected.filter(x => !teamRepos.find(y => y.name === x.name))
  )

  await Promise.all(
    incorrect.map(({name}) =>
      request('PUT /teams/:team/repos/:org/:repo', {
        team: team.id,
        org,
        repo: name,
        permission: right,
        headers: {accept: childTeamAccept}
      }).then(() => {
        console.log(
          '  ' + chalk.green('✔') + ' set permissions for %s on %s to %s',
          team.name,
          name,
          right
        )
      })
    )
  )

  return {
    team,
    ctx
  }

  function full(repo) {
    return [ctx.org, repo.name].join('/')
  }
}
