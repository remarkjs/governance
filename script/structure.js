module.exports = [
  {
    name: 'emeritus',
    description: 'Past members of the @:org organization team',
    repositories: {scope: ':org/*', right: 'pull'},
    humans: {member: ':orgTeam/emeritus', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'members',
    description: 'The @:org organization team',
    repositories: {scope: ':org/*', right: 'pull'},
    humans: {member: ':orgTeam/!emeritus', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'mergers',
    parent: 'members',
    description: '@:org members with write rights',
    repositories: {scope: ':org/*', right: 'push'},
    humans: {member: ':orgTeam/write', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'releasers',
    parent: 'members',
    description: '@:org members with release rights',
    repositories: {scope: ':org/*', right: 'admin'},
    humans: {member: ':orgTeam/admin', maintainer: ':orgTeam/lead'}
  },
  {
    name: 'moderators',
    description: 'The @:collective collective moderation team',
    repositories: {scope: ':org/*', right: 'admin'},
    humans: {member: 'moderation/*', maintainer: ':orgTeam/lead'}
  },
  {
    name: 'core',
    description: 'The @:collective collective core team',
    repositories: {scope: ':org/*', right: 'admin'},
    humans: {member: 'core/*', maintainer: ':orgTeam/lead'}
  }
]
