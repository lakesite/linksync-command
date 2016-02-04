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


const
  fs = require('fs'),
  JSZip = require('jszip'),
  prettyjson = require('prettyjson'),
  q = require('q'),
  request = require('request'),

  grouplib = require('./groups'),
  linkgrouplib = require('./linkgroups'),
  linklib = require('./links'),
  linktaglib = require('./linktags'),
  settings = require('./settings'),
  taglib = require('./tags');


var self = module.exports = {
  export_groups: function() {
    var deferred = q.defer();

    grouplib.get_groups().then(function(groups) {
      return deferred.resolve('"groups": ' + JSON.stringify(groups));
    }).catch(function(e) {
      console.log('Error listing groups: ' + e.error.message);
      return deferred.resolve();
    });

    return deferred.promise;
  },

  export_linkgroups: function() {
    var deferred = q.defer();

    linkgrouplib.get_linkgroups().then(function(linkgroups) {
      return deferred.resolve('"linkgroups": ' + JSON.stringify(linkgroups));
    }).catch(function(e) {
      console.log('Error listing linkgroups: ' + e.error.message);
      return deferred.resolve();
    });

    return deferred.promise;
  },

  export_links: function() {
    var deferred = q.defer();

    linklib.get_links().then(function(links) {
      return deferred.resolve('"links": ' + JSON.stringify(links));
    }).catch(function(e) {
      console.log('Error listing links: ' + e.error.message);
      return deferred.resolve();
    });

    return deferred.promise;
  },

  export_linktags: function() {
    var deferred = q.defer();

    linktaglib.get_linktags().then(function(linktags) {
      return deferred.resolve('"linktags": ' + JSON.stringify(linktags));
    }).catch(function(e) {
      console.log('Error listing link tags: ' + e.error.message);
      return deferred.resolve();
    });

    return deferred.promise;
  },

  export_tags: function() {
    var deferred = q.defer();

    taglib.get_tags().then(function(tags) {
      return deferred.resolve('"tags": ' + JSON.stringify(tags));
    }).catch(function(e) {
      console.log('Error listing tags: ' + e.error.message);
      return deferred.resolve();
    });

    return deferred.promise;
  },

  export: function() {
    var deferred = q.defer();

    console.log('Running exporter.');

    q.allSettled([
      self.export_groups(),
      self.export_linkgroups(),
      self.export_links(),
      self.export_linktags(),
      self.export_tags()
    ]).then(function(results) {
      var data = "{" + results.map(function(result) { return result.value; }) + "}";
      var zip = new JSZip();
      zip.file("export.json", data, { binary: false });
      var buffer = zip.generate({type: "nodebuffer"});
      fs.writeFile(settings.get('exportpath') + "export.zip", buffer, function(err) { if (err) throw err; });

      console.log('done');
      return deferred.resolve();
    });


    return deferred.promise;
  }
}
