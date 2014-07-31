ArchivesSpace CLI
===================

NodeJS command line client for ArchivesSpace. Work in progress.

## Getting Started

Install:

    $ npm install ascli

Log in to your ArchivesSpace instance and save your session key:

    $ ascli setup

Select your active repository:

    $ ascli repositories

## Usage

To see all available subcommands:

    $ ascli

## Using Custom Scripts 

In addition to the built-in commands, you can use a custom script. Your script should assign a single function to the module.exports global object, and that function should take a single argument, which is the activated client.

See https://github.com/lcdhoffman/asapi for more information about working with the api.

    $ ascli run-script path/to/your/script.js

Example script:

```javascript
module.exports = function(api) {
  api.eachResource(function(resource) {
    var update = false;

    for (var i = 0; i < resource.extents.length; i++) {

      if (resource.extents[i] && resource.extents[i].extent_type == 'linear_feet') {
        resource.extents[i].number = (resource.extents[i].number * 0.3048) + "";
        resource.extents[i].extent_type = "linear_meters";
        update = true;
      }
    }

    if (update) api.updateRecord(resource, function(err, body) {
      if (err) {
        throw (err).
      } else {
        console.log(body);
      }
    });
  })
});
```
