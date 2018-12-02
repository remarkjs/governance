'use strict'

var trough = require('trough')
var collaborators = require('./collaborators')

module.exports = trough().use(collaborators)
