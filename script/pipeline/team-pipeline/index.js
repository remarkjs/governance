'use strict'

var trough = require('trough')
var request = require('./request')
var create = require('./create')
var update = require('./update')
var members = require('./members')
var repositories = require('./repositories')

module.exports = trough()
  .use(request)
  .use(create)
  .use(update)
  .use(members)
  .use(repositories)
