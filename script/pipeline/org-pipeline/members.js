'use strict'

var chalk = require('chalk')
var find = require('../util/find')

var concat = [].concat

module.exports = members

async function members(ctx) {
  var {org, request, structure} = ctx
  console.log(chalk.bold('members') + ' for %s', org)
  var admins = find(ctx, 'core/*')
  var defs = structure.map(({humans}) => [humans.member, humans.maintainer])
  var groups = concat.apply([], concat.apply([], defs).map(x => find(ctx, x)))
  var users = [...new Set(groups)]
  var orgMembers = await Promise.all(
    ctx.ghMembers.map(({name}) =>
      request('GET /orgs/:org/memberships/:name', {org, name}).then(
        ({data}) => ({name, role: data.role})
      )
    )
  )

  orgMembers.forEach(({name, role}) => {
    var expected = admins.includes(name)
      ? 'admin'
      : users.includes(name)
      ? 'member'
      : null

    // Warn if users are not on teams: they shouldn’t be in the org.
    if (!expected) {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should not be in the organization',
        name
      )
      return
    }

    // Warn if users have incorrect rights.
    // Core team members should be admins (owners), other members should not.
    if (role !== expected) {
      console.log(
        '  ' +
          chalk.red('✖') +
          ' @%s should have the role %s instead of %s in the organization',
        name,
        expected,
        role
      )
    }
  })
}
