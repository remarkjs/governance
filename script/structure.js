module.exports = [
  {
    name: 'members',
    description: 'All @:org members, active or inactive',
    repositories: {scope: ':org/*', right: 'pull'},
    humans: {member: ':orgTeam/*', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'emeriti',
    parent: 'members',
    description: 'All inactive @:org members',
    repositories: {scope: ':org/*', right: 'pull'},
    humans: {member: ':orgTeam/emeritus', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'mergers',
    parent: 'members',
    description: 'All active @:org members with write rights',
    repositories: {scope: ':org/*', right: 'push'},
    humans: {member: ':orgTeam/write', maintainer: ':orgTeam/admin'}
  },
  {
    name: 'releasers',
    parent: 'members',
    description: 'All active @:org members with release rights',
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
