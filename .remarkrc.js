'use strict'

exports.plugins = [
  require('remark-preset-wooorm'),
  [
    require('./script/list-of-members'),
    {
      teams: require('./unified/teams'),
      humans: require('./unified/humans')
    }
  ]
]
