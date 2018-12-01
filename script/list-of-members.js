'use strict'

var zone = require('mdast-zone')
var u = require('unist-builder')
var members = require('..')

var gh = 'https://github.com'
var mailto = 'mailto:'

module.exports = listOfMembers

function listOfMembers() {
  return transform
}

function transform(tree) {
  zone(tree, 'members', replace)

  function replace(start, nodes, end) {
    var current = members.filter(x => !x.roles.includes('emeritus'))
    var emeriti = members.filter(x => x.roles.includes('emeritus'))
    var content = [
      u('heading', {depth: 2}, [u('text', 'Members')]),
      list(current)
    ]

    if (emeriti.length !== 0) {
      content.push(
        u('heading', {depth: 2}, [u('text', 'Emeriti')]),
        list(emeriti)
      )
    }

    return [start].concat(content, end)
  }
}

function list(members) {
  return u(
    'list',
    {ordered: false},
    members.map(function(member) {
      var content = [
        u('text', member.name + '\n('),
        u('link', {url: gh + '/' + member.github}, [
          u('strong', [u('text', '@' + member.github)])
        ]),
        u('text', ')\n<'),
        u('link', {url: mailto + member.email}, [u('text', member.email)]),
        u('text', '>')
      ]

      if (member.roles.includes('lead')) {
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
