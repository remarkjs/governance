'use strict'

exports.teams = teams
exports.team = team
exports.repos = repos
exports.users = users

function teams({data}) {
  return data.map(x => team({data: x}))
}

function team({data}) {
  var {id, name, description} = data
  return {id, name, description}
}

function repos(repos) {
  return repos.map(({id, name, description, permissions}) => ({
    id,
    name,
    description,
    permissions
  }))
}

function users(users) {
  return users.map(({login, role, permissions}) => ({
    name: login,
    role,
    permissions
  }))
}
