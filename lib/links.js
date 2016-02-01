#!/usr/bin/node --harmony

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

  API = 'http://localhost:5979/api';


var self = module.exports = {
  get_link: function(id) {
    var deferred = q.defer();

    request.get(
      API + '/links/' + id,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.resolve(body);
        }
      }
    );
    return deferred.promise;
  },

  // get tag names and ids
  get_links: function() {
    var deferred = q.defer();

    request.get(
      API + '/links',
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.resolve(body);
        }
      }
    );
    return deferred.promise;
  },

  // get links by tag id
  get_tag_links: function(tag_id) {
    var deferred = q.defer();
    var tags = {};

    request.get(
      API + '/tags/' + tag_id + '/links',
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.resolve(tags);
        }
      }
    );
    return deferred.promise;
  },

  // link exists?
  url_exists: function(url) {
    var deferred = q.defer();
    request.get(
      API + '/links/findOne?filter[where][url]=' + url,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(true);
        } else {
          return deferred.resolve(false);
        }
      }
    );
    return deferred.promise;
  },

  add_link: function(url, description) {
    var deferred = q.defer();
    request.post(
      API + '/links', { json: { url: url, description: description } },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.reject(body);
        }
      }
    );

    return deferred.promise;
  }

}
