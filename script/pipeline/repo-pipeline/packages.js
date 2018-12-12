'use strict'

var {promisify} = require('util')
var chalk = require('chalk')
var pSeries = require('p-series')
var {dependencyGraphAccept} = require('../constants')
var run = promisify(require('../package-pipeline').run)

module.exports = packages

async function packages(info) {
  const {repo, ctx} = info
  const {org, query} = ctx
  const {name} = repo

  const {data} = await query(
    `
      query($org: String!, $name: String!) {
        repository(owner: $org, name: $name) {
          dependencyGraphManifests() {
            nodes {
              filename
              exceedsMaxSize
              parseable
            }
          }
        }
      }
    `,
    {
      org,
      name,
      headers: {Accept: dependencyGraphAccept}
    }
  )

  const manifests = data.repository.dependencyGraphManifests.nodes

  manifests
    .filter(({parseable}) => !parseable)
    .forEach(({filename}) => {
      console.log(
        '  ' + chalk.red('✖') + ' manifest %s in %s is not parseable',
        filename,
        name
      )
    })

  manifests
    .filter(({exceedsMaxSize}) => exceedsMaxSize)
    .forEach(({filename}) => {
      console.log(
        '  ' + chalk.red('✖') + ' manifest %s in %s is too big',
        filename,
        name
      )
    })

  console.log(chalk.bold('packages') + ' for %s', name)

  await pSeries(
    manifests
      .filter(x => x.parseable && !x.exceedsMaxSize)
      .map(pkg => () => run({ctx, repo, pkg}))
  )
}
