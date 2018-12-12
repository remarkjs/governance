'use strict'

var trough = require('trough')
var request = require('./request')
var npm = require('./npm')

module.exports = trough()
  .use(request)
  .use(npm)
