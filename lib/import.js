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
  oboe = require('oboe'),
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
  export_zip_file: settings.get('exportpath') + 'export.zip',
  import_file: settings.get('exportpath') + 'import.json',

  unzip_data: function() {
    var deferred = q.defer();

    fs.stat(self.export_zip_file, function(err, stat) {
      if (err == null) {
        fs.readFile(self.export_zip_file, function(err, data) {
          var zip = new JSZip(data);
          fs.writeFile(self.import_file, zip.file("export.json").asText(), function(err) {
            if (err == null) {
              deferred.resolve();
            } else {
              deferred.resolve(err);
            }
          });
        });
      } else {
        deferred.resolve('Could not stat export file: ' + export_zip_file + ', ' + err.code);
      }
    });

    return deferred.promise;
  },

  import: function() {
    self.unzip_data().then(function(err) {
      if (err == null) {
        console.log('Performing import.');
        var read_stream = fs.createReadStream(self.import_file);
        oboe(read_stream)
        .on('node', {
          'groups.*': function(group) {
            grouplib.add_group(group.name, group.id).then(function(group) {
              console.log('Group added: ' + JSON.stringify(group));
            });
          },
          'tags.*': function(tag) {
            taglib.add_tag(tag.name, tag.id).then(function(tag) {
              console.log("Tag added: " + JSON.stringify(tag));
            });
          },
          'links.*': function(link) {
            linklib.add_link(link.url, link.description, link.id).then(function(link) {
              console.log("Link added: " + JSON.stringify(link));
            });
          },
          'linktags.*': function(linktag) {
            linktaglib.add_linktag(linktag.linkId, linktag.tagId, linktag.id).then(function(linktag) {
              console.log("Linktag added: " + JSON.stringify(linktag));
            });
          },
          'linkgroups.*': function(linkgroup) {
            linkgrouplib.add_linkgroup(linkgroup.linkId, linkgroup.groupId, linkgroup.id).then(function(linkgroup) {
              console.log("Linkgroup added: " + JSON.stringify(linkgroup));
            });
          }
        })
        .on('done', function() {
          console.log('Finished processing ' + self.import_file);
        });
      } else {
        console.log("Error: " + err);
      }
    }).catch(function(error) {
      console.log('Error: ' + error);
    });
  }
}
