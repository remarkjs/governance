'use strict'

var chalk = require('chalk')
var difference = require('arr-diff')
var find = require('../util/find')
var {users} = require('../util/clean')
var {childTeamAccept} = require('../constants')

module.exports = members

async function members({team, ctx}) {
  var {paginate, request, structure} = ctx
  var teamStructure = structure.find(x => x.name === team.name)
  var definition
  var maintainers
  var members
  var all
  var allTeamMembers
  var teamMembers

  if (!teamStructure) {
    console.log(
      '  ' + chalk.blue('ℹ') + ' ignoring members of unstructured team %s',
      team.name
    )
    return
  }

  definition = teamStructure.humans
  maintainers = find(ctx, definition.maintainer)
  members = difference(find(ctx, definition.member), maintainers)
  all = members.concat(maintainers)

  allTeamMembers = await paginate('GET /teams/:team/members', {
    team: team.id,
    headers: {accept: childTeamAccept}
  }).then(users)

  teamMembers = await Promise.all(
    allTeamMembers.map(({name}) =>
      request('GET /teams/:team/memberships/:name', {
        team: team.id,
        name,
        headers: {accept: childTeamAccept}
      }).then(({data}) => ({name, role: data.role}))
    )
  )

  // Remove
  teamMembers
    .filter(x => !all.find(y => y === x.name))
    .forEach(x => {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should not be in team %s',
        x.name,
        team.name
      )
    })

  // Current members with wrong roles.
  teamMembers.forEach(({role, name}) => {
    var expected = maintainers.includes(name) ? 'maintainer' : 'member'

    // Core team members are always maintainers, regardless of what’s otherwise
    // expected.
    if (find(ctx, 'core/*')) {
      return
    }

    if (expected !== role) {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should have role %s instead of %s in %s',
        name,
        expected,
        role,
        team.name
      )
    }
  })

  // Add missing humans. Note that this will add pending humans again.
  await Promise.all(
    all
      .filter(name => !teamMembers.find(y => y.name === name))
      .map(name => {
        var role = maintainers.includes(name) ? 'maintainer' : 'member'

        return request('PUT /teams/:team/memberships/:name', {
          team: team.id,
          name,
          role
        }).then(() => {
          console.log(
            '  ' + chalk.green('✔') + ' add @%s to %s with role %s',
            name,
            team.name,
            role
          )
        })
      })
  )

  return {
    team,
    ctx
  }
}
