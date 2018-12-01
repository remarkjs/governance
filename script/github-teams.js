'use strict'

/* eslint-disable camelcase */

var octoRest = require('@octokit/rest')
var org = require('../package.json').repository.split('/')[0]
var people = require('..')

var octo = octoRest({headers: {authorization: 'token ' + process.env.GH}})

var childTeamAccept = 'application/vnd.github.hellcat-preview+json'

var mainTeamName = 'members'
var expectedTeams = [
  {
    name: 'emeriti',
    description: 'A team consisting of all inactive members',
    privacy: 'closed'
  },
  {
    name: 'members',
    description: 'A team consisting of all members (active or not)',
    privacy: 'closed'
  },
  {
    name: 'mergers',
    description: 'A team consisting of all active members with release rights',
    privacy: 'closed'
  },
  {
    name: 'releasers',
    description: 'A team consisting of all active members with write rights',
    privacy: 'closed'
  }
]

var rights = {
  members: 'pull',
  emeriti: 'pull',
  mergers: 'push',
  releasers: 'admin'
}

var access = {
  members: {member: '*', maintainer: 'release'},
  emeriti: {member: 'emeritus', maintainer: 'release'},
  mergers: {member: 'merge', maintainer: 'release'},
  releasers: {member: 'release', maintainer: 'lead'}
}

init()

async function init() {
  // Get current teams.
  var teams = (await octo.request('GET /orgs/:org/teams', {org})).data

  // We’re nesting all other teams under the main team, so make sure it exists.
  var mainTeam = teams.find(team => team.name === mainTeamName)

  if (mainTeam) {
    console.log('Main team %s exists', mainTeamName)
  } else {
    mainTeam = (await octo.request('POST /orgs/:org/teams', {
      org,
      ...expectedTeams.find(team => team.name === mainTeamName)
    })).data

    teams.push(mainTeam)
    console.log('Main team %s created', mainTeamName)
  }

  // Add missing teams (we could in the future sync descriptions and privacy).
  var parentId = mainTeam.id
  var teamNames = teams.map(name)
  var missing = expectedTeams.filter(team => !teamNames.includes(team.name))

  if (missing.length === 0) {
    console.log('Subteams exist')
  } else {
    await Promise.all(
      missing.map(team =>
        octo
          .request('POST /orgs/:org/teams', {
            org,
            parent_team_id: parentId,
            ...team,
            headers: {accept: childTeamAccept}
          })
          .then(res => {
            var team = res.data
            teamNames.push(team.name)
            teams.push(team)
            console.log('Subteam %s created', team.name)
            return team
          })
      )
    )
  }

  // Get all repos under the org.
  var allRepos = await octo.paginate('GET /orgs/:org/repos', {org})
  var allReposByName = allRepos.map(name)

  // Update repos and their rights for each team.
  await Promise.all(
    teams.map(team => {
      return octo
        .paginate('GET /teams/:team/repos', {
          team: team.id,
          headers: {accept: childTeamAccept}
        })
        .then(repos => {
          var reposByName = repos.map(name)
          var right = rights[team.name]

          // Add missing repos
          var add = allReposByName
            .filter(name => !reposByName.includes(name))
            .map(name =>
              octo
                .request('PUT /teams/:team/repos/:owner/:repo', {
                  team: team.id,
                  owner: org,
                  repo: name,
                  permission: right,
                  headers: {accept: childTeamAccept}
                })
                .then(x => {
                  console.log(
                    '  Add repo %s to team %s with %s permissions',
                    name,
                    team.name,
                    right
                  )
                  return x
                })
            )

          // Fix permissions on existing repos if they don’t match.
          var change = repos
            .filter(repo => {
              var perms = repo.permissions
              var perm = perms.admin ? 'admin' : perms.push ? 'push' : 'pull'
              return perm !== right
            })
            .map(name)
            .map(name =>
              octo
                .request('PUT /teams/:team/repos/:owner/:repo', {
                  team: team.id,
                  owner: org,
                  repo: name,
                  permission: right,
                  headers: {accept: childTeamAccept}
                })
                .then(x => {
                  console.log(
                    '  Set permissions to %s for %s on repo %s',
                    right,
                    team.name,
                    name
                  )
                  return x
                })
            )

          // No need to remove repos.
          return Promise.all([].concat(add, change))
        })
        .then(_ => {
          console.log('Repositories for %s are up to date', team.name)
        })
    })
  )

  // Update members for each team.
  await Promise.all(
    teams.map(async team => {
      var info = access[team.name]
      var maintainers = people
        .filter(filterBy(info.maintainer))
        .map(x => x.github)
      var members = people
        .filter(filterBy(info.member))
        .filter(user => !maintainers.includes(user.github))
        .map(x => x.github)

      // Get all current members.
      var currentMembers = await octo.paginate('GET /teams/:team/members', {
        team: team.id,
        headers: {accept: childTeamAccept}
      })

      // Get their roles.
      var current = await Promise.all(
        currentMembers.map(({login}) =>
          octo
            .request('GET /teams/:team/memberships/:name', {
              team: team.id,
              name: login,
              headers: {accept: childTeamAccept}
            })
            .then(({data}) => ({name: login, role: data.role}))
        )
      )

      // Update roles for misclassified current members.
      var change = current
        .filter(
          ({role, name}) =>
            !(role === 'maintainer' ? maintainers : members).includes(name)
        )
        .map(async user => {
          var role = maintainers.includes(user.name)
            ? 'maintainer'
            : members.includes(user.name)
            ? 'member'
            : null

          // Warn and exit for people who shouldn’t be in the team.
          if (!role) {
            console.error(
              '  Human %s should not have access to team %s',
              user.name,
              team.name
            )

            return
          }

          var {data} = await octo.request(
            'PUT /teams/:team/memberships/:name',
            {team: team.id, name: user.name, role}
          )

          console.log(
            'TODO: updating permissions for a user ',
            user,
            role,
            team.id,
            data
          )
        })

      // Add missing people. Note that this will add pending people again.
      var add = maintainers
        .concat(members)
        .filter(name => !current.some(x => x.name === name))
        .map(async name => {
          var role = maintainers.includes(name) ? 'maintainer' : 'member'

          await octo.request('PUT /teams/:team/memberships/:name', {
            team: team.id,
            name,
            role
          })

          console.log(
            '  Add human %s to team %s with role %s',
            name,
            team.name,
            role
          )
        })

      await Promise.all(change.concat(add))

      console.log('Humans for %s are up to date', team.name)
    })
  )
}

function name(team) {
  return team.name
}

function filterBy(role) {
  return user => role === '*' || user.roles.includes(role)
}
