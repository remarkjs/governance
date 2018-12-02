'use strict'

var interpolate = require('./interpolate')

module.exports = find

function find(ctx, expression) {
  var value = interpolate(ctx, expression)
  var [name, role] = value.split('/')
  var team = ctx.teams.find(x => x.name === name)
  var modify = identity
  var members

  if (!team) {
    throw new Error('Could not find team `' + name + '`')
  }

  if (role.charAt(0) === '!') {
    modify = negate
    role = role.slice(1)
  }

  members = team.members

  return Object.keys(members).filter(
    member =>
      role === '*' ||
      modify(members[member] === role) ||
      (role === 'lead' && team.lead === member)
  )
}

function identity(x) {
  return x
}

function negate(x) {
  return !x
}
