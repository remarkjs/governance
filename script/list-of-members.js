'use strict'

var zone = require('mdast-zone')
var u = require('unist-builder')
var parseAuthor = require('parse-author')

var gh = 'https://github.com'
var mailto = 'mailto:'

module.exports = listOfMembers

function listOfMembers(options) {
  var humans = options.humans

  return transform

  function transform(tree) {
    options.teams.forEach(function(team) {
      zone(tree, 'members-' + team.name, factory(team))
    })
  }

  function factory(team) {
    return replace

    function replace(start, nodes, end) {
      var members = team.members
      var all = Object.keys(members)
      var current = all.filter(x => members[x] !== 'emeritus')
      var emeriti = all.filter(x => members[x] === 'emeritus')
      var content = [
        u('heading', {depth: 2}, [u('text', 'Members')]),
        list(current, team)
      ]

      if (emeriti.length !== 0) {
        content.push(
          u('heading', {depth: 2}, [u('text', 'Emeriti')]),
          list(emeriti, team)
        )
      }

      return [start].concat(content, end)
    }
  }

  function list(handles, team) {
    return u(
      'list',
      {ordered: false},
      handles.map(function(handle) {
        var human = parseAuthor(humans[handle])

        var content = [
          u('text', (human.name || handle) + '\n('),
          u('link', {url: gh + '/' + handle}, [
            u('strong', [u('text', '@' + handle)])
          ]),
          u('text', ')')
        ]

        if (human.email) {
          content.push(
            u('text', '\n<'),
            u('link', {url: mailto + human.email}, [u('text', human.email)]),
            u('text', '>')
          )
        }

        if (handle === team.lead) {
          content.push(
            u('text', '\n('),
            u('strong', [u('text', 'lead')]),
            u('text', ')')
          )
        }

        return u('listItem', [u('paragraph', content)])
      })
    )
  }
}
