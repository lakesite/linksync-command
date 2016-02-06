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
  q = require('q'),
  request = require('request'),

  settings = require('./settings');


var self = module.exports = {
  links_by_id: function(group_id) {
    var deferred = q.defer();

    request.get(
      settings.get('API') + '/groups/' + group_id + '/links',
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

  group_by_id: function(id) {
    var deferred = q.defer();

    request.get(
      settings.get('API') + '/groups/' + id,
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
      settings.get('API') + '/groups/' + id,
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
      settings.get('API') + '/groups/' + id,
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

  get_groups: function() {
    var deferred = q.defer();
    var groups = {}; // any defaults if needed

    request.get(
      settings.get('API') + '/groups',
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.resolve(groups);
        }
      }
    );
    return deferred.promise;
  },

  group_by_name: function(groupname) {
    var deferred = q.defer();
    request.get(
      settings.get('API') + '/groups/findOne?filter[where][name]=' + groupname,
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

  groupname_exists: function(groupname) {
    var deferred = q.defer();
    request.get(
      settings.get('API') + '/groups/findOne?filter[where][name]=' + groupname,
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

  add_group: function(name, id=null) {
    var deferred = q.defer();
    var jsonData = {};
    jsonData['name'] = name;
    if (id) {
      jsonData['id'] = id;
    }

    request.post(
      settings.get('API') + '/groups', { json: jsonData },
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
  add_groups: function(groups) {
    var deferred = q.defer();
    var promises = [];

    groups.forEach(function(group) {
      var group_deferred = q.defer();
      self.group_by_name(group).then(function(entity) {
        if (!Object.keys(entity).length) {
          self.add_group(group).then(function(g) {
            group_deferred.resolve(g);
          });
        } else {
          group_deferred.resolve(entity);
        }
      });
      promises.push(group_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  }

}
