'use strict'

var octo = require('@octokit/rest')

module.exports = configure

function configure(config) {
  var {org, token} = config
  var team = config.teams.find(x => {
    return x.scope.split('/')[0] === org
  })

  if (!token) {
    throw new Error('Missing GitHub token. Expected `config.token` to be set')
  }

  if (!team) {
    throw new Error('Could not find team belonging to `' + org + '`')
  }

  var {request, paginate} = octo({headers: {authorization: 'token ' + token}})

  return {
    ...config,
    orgTeam: team.name,
    request,
    paginate
  }
}
