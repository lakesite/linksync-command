# linksync-command #

Command line interface to LinkSync.

## Running ##

  $ npm install
  $ node --harmony linksync.js --help

## Examples ##

	$ linksync add -t programming,technology,aggregator https://lobste.rs A technology-focused link-aggregation site.
	$ linksync find aggregator
	$ linksync list
	$ linksync remove https://lobste.rs # or by ID
	$ linksync add https://vimeo.com/62232896 Mr. Sprinkles
	$ linksync sync 1 # download mr sprinkles media via vimeo plugin
