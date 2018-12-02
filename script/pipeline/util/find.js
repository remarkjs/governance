'use strict'

var interpolate = require('./interpolate')

module.exports = find

function find(ctx, expression) {
  var value = interpolate(ctx, expression)
  var [name, role] = value.split('/')
  var team = ctx.teams.find(x => x.name === name)
  var members

  if (!team) {
    throw new Error('Could not find team `' + name + '`')
  }

  members = team.members

  return Object.keys(members).filter(
    member =>
      role === '*' ||
      members[member] === role ||
      (role === 'lead' && team.lead === member)
  )
}
