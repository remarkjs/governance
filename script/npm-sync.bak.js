'use strict'

var octo = require('@octokit/graphql')

var token = process.env.GH
var graphql = octo.defaults({headers: {authorization: 'token ' + token}})

var accept = 'application/vnd.github.hawkgirl-preview+json'

init()

async function init() {
  // . let {data} = await graphql(
  //   `
  //     {
  //       organization(login: "remarkjs") {
  //         repositories(first: 2) {
  //           pageInfo {
  //             endCursor
  //             hasNextPage
  //           }
  //           edges {
  //             node {
  //               name
  //               dependencyGraphManifests {
  //                 nodes {
  //                   filename
  //                   blobPath
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {headers: {accept}}
  // )
  //
  // console.log('d:1-2 ', data)
  //
  // let key = data.organization.repositories.pageInfo.endCursor
  //
  // let res = await graphql(
  //   `
  //     query page($id: String!) {
  //       organization(login: "remarkjs") {
  //         repositories(first: 2, after: $id) {
  //           pageInfo {
  //             endCursor
  //             hasNextPage
  //           }
  //           edges {
  //             node {
  //               name
  //               dependencyGraphManifests {
  //                 nodes {
  //                   filename
  //                   blobPath
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {id: key, headers: {accept}}
  // )
  //
  // console.log('res: ', res.data)

  let x = await graphql(
    `
      {
        repository(owner: "remarkjs", name: "remark") {
          object(expression: "master:packages/remark-stringify/package.json") {
            ... on Blob {
              text
            }
          }
        }
      }
    `,
    {headers: {accept}}
  )

  console.log('d:3-4 ', x)
}

// `
//   {
//     repository(owner: "remarkjs", name: "remark") {
//       dependencyGraphManifests {
//         nodes {
//           dependenciesCount
//           filename
//           blobPath
//         }
//       }
//     }
//   }
// `,
