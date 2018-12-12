'use strict'

var trough = require('trough')
var packages = require('./packages')
var collaborators = require('./collaborators')

module.exports = trough().use(packages)
// .use(collaborators)
