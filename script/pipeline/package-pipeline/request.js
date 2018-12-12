'use strict'

module.exports = request

async function request(info) {
  const {ctx, pkg, repo} = info
  const {org, query} = ctx
  const {name, defaultBranchRef} = repo

  const {data} = await query(
    `
      query($org: String!, $name: String!, $target: String!) {
        repository(owner: $org, name: $name) {
          object(expression: $target) {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
    {
      org,
      name,
      target: [defaultBranchRef.name, pkg.filename].join(':')
    }
  )

  return {
    pkg: JSON.parse(data.repository.object.text),
    repo,
    ctx
  }
}
