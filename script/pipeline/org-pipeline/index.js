'use strict'

var trough = require('trough')
var configure = require('./configure')
var members = require('./members')
var teams = require('./teams')
var repos = require('./repos')

module.exports = trough()
  .use(configure)
  // .use(members)
  // .use(teams)
  .use(repos)
