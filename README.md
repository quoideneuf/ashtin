ArchivesSpace Hacker's Toolkit (in Node)
===================

This is a work in progress. It includes a command-line interface and repl for working with the [ArchivesSpace](http://github.com/archivesspace/archivesspace/) backend API, and can also be used to build custom scripts or client applications in NodeJS.

## Global Install

To install:

    $ npm install ashtin -g

Log in to your ArchivesSpace instance and save your session key:

    $ ashtin setup

Create a repository:

    $ ashtin repositories create --repo-code FOO --name BAR

View repository list and select your active repository:

    $ ashtin repositories

See the available subcommands:

    $ ashtin


## Local Install

In addition to the built-in commands, you can use this package for custom scripts or applications. For example, if you'd like to
write a simple node app that creates one random resource record in your default repository, and assuming you've installed the global utility
per the section above:

    $ ashtin setup
    $ npm init
    $ npm install ashtin --save
    $ touch index.js

This would be the body of your index.js file:

	
	#!/usr/bin/env node

    module.exports = function(api, generator) {

      if (!api.hasSession) {
        console.log("Please get logged in first");
        throw("Not logged in");
      }

      api.createResource(generator.resource()).
        then(function(json) {
	    console.log("Created: " + json.uri);
	  }).
	  catch(function(err) {
	    console.log(":( " + err);
	  });
	};


Your script needs to export a single function with 'injected' arguments. There are currently two available arguments for injection:

* 'api' - [an AS client](https://www.npmjs.com/package/asapi)
* 'generator' - some simple record generators

You can also add a module to this toolkit by writing your own library in the lib directory and submitting a pull request.

Additional example scripts are in the 'examples' directory.


