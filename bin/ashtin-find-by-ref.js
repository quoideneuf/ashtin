#!/usr/bin/env node

exports.command = {
  description: "Find components by ref_id or component_id",
}

if (require.main === module) {

  require('../lib/utils.js');
  var argv = require('minimist')(process.argv.slice(2));

  function printUsage() {
    console.log("Usage: ashtin find-by-ref --type={record_type} [--ref_id='{ref_id}'] [--component_id={component_id}]");
  }


  if(!argv['type']) {
    printUsage();
  } else if(argv['type'] != 'archival_object' && argv['type'] != 'digital_object_component') {
    console.log("'type' must be one of: 'archival_object', 'digital_object_component'");
    printUsage();
  } else if(!argv['ref_id'] && !argv['component_id']) {
    printUsage();
  } else if(argv['ref_id'] && argv['component_id']) {
    console.log("Please use 'ref_id' OR 'component_id'");
  } else {
    var api = require('../lib/load_api.js');

    var config = require('../lib/config.js');

    var paramName = argv['ref_id'] ? 'ref_id' : 'component_id';
    var paramVal = argv['ref_id'] || argv['component_id']
    var type = argv['type'] + 's'

    if(typeof(paramVal) != 'object') {
      paramVal = [paramVal];
    }

    var opts = {}
    opts[paramName] = paramVal;
    var url = "/repositories/:repo_id/find_by_id/"+type+"?"

    // asapi is supposed to do this 
    // but fails to add the '&'
    paramVal.each(function(val) {
      url += paramName+"[]="+val+"&"
    });


    api.get(url).then(function(result) {
      console.log(JSON.stringify(result));
    }).catch(function(err) {
      console.log("ERROR: "+JSON.stringify(err));
    });    
  }
}
