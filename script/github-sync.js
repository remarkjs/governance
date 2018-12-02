'use strict'

var chalk = require('chalk')
var pack = require('../package.json')
var collaborators = require('../collaborators')
var teams = require('../unified/teams')
var humans = require('../unified/humans')
var structure = require('./structure')
var pipeline = require('./pipeline')

pipeline.run(
  {
    token: process.env.GH,
    collective: 'unifiedjs',
    org: pack.repository.split('/')[0],
    structure,
    teams,
    humans,
    collaborators
  },
  function(err) {
    if (err) throw err
    console.log(chalk.green('✓') + ' done')
  }
)
