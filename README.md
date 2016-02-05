# linksync-commander #

Command line interface to LinkSync.

# Configuration #

See config.json.example for configuration settings.  Save this file as config.json to override the defaults that are defined in lib/settings.js.

## Running ##

Help and examples on various commands can be queried after installing dependencies and running with the --help option:

	$ nvm use 5.0
	$ npm install
	$ node --harmony --harmony_default_parameters linksync.js --help

## Export/Import ##

The default path for exports and imports lives under ./exports/, which will
have exports.zip when you run the exporter command against the API:

	$ node --harmony linksync.js exporter

For importing, the same file will be unzipped to exports/import.json, and then
streamed to oboe so we don't load a potentially large JSON object in memory:

	$ node --harmony linksync.js importer

The import process will also wipe the database behind the API.

## Examples ##

	$ linksync add -t programming,technology,aggregator https://lobste.rs A technology-focused link-aggregation site.
	$ linksync findtag aggregator
	$ linksync list
	$ linksync remove https://lobste.rs # or by ID
	$ linksync add https://vimeo.com/62232896 Mr. Sprinkles
	$ linksync sync 1 # download mr sprinkles media via vimeo plugin

## License ##

GNU GPL version 2.
