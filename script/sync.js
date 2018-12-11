'use strict'

var {promisify} = require('util')
var chalk = require('chalk')
var pSeries = require('p-series')
var collaborators = require('../collaborators')
var teams = require('../unified/teams')
var humans = require('../unified/humans')
var structure = require('./structure')
var run = promisify(require('./pipeline').run)

var config = {
  token: process.env.GH,
  collective: 'unifiedjs',
  structure,
  teams,
  humans,
  collaborators
}

var orgs = [
  'unifiedjs',
  'remarkjs',
  'rehypejs',
  'retextjs',
  'redotjs',
  'mdx-js',
  'micromark',
  'syntax-tree',
  'vfile'
]

pSeries(orgs.map(org => () => run({...config, org}))).then(
  () => {
    console.log(chalk.green('✓') + ' done')
  },
  err => {
    console.log(chalk.red('✖') + ' error')
    console.error(err)
  }
)
