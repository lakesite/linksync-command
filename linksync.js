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
  program = require('commander'),
  request = require('request'),
  prettyjson = require('prettyjson'),

  API = 'http://localhost:5979/api';


function option_list(val) {
  return val.split(',');
}


program
  .command('add [url] [description]')
  .description('Add a url with a description')
  .option("-t, --tag [tag1,tag2,...]", "optional comma separated tag association")
  .action(function(url, description, options) {
    request.post(
      API + '/links',
      {
        json: {
          url: url,
          description: description
        }
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('Link added, response: %s', JSON.stringify(body));
        } else {
          console.log('Error adding link: %s', JSON.stringify(body));
        }
      }
    );
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
    request.get(
      API + '/links/' + id,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(prettyjson.render(body));
        } else {
          console.log('Error fetching link: %s', JSON.stringify(body));
        }
      }
  )}).on('--help', function() {
      console.log('  Examples:');
      console.log();
      console.log('    $ linksync get 1');
      console.log();
  });


program
  .command('update [id]')
  .option("-t, --tag [tag1,tag2,...]", "optional new comma separated tag associations")
  .option("-d, --description [description]", "optional new description")
  .option("-u, --url [url]", "optional new url")
  .description('Update a link by its id')
  .action(function(id, options) {
    var formData = {};
    if (options.url)
      formData['url'] = options.url;
    if (options.description)
      formData['description'] = options.description;

    request.put(
      API + '/links/' + id,
      {
        json: formData,
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(prettyjson.render(body));
        } else {
          console.log('Error fetching link: %s', JSON.stringify(body));
        }
      }
  )}).on('--help', function() {
      console.log('  Examples:');
      console.log();
      console.log('    $ linksync update 1 -t foo -d "now with more foo"');
      console.log();
  });


program
  .command('remove [id]')
  .description('Remove a url by id')
  .action(function(id, options) {
    request.del(
      API + '/links/' + id,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('Link removed, response: %s', JSON.stringify(body));
        } else {
          console.log('Error removing link: %s', JSON.stringify(body));
        }
      }
    );
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync remove 1');
    console.log();
  });


program
  .command('find [url]')
  .description('Find links similar to [url]')
  .action(function(url, options) {
    request.get(
      API + '/links/findOne?filter[where][url][like]=' + url,
      {
        json: true
      },
      function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(prettyjson.render(body));
        } else {
          console.log('Error listing links: %s', JSON.stringify(body));
        }
      }
    );
  }).on('--help', function() {
    console.log('  Examples:');
    console.log();
    console.log('    $ linksync find somedomain');
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
      request.post(
        API + '/tags',
        {
          json: {
            name: options.add
          }
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('Tag(s) added, response: %s', JSON.stringify(body));
          } else {
            console.log('Error adding tags: %s', JSON.stringify(body));
          }
        }
      );
    }

    if (options.find) {
      got_option = true;
      request.get(
        API + '/tags/findOne?filter[where][name][like]=' + options.find,
        {
          json: true
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(prettyjson.render(body));
          } else if (response.statusCode == 404) {
            console.log('No tags found matching that name.');
          } else {
            console.log('Error listing tags: %s', JSON.stringify(body));
          }
        }
      );
    }

    if (options.get) {
      got_option = true;
      request.get(
        API + '/tags/' + options.get,
        {
          json: true
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('Response: %s', JSON.stringify(body));
          } else if (response.statusCode == 404) {
            console.log('No such tag with that ID');
          } else {
            console.log('Error fetching tag: %s', JSON.stringify(body));
          }
      });
    }

    if (options.delete) {
      got_option = true;
      request.del(
        API + '/tags/' + options.delete,
        {
          json: true
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('Tag removed, response: %s', JSON.stringify(body));
          } else {
            console.log('Error removing tag: %s', JSON.stringify(body));
          }
      });
    }

    var rename = options.rename;
    if (rename) {
      got_option = true;
      request.put(
        API + '/tags/' + options.rename[0],
        {
          json: {
            name: options.rename[1]
          }
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('Tag renamed, response: %s', JSON.stringify(body));
          } else {
            console.log('Error renaming tag: %s', JSON.stringify(body));
          }
        }
      );
    }

    if (!got_option) {
      options.list = true;
    }

    if (options.list) {
      request.get(
        API + '/tags',
        {
          json: true
        },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(prettyjson.render(body));
          } else {
            console.log('Error listing tags: %s', JSON.stringify(body));
          }
        }
      );
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
      API + '/links',
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
