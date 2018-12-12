'use strict'

var {promisify} = require('util')
var chalk = require('chalk')
var pSeries = require('p-series')
var run = promisify(require('../repo-pipeline').run)

module.exports = repos

async function repos(ctx) {
  const {org, query} = ctx

  console.log(chalk.bold('repos') + ' for %s', org)

  // To do: paginate.
  const {data} = await query(
    `
      query($org: String!) {
        organization(login: $org) {
          repositories(first: 100) {
            nodes {
              defaultBranchRef {
                name
              }
              name
            }
          }
        }
      }
    `,
    {org}
  )

  const repositories = data.organization.repositories.nodes

  await pSeries(repositories.map(repo => () => run({ctx, repo})))
}
