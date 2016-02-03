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
  get_by_groupid: function(group_id) {
    var deferred = q.defer();
    request.get(
      settings.API + '/linkgroups?filter[where][groupId]=' + group_id, { json: true },
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

  get_by_linkid: function(link_id) {
    var deferred = q.defer();
    request.get(
      settings.API + '/linkgroups?filter[where][linkId]=' + link_id, { json: true },
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

  add_linkgroup: function(link_id, group_id) {
    var deferred = q.defer();
    request.post(
      settings.API + '/linkgroups', { json: { linkId: link_id, groupId: group_id } },
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

  add_linkgroups: function(link_id, groups) {
    var deferred = q.defer();
    var promises = [];

    groups.forEach(function(group) {
      var group_deferred = q.defer();
      self.add_linkgroup(link_id, group.id).then(function(lg) {
        group_deferred.resolve(lg);
      });
      promises.push(group_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  }

}
