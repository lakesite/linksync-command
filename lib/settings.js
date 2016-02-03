/*
 * linksync commander -- Command line interface to LinkSync
 * Copyright (C) 2016 Andrew Duncan
 *
 * This package is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * found in the file LICENSE that should have accompanied this file.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var
  fs = require('fs'),
  config = require('nconf'),
  path = require('path');

config.overrides({
  'version': '0.0.1'
});

config.defaults({
  API: 'http://localhost:5979/api',
  syncroot: path.join(__dirname, "../syncroot/"),
});

config.env();
config.use('file', { file: path.join(__dirname, "../config.json") });

var self = module.exports = config;
