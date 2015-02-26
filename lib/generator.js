
function merge(overrides, defaults) {

  if (typeof(overrides) != 'undefined') {
    for (var i = 0; i < Object.keys(overrides).length; i++) { defaults[Object.keys(overrides)[i]] = overrides[Object.keys(overrides)[i]] }
  }

  return defaults;
}

function randomString() {
  return Math.random().toString(36).substring(7);
}


module.exports = {

  resource: function(opts) {
    return merge(opts, {
      id_0: randomString(),
      title: randomString(),
      level: "collection",
      dates: [this.date()],
      extents: [this.extent()]
    });
  },

  extent: function(opts) {
    return merge(opts, {
      number: "1",
      portion: "whole",
      extent_type: "linear_feet",
      container_summary: randomString()
    });
  },


  date: function(opts) {
    return merge(opts, {
      expression: '1900',
      date_type: 'inclusive',
      label: 'creation',
    });
  },

  archival_object: function(opts) {
    return merge(opts, {
      title: randomString(),
      language: 'eng',
      level: 'series',
      dates: [this.date()],
      extents: [this.extent()]
    });
  }


}
