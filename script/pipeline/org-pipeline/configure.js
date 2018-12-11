'use strict'

var rest = require('@octokit/rest')
var graphql = require('@octokit/graphql')

module.exports = configure

function configure(config) {
  var {org, token} = config
  var team = config.teams.find(x => {
    return x.scope.split('/')[0] === org
  })

  if (!token) {
    throw new Error('Missing GitHub token. Expected `config.token` to be set')
  }

  if (!team) {
    throw new Error('Could not find team belonging to `' + org + '`')
  }

  var query = graphql.defaults({headers: {authorization: 'token ' + token}})
  var {request, paginate} = rest({headers: {authorization: 'token ' + token}})

  return {
    ...config,
    orgTeam: team.name,
    query: wrap(query),
    request: wrap(request),
    paginate: wrap(paginate)
  }
}

function wrap(fn) {
  return wrapped

  function wrapped() {
    var args = [...arguments]

    return attempt().catch(retry)

    function attempt() {
      return fn.apply(null, args)
    }

    function retry(err) {
      console.log('wrap err: ', err)
      var after = err && err.status === 403 ? err.headers['retry-after'] : null

      if (!after) {
        throw err
      }

      return new Promise(executor)

      function executor(resolve, reject) {
        setTimeout(delayed, parseInt(after, 10) * 1000)

        function delayed() {
          attempt().then(resolve, reject)
        }
      }
    }
  }
}
