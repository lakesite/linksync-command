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
  crawler = require('simplecrawler').Crawler,
  fs = require('node-fs'),
  path = require('path'),
  q = require('q'),
  request = require('request'),
  url = require('url'),

  linklib = require('./links'),
  settings = require('./settings');


var self = module.exports = {
  crawler: new crawler(),

  init_crawler: function() {
    self.crawler.cache = new crawler.cache(settings.get('syncroot'));
    self.crawler.interval = 250;
    self.crawler.maxConcurrency = 5;
    self.crawler.userAgent = "LinkSync version " + settings.get('version');
    self.crawler.maxDepth = 1;
    self.crawler.ignoreInvalidSSL = true;
  },

  download_url: function(id, weburl, callback) {
    var mask = parseInt('0755', 8);
    var parsed_url = url.parse(weburl);
    var root_id = id;
    self.crawler = new crawler(parsed_url.hostname);
    self.init_crawler();
    self.crawler.queueURL(weburl);

    self.crawler.on("fetchcomplete", function(queue_item, response_buffer, response) {
      console.log("Fetched: %s", queue_item.url);
      var parsed_url = url.parse(queue_item.url);

      if (parsed_url.pathname === "/") {
        parsed_url.pathname = "/index.html";
      }

      var output_directory = path.join(settings.get('syncroot') + root_id + '/', parsed_url.hostname);
      var dirname = output_directory + parsed_url.pathname.replace(/\/[^\/]+$/, "");
      var filepath = output_directory + parsed_url.pathname;

      console.log('%s : %s : %s', output_directory, dirname, filepath);

      fs.exists(dirname, function(exists) {
        if (exists) {
          fs.writeFile(filepath, response_buffer, function() {});
        } else {
          fs.mkdir(dirname, mask, true, function() {
            fs.writeFile(filepath, response_buffer, function() {});
          });
        }
      });

      console.log("%s (%d bytes) / %s", queue_item.url, response_buffer.length, response.headers["content-type"]);

    });

    self.crawler.on("fetcherror", function(error) {
      console.log("Error syncing url (%s): %s", weburl, error);
    });

    self.crawler.on("complete", function() {
      callback();
    });

    self.crawler.start();
  },

  sync: function(id) {
    linklib.get_link(id).then(function(link) {
      console.log('Syncing %s ...', link.url);
      self.download_url(id, link.url, function() {
        console.log("Finished syncing %s", link.url);
      });
    });
  }
}
