'use strict'

var trough = require('trough')
var configure = require('./configure')
var requests = require('./requests')
var teams = require('./teams')
var team = require('./team')
var members = require('./members')
var repo = require('./repo')

module.exports = trough()
  .use(configure)
  .use(requests)
  .use(members)
  .use(teams)
  .use(team)
  .use(repo)
