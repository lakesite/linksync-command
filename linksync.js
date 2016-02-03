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
  prettyjson = require('prettyjson'),
  program = require('commander'),
  q = require('q'),
  request = require('request'),

  linklib = require('./lib/links'),
  grouplib = require('./lib/groups'),
  taglib = require('./lib/tags'),
  linkgrouplib = require('./lib/linkgroups'),
  linktaglib = require('./lib/linktags'),
  settings = require('./lib/settings');


function option_list(val) {
  return val.split(',');
}


program
  .command('add [url] [description]')
  .description('Add a url with a description')
  .option("-t, --tag [tag1,tag2,...]", "optional comma separated tag association")
  .option("-g, --group [group1,group2,...]", "optional comma separated group association")
  .action(function(url, description, options) {
    var tags = [];
    var groups = [];
    var link_id = "";

    linklib.add_link(url, description).then(function(link) {
      return link;
    }).then(function(link) {
      if (options.tag) {
        taglib.add_tags(option_list(options.tag)).then(function(tags) {
          linktaglib.add_linktags(link.id, tags);
        });
      }
      if (options.group) {
        grouplib.add_groups(option_list(options.group)).then(function(groups) {
          linkgrouplib.add_linkgroups(link.id, groups);
        });
      }
      return link;
    }).then(function(link) {
      console.log('Link created: ' + JSON.stringify(link));
    }).catch(function(e) {
      console.log('Error adding link: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync add www.somedomain.biz "some domain that interests me."');
    console.log('    $ linksync add www.someotherdomain.com');
    console.log();
  });


program
  .command('get [id]')
  .description('Get all information about a link by its id')
  .action(function(id, options) {
    linklib.get_link(id).then(function(link) {
      console.log(prettyjson.render(link));
    }).catch(function(e) {
      console.log('Error getting link: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync get 1');
    console.log();
  });


program
  .command('update [id]')
  .option("-t, --tag [tag1,tag2,...]", "optional new comma separated tag associations")
  .option("-g, --group [group1,group2,...]", "optional new comma separated group associations")
  .option("-d, --description [description]", "optional new description")
  .option("-u, --url [url]", "optional new url")
  .description('Update a link by its id')
  .action(function(id, options) {
    linklib.update_link(id, options.url, options.description).then(function(response) {
      console.log('Updated link, response: ' + JSON.stringify(response));
    }).catch(function(e) {
      console.log('Error updating link: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync update 1 -t foo -d "now with more foo"');
    console.log();
  });


program
  .command('remove [id]')
  .description('Remove a link by id')
  .action(function(id, options) {
    linklib.delete_by_id(id).then(function(response) {
      console.log('Link removed, response: %s', JSON.stringify(response));
    }).catch(function(e) {
      console.log('Error removing link: '+ e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync remove 1');
    console.log();
  });

program
  .command('findurl [url]')
  .description('Find links similar to [url]')
  .action(function(url, options) {
    linklib.find_by_url(url).then(function(response) {
      console.log(prettyjson.render(response));
    }).catch(function(e) {
      console.log('Error adding link: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync find somedomain');
    console.log();
  });


program
  .command('findtag [tags]')
  .description('Find links associated with tags')
  .action(function(tags, options) {
    var tagset = option_list(tags);
    linklib.find_by_tags(tagset).then(function(response) {
      var tagindex = 0;
      response.forEach(function(links) {
        console.log("Links associated with '" + tagset[tagindex] + "':\n");
        console.log(prettyjson.render(links));
        console.log();
        tagindex++;
      });
    }).catch(function(e) {
      console.log('Error finding tag: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync findtag random,foo');
    console.log();
  });


program
  .command('findgroup [groups]')
  .description('Find links associated with groups')
  .action(function(groups, options) {
    var groupset = option_list(groups);
    linklib.find_by_groups(groupset).then(function(response) {
      var groupindex = 0;
      response.forEach(function(links) {
        console.log("Links associated with '" + groupset[groupindex] + "':\n");
        console.log(prettyjson.render(links));
        console.log();
        tagindex++;
      });
    }).catch(function(e) {
      console.log('Error finding tag: ' + e.error.message);
    });
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync findgroup work,news');
    console.log();
  });


program
  .command('groups')
  .description('Manage groups saved to the system')
  .option("-a, --add [group]", "add a group")
  .option("-g, --get [id]", "get a group by id")
  .option("-d, --delete [id]", "delete group by id")
  .option("-r, --rename [id],[name]", "renames group with id to new name", option_list)
  .option("-l, --list", "lists groups")
  .option("-f, --find [group]", "Find groups similar to [group]")
  .action(function(options) {
    var got_option = false;
    if (options.add) {
      got_option = true;
      grouplib.add_group(options.add).then(function(group) {
        console.log('Group(s) added, response: %s', JSON.stringify(group));
      }).catch(function(e) {
        console.log('Error adding group: ' + e.error.message);
      });
    }

    if (options.find) {
      got_option = true;
      grouplib.group_by_name(options.find).then(function(group) {
        console.log(prettyjson.render(group));
      }).catch(function(e) {
        console.log('Error finding group: ' + e.error.message);
      });
    }

    if (options.get) {
      got_option = true;
      grouplib.group_by_id(options.get).then(function(group) {
        console.log(prettyjson.render(group));
      }).catch(function(e) {
        console.log('Error getting group: ' + e.error.message);
      });
    }

    if (options.delete) {
      got_option = true;
      grouplib.delete_by_id(options.delete).then(function(group) {
        console.log('Group removed, response: %s', JSON.stringify(group));
      }).catch(function(e) {
        console.log('Error removing group: ' + e.error.message);
      });
    }

    var rename = options.rename;
    if (rename) {
      got_option = true;
      grouplib.rename_by_id(options.rename[0], options.rename[1]).then(function(group) {
        console.log('Group renamed, response: %s', JSON.stringify(group));
      }).catch(function(e) {
        console.log('Error renaming group: ' + e.error.message);
      });
    }

    if (!got_option) {
      options.list = true;
    }

    if (options.list) {
      grouplib.get_groups().then(function(groups) {
        console.log(prettyjson.render(groups));
      }).catch(function(e) {
        console.log('Error listing groups: ' + e.error.message);
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync groups');
    console.log('    $ linksync groups -a work');
    console.log('    $ linksync groups -d work');
    console.log('    $ linksync groups -r 1 schoolwork');
    console.log('    $ linksync groups -f school');
    console.log();
  });


program
  .command('tags')
  .description('Manage tags saved to the system')
  .option("-a, --add [tag]", "add a tag")
  .option("-g, --get [id]", "get a tag by id")
  .option("-d, --delete [id]", "delete tag by id")
  .option("-r, --rename [id],[name]", "renames tag with id to new name", option_list)
  .option("-l, --list", "lists tags")
  .option("-f, --find [tag]", "Find tags similar to [tag]")
  .action(function(options) {
    var got_option = false;
    if (options.add) {
      got_option = true;
      taglib.add_tag(options.add).then(function(tag) {
        console.log('Tag(s) added, response: %s', JSON.stringify(tag));
      }).catch(function(e) {
        console.log('Error adding tag: ' + e.error.message);
      });
    }

    if (options.find) {
      got_option = true;
      taglib.tag_by_name(options.find).then(function(tag) {
        console.log(prettyjson.render(tag));
      }).catch(function(e) {
        console.log('Error finding tag: ' + e.error.message);
      });
    }

    if (options.get) {
      got_option = true;
      taglib.tag_by_id(options.get).then(function(tag) {
        console.log(prettyjson.render(tag));
      }).catch(function(e) {
        console.log('Error getting tag: ' + e.error.message);
      });
    }

    if (options.delete) {
      got_option = true;
      taglib.delete_by_id(options.delete).then(function(tag) {
        console.log('Tag removed, response: %s', JSON.stringify(tag));
      }).catch(function(e) {
        console.log('Error removing tag: ' + e.error.message);
      });
    }

    var rename = options.rename;
    if (rename) {
      got_option = true;
      taglib.rename_by_id(options.rename[0], options.rename[1]).then(function(tag) {
        console.log('Tag renamed, response: %s', JSON.stringify(tag));
      }).catch(function(e) {
        console.log('Error renaming tag: ' + e.error.message);
      });
    }

    if (!got_option) {
      options.list = true;
    }

    if (options.list) {
      taglib.get_tags().then(function(tags) {
        console.log(prettyjson.render(tags));
      }).catch(function(e) {
        console.log('Error listing tags: ' + e.error.message);
      });
    }
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync tags');
    console.log('    $ linksync tags -a tech');
    console.log('    $ linksync tags -d tech');
    console.log('    $ linksync tags -r 1 technews');
    console.log('    $ linksync tags -f news');
    console.log();
  });


program
  .command('list')
  .description('List links saved to the system')
  .action(function(options) {
    request.get(
      settings.API + '/links',
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(prettyjson.render(body));
        } else {
          console.log('Error listing links: %s', error);
        }
      }
  )}).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync list');
    console.log();
  });


program.parse(process.argv);
