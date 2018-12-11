require('dotenv').config()

const graphql = require('@octokit/graphql')

const headers = {
  authorization: `token ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.hawkgirl-preview+json'
}

const getJsonFile = async ({filename, org, repo}) => {
  try {
    const {data} = await graphql(
      `
      query {
        repository(owner: "${org}", name: "${repo}") {
          object(expression: "master:${filename}") {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
      {
        headers
      }
    )

    if (data.repository && data.repository.object) {
      const text = data.repository.object.text
      return JSON.parse(text)
    }
  } catch (error) {
    console.log(error)
  }
}

module.exports = async ({org, repo}) => {
  try {
    const {data: packageData} = await graphql(
      `
      query {
        repository(owner: "${org}", name: "${repo}") {
          dependencyGraphManifests {
            nodes {
              id
              blobPath
              filename
            }
          }
        }
      }
    `,
      {
        headers
      }
    )

    const packages = packageData.repository.dependencyGraphManifests.nodes
    const packageContents = await Promise.all(
      packages.map(p => getJsonFile({...p, org, repo}))
    )

    return packageContents
      .filter(Boolean)
      .filter(pkg => !pkg.private)
      .map(pkg => pkg.name)
  } catch (error) {
    console.log(error)
  }
}
