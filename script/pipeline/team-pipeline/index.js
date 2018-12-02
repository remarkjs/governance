'use strict'

var trough = require('trough')
var repositories = require('./repositories')
var members = require('./members')

module.exports = trough()
  .use(repositories)
  .use(members)
