'use strict'

var {teams, repos, users} = require('../util/clean')

module.exports = requests

async function requests(ctx) {
  var {org} = ctx

  // We pool these big ones together so we can go faster afterwards.
  var [ghTeams, ghRepos, ghMembers] = await Promise.all([
    ctx.request('GET /orgs/:org/teams', {org}).then(teams),
    ctx.paginate('GET /orgs/:org/repos', {org}).then(repos),
    ctx.paginate('GET /orgs/:org/members', {org}).then(users),
    ctx
      .paginate('GET /orgs/:org/members', {org, filter: '2fa_disabled'})
      .then(users)
  ])

  return {
    ...ctx,
    ghTeams,
    ghRepos,
    ghMembers
  }
}
