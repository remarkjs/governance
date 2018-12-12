'use strict'

var chalk = require('chalk')
var pSeries = require('p-series')
var difference = require('arr-diff')
var find = require('../util/find')
var legacyId = require('../util/to-legacy-id')

module.exports = members

async function members(info) {
  const {structure, ctx, team} = info
  const {id} = team
  const {query, request} = ctx
  const {name, humans} = structure
  const maintainers = find(ctx, humans.maintainer)
  const members = difference(find(ctx, humans.member), maintainers)
  const all = members.concat(maintainers)

  // To do: paginate.
  const response = await query(
    `
      query($id: ID!) {
        node(id: $id) {
          ... on Team {
            members(first: 100, membership: IMMEDIATE) {
              edges {
                role
                node {
                  login
                }
              }
            }
            invitations(first: 100) {
              nodes {
                invitee {
                  login
                }
                role
              }
            }
          }
        }
      }
    `,
    {id}
  )

  const node = response.data.node
  const invitations = node.invitations.nodes
  const ghMembers = node.members.edges.map(({node, role}) => ({
    login: node.login,
    role: role.toLowerCase()
  }))

  // To do: warn on invitations.
  if (invitations.length !== 0) {
    console.log('To do: add invitations support: ', invitations)
  }

  // Remove
  ghMembers
    .filter(({login}) => !all.find(y => y === login))
    .forEach(({login}) => {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should not be in team %s',
        login,
        name
      )
    })

  // Current members with wrong roles.
  ghMembers.forEach(({role, login}) => {
    var expected = maintainers.includes(login) ? 'maintainer' : 'member'

    // Core team members are always maintainers, regardless of what’s otherwise
    // expected.
    // To do: don’t hardcode this.
    if (find(ctx, 'core/!emeritus')) {
      return
    }

    if (expected !== role) {
      console.log(
        '  ' + chalk.red('✖') + ' @%s should have role %s instead of %s in %s',
        login,
        expected,
        role,
        name
      )
    }
  })

  // Add missing humans.
  // Note that this will add pending humans again.
  // To do: ignore pending humans.
  await pSeries(
    all
      .filter(name => !ghMembers.find(y => y.login === name))
      .map(name => () => {
        const role = maintainers.includes(name) ? 'maintainer' : 'member'
        return request('PUT /teams/:team/memberships/:name', {
          name,
          team: legacyId(id),
          role
        }).then(() => {
          console.log(
            '  ' + chalk.green('✔') + ' add @%s to %s as %s',
            name,
            structure.name,
            role
          )
        })
      })
  )
}
