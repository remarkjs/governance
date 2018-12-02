'use strict'

var chalk = require('chalk')
var {Minimatch} = require('minimatch')
var {childTeamAccept} = require('../constants')
var {users} = require('../util/clean')
var find = require('../util/find')
var interpolate = require('../util/interpolate')

module.exports = repositories

async function repositories({repo, ctx}) {
  var {collaborators, org, paginate, structure} = ctx
  var repoMembers = await paginate('GET /repos/:org/:repo/collaborators', {
    org,
    repo: repo.name,
    headers: {accept: childTeamAccept}
  }).then(users)

  var matches = structure
    .concat(collaborators)
    .filter(info =>
      new Minimatch(
        interpolate(ctx, info.scope || info.repositories.scope)
      ).match(org + '/' + repo.name)
    )

  var {admin, push, pull} = matches.reduce(
    (all, x) => {
      var right = x.collaborators ? 'push' : x.repositories.right
      var humans = x.collaborators
        ? Object.keys(x.collaborators)
        : find(ctx, x.humans.member)

      all[right] = humans.concat(all[right])

      return all
    },
    {admin: [], push: [], pull: []}
  )

  repoMembers.forEach(({name, permissions}) => {
    var actual = permissions.admin
      ? 'admin'
      : permissions.push
      ? 'push'
      : 'pull'
    var expected = admin.includes(name)
      ? 'admin'
      : push.includes(name)
      ? 'push'
      : pull.includes(name)
      ? 'pull'
      : null

    // Warn if users are not expected to be in the repo.
    if (!expected) {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should not have role %s in repo %s',
        name,
        actual,
        repo.name
      )
      return
    }

    // Warn if users have incorrect rights.
    if (actual !== expected) {
      console.log(
        '  ' +
          chalk.red('✖') +
          ' @%s should have role %s instead of %s in repo %s',
        name,
        expected,
        actual,
        repo.name
      )
    }
  })

  return {
    repo,
    ctx
  }
}
