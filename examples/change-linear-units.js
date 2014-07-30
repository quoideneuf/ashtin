#!/usr/bin/env node

module.exports = function(api) {

  // Convert all metric to english
  // and all english to metric
  api.eachResource(function(resource) {
    var update = false;

    for (var i = 0; i < resource.extents.length; i++) {

      if (resource.extents[i] && resource.extents[i].extent_type == 'linear_feet') {
        resource.extents[i].number = (resource.extents[i].number * 0.3048) + "";
        resource.extents[i].extent_type = "linear_meters";
        update = true;
      } else if (resource.extents[i] && resource.extents[i].extent_type == 'linear_meters') {
        resource.extents[i].number = (resource.extents[i].number / 0.3048) + "";
        resource.extents[i].extent_type = "linear_feet";
        update = true;
      }
    }

    if (update) api.updateRecord(resource, function(err, uri) {
      if (err)
        console.log("uh oh " + err);
      else {
        console.log("Updated: " + uri);
      }
    });

  });
};
