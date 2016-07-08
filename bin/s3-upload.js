'use strict';

const fs = require('fs');
const fileType = require('file-type');

let filename = process.argv[2] || '';

const mimeType = (data) => {
  return Object.assign({  //Amazon needs to know extension and mime type to save to bucket, so set defaults
    ext: 'bin',   //binary default
    mime: 'application/octet-stream'  //stream of bits default
  }, fileType(data));   //merge/overwrite first object with second object if don't have something in data: object that is returned with extension and mime type
  // by default, returns object based on NPM extension file-type
};

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};

const awsUpload = (file) => {
  const options = {
    ACL: "public-read",
    Body: file.data,
    Bucket: 'andreasantarlasci',
    ContentType: file.mime,
    Key: `test/test.${file.ext}`,
  };
  return Promise.resolve(options);

};

readFile(filename)
.then((data) => {
  //extra wrapper for filetype - files can be corrupted, etc, so need to give default filetype
  let file = mimeType(data);
  file.data = data;
  return file;
})
.then(awsUpload)
.then(console.log)
//.then((data) => console.log(`${filename} is ${data.length} byes long`))
.catch(console.error);
