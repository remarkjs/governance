'use strict'

var trough = require('trough')
var request = require('./request')

module.exports = trough().use(request)
