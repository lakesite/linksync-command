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

  settings = require('./settings'),
  taglib = require('./tags'),
  grouplib = require('./groups'),
  linktaglib = require('./linktags'),
  linkgrouplib = require('./linkgroups');

var self = module.exports = {
  delete_by_id: function(id) {
    var deferred = q.defer();

    // needs to cascade delete from LinkTags, LinkGroups
    // https://github.com/strongloop/loopback-datasource-juggler/issues/145
    // https://gist.github.com/zbarbuto/add938efd9653c7c6c14
    linktaglib.delete_by_linkid(id);
    linkgrouplib.delete_by_linkid(id);

    request.del(
      settings.API + '/links/' + id,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          return deferred.resolve(body);
        } else {
          return deferred.reject(body);
        }
      }
    );
    return deferred.promise;
  },

  update_link: function(id, url, description, tag, group) {
    var deferred = q.defer();
    var formData = {};
    var promises = [];

    if (url)
      formData['url'] = url;
    if (description)
      formData['description'] = description;

    if (tag) {
      var tag_deferred = q.defer();
      linktaglib.delete_by_linkid(id).then(function(deleted) {
        taglib.add_tags(option_list(tag)).then(function(tags) {
          linktaglib.add_linktags(id, tags).then(function(response) {
            tag_deferred.resolve(response);
          });
        });
      });
      promises.push(tag_deferred.promise);
    }

    if (group) {
      var group_deferred = q.defer();
      linkgrouplib.delete_by_linkid(id).then(function(deleted) {
        grouplib.add_groups(option_list(group)).then(function(groups) {
          linkgrouplib.add_linkgroups(id, groups).then(function(response) {
            group_deferred.resolve(response);
          });
        });
      });
      promises.push(group_deferred.promise);
    }

    q.all(promises).then(function(data) {
      request.put(
        settings.API + '/links/' + id,
        {
          json: formData,
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            return deferred.resolve(body);
          } else {
            return deferred.reject(body);
          }
        }
      );
    });

    return deferred.promise;
  },

  get_link: function(id) {
    var deferred = q.defer();

    request.get(
      settings.API + '/links/' + id,
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
      settings.API + '/links',
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
      settings.API + '/tags/' + tag_id + '/links',
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

  list_by_ids: function(ids) {
    var deferred = q.defer();
    var count = Object.keys(ids).length;
    var index = count;

    if (count == 0) {
      return {};
    }

    if (count == 1) {
      return self.get_link(ids);
    }

    var filter = "";
    ids.forEach(function(id) {
      if (index === count) {
        filter = filter + "?filter[where][or][" + index + "][id]=" + id;
      } else {
        filter = filter + "&filter[where][or][" + index + "][id]=" + id;
      }
      index--;
    });

    request.get(
      settings.API + '/links' + filter,
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

  find_by_groups: function(groups) {
    var deferred = q.defer();
    var promises = [];

    groups.forEach(function(group) {
      var group_deferred = q.defer();
      grouplib.group_by_name(group).then(function(entity) {
        if (Object.keys(entity).length) {
          linkgrouplib.get_by_groupid(entity.id).then(function(lg) {
            self.list_by_ids(
              lg.map(function(item) {
                return item.linkId;
              })
            ).then(function(links) {
              group_deferred.resolve(links);
            });
          });
        } else {
          group_deferred.resolve();
        }
      });
      promises.push(group_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  },

  find_by_tags: function(tags) {
    var deferred = q.defer();
    var promises = [];

    tags.forEach(function(tag) {
      var tag_deferred = q.defer();
      taglib.tag_by_name(tag).then(function(entity) {
        if (Object.keys(entity).length) {
          linktaglib.get_by_tagid(entity.id).then(function(lt) {
            self.list_by_ids(
              lt.map(function(item) {
                return item.linkId;
              })
            ).then(function(links) {
              tag_deferred.resolve(links);
            });
          });
        } else {
          tag_deferred.resolve();
        }
      });
      promises.push(tag_deferred.promise);
    });

    q.all(promises).then(function(data) {
      return deferred.resolve(data);
    });

    return deferred.promise;
  },

  find_by_url: function(url) {
    var deferred = q.defer();
    request.get(
      settings.API + '/links/findOne?filter[where][url]=' + url,
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

  add_link: function(url, description) {
    var deferred = q.defer();
    request.post(
      settings.API + '/links', { json: { url: url, description: description } },
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
