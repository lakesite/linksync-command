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
  links_by_id: function(tag_id) {
    var deferred = q.defer();

    request.get(
      settings.API + '/tags/' + tag_id + '/links',
      {
        json: true
      },
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

  tag_by_id: function(id) {
    var deferred = q.defer();

    request.get(
      settings.API + '/tags/' + id,
      {
        json: true
      },
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

  rename_by_id: function(id, name) {
    var deferred = q.defer();

    request.put(
      settings.API + '/tags/' + id,
      {
        json: {
          name: name
        }
      },
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

  delete_by_id: function(id) {
    var deferred = q.defer();

    request.del(
      settings.API + '/tags/' + options.delete,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.reject(new Error(body));
        }
    });
    return deferred.promise;
  },

  // get tag names and ids
  get_tags: function() {
    var deferred = q.defer();
    var tags = {}; // any defaults if needed

    request.get(
      settings.API + '/tags',
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

  tag_by_name: function(tagname) {
    var deferred = q.defer();
    request.get(
      settings.API + '/tags/findOne?filter[where][name]=' + tagname,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.resolve({});
        }
      }
    );
    return deferred.promise;

  },

  // tag exists?
  tagname_exists: function(tagname) {
    var deferred = q.defer();
    request.get(
      settings.API + '/tags/findOne?filter[where][name]=' + tagname,
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

  add_tag: function(name) {
    var deferred = q.defer();
    request.post(
      settings.API + '/tags', { json: { name: name } },
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

  // create tags,
  // return tags that have been added and entities that matched names.
  add_tags: function(tags) {
    var deferred = q.defer();
    var promises = [];

    tags.forEach(function(tag) {
      var tag_deferred = q.defer();
      self.tag_by_name(tag).then(function(entity) {
        if (!Object.keys(entity).length) {
          self.add_tag(tag).then(function(t) {
            tag_deferred.resolve(t);
          });
        } else {
          tag_deferred.resolve(entity);
        }
      });
      promises.push(tag_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  }

}
