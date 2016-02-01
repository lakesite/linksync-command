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
  request = require('request'),
  q = require('q'),

  settings = require('./settings');


var self = module.exports = {
  add_linktag: function(link_id, tag_id) {
    var deferred = q.defer();
    request.post(
      settings.API + '/linktags', { json: { linkId: link_id, tagId: tag_id } },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.reject(new Error(body));
        }
      }
    );

    return deferred.promise;
  },

  // add link tags given one link_id, and an array of tag objects.
  // todo, change this to an array of tag ids
  add_linktags: function(link_id, tags) {
    var deferred = q.defer();
    var promises = [];

    tags.forEach(function(tag) {
      var tag_deferred = q.defer();
      self.add_linktag(link_id, tag.id).then(function(lt) {
        tag_deferred.resolve(lt);
      });
      promises.push(tag_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  }

}
