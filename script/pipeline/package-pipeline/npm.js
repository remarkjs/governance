'use strict'

var chalk = require('chalk')

module.exports = npm

async function npm(info) {
  const {ctx, pkg, repo} = info
  const {private: priv, name} = pkg

  if (priv) {
    console.log('  ' + chalk.blue('ℹ') + ' package %s is private', name)
    return
  }

  // Alright, some pseudo code.
  // First.  The back story: npm is hard because it doesn’t have an API.
  // So there’s no tokens, and everything ’ll have to go through the CLI
  // instead.
  // There’s two commands we can use:
  // - `npm team`, to add, list, and remove teams; or to add, list, and remove
  //   members.
  // - `npm access`, to add/change/list/remove rights per team (or on packages)
  // Generally, we’d like to set up teams and rights correctly not here, but
  // somewhere more global.
  // In this case, walking over packages, we should check that all maintainers
  // of a package are part of the npm org, and warn if not!
  //
  // More info: https://docs.npmjs.com/cli/access
  // More info: https://docs.npmjs.com/cli/team
  //
  // Ah, that wasn’t pseudo-code at all. Just some story.
  //
  // Here’s a TODO list, not nessecarily in this file.
  // * Get the npm org for the GH org (currently there’s just remarkjs for
  //   remarkjs, we need to add the rest, and maybe in the future a mapping
  //   between different names?)
  // * Get all teams
  //   `npm team ls remarkjs`
  // * Get all members
  //   `npm team ls remarkjs:foo`
  // * Make sure the correct members exist (to add:
  //   `npm team add remarkjs:foo wooorm`):
  // * Get all projects
  //   `npm access ls-packages remarkjs`
  // * Make sure the correct teams exist (to add:
  //   `npm team create remarkjs:foo`):
  //   * `developers` for releasers - I think this has read-write rights by
  //     default?
  //   * `members` for read-only rights? Maybe read-only is paid-only
  // * And then here, in this file, make sure the project exists:
  //   `npm access grant <read-only|read-write> remarkjs:foo package`
  // * Also here, make sure no non-members are in the contributors:
  //   `npm owner ls package`:
  //

  console.log('repo: ', repo, pkg)
  throw 1
}
