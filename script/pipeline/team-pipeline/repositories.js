'use strict'

var chalk = require('chalk')
var pSeries = require('p-series')
var {Minimatch} = require('minimatch')
var {childTeamAccept} = require('../constants')
var interpolate = require('../util/interpolate')
var legacyId = require('../util/to-legacy-id')

module.exports = repositories

// Add repositories to the team with the correct permissions.
async function repositories(info) {
  const {ctx, structure, team} = info
  const {org, query, request} = ctx
  const {repositories} = structure
  const {id} = team
  const {right, scope} = repositories
  const match = new Minimatch(interpolate(ctx, scope))

  // To do: load org repositories only once, not for every team.
  // To do: paginate.
  const {data} = await query(
    `
      query($org: String!, $id: ID!) {
        node(id: $id) {
          ... on Team {
            repositories(first: 100) {
              edges {
                permission
                node {
                  nameWithOwner
                  name
                }
              }
            }
          }
        }
        organization(login: $org) {
          repositories(first: 100) {
            nodes {
              nameWithOwner
              name
            }
          }
        }
      }
    `,
    {id, org}
  )

  const ghRepos = data.organization.repositories.nodes
  const teamRepos = data.node.repositories.edges.map(({permission, node}) => ({
    ...node,
    permission
  }))

  const expected = ghRepos.filter(({nameWithOwner}) =>
    match.match(nameWithOwner)
  )

  // Remove
  teamRepos
    .filter(x => !expected.find(y => y.name === x.name))
    .forEach(x => {
      console.log(
        '  ' + chalk.red('✖') + ' %s should not be governed by %s',
        x.name,
        structure.name
      )
    })

  const incorrect = [].concat(
    // Current repos with wrong permissions.
    teamRepos.filter(({permission}) => permission !== right),
    // Missing repos
    expected.filter(x => !teamRepos.find(y => y.name === x.name))
  )

  await pSeries(
    incorrect.map(({nameWithOwner}) => () => {
      request('PUT /teams/:team/repos/:nameWithOwner', {
        team: legacyId(id),
        nameWithOwner,
        permission: right,
        headers: {accept: childTeamAccept}
      }).then(() => {
        console.log(
          '  ' + chalk.green('✔') + ' set permissions for %s on %s to %s',
          structure.name,
          nameWithOwner,
          right
        )
      })
    })
  )
}
