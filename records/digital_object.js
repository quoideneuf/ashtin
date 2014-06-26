

function DigitalObject(filedata) {

  this.title = filedata.filename;
  this.digital_object_id = filedata.filename;
  this.file_versions = [{    
    file_uri: filedata.uri,
    file_size_bytes: filedata.bytesize
  }]
}


module.exports = DigitalObject;
