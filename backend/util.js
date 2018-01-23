const fs = require('fs');

const Util = {};

Util.setHost = (req, path) => {

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `http://${host}/` + path.substring(path.lastIndexOf('uploads'));
};

Util.ensureUploadDirExists = (path) => {
  if (!fs.existsSync(path)){
    fs.mkdirSync(path);
  }
};

module.exports = Util;
