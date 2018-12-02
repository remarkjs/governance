'use strict'

var {promisify} = require('util')
var chalk = require('chalk')
var run = promisify(require('../repo-pipeline').run)

module.exports = repo

async function repo(ctx) {
  console.log(chalk.bold('repos') + ' for %s', ctx.org)
  var results = await Promise.all(ctx.ghRepos.map(x => run({ctx, repo: x})))

  return {
    ...ctx,
    ghRepos: results.map(x => x.repo)
  }
}
