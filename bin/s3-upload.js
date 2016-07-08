'use strict';

const uploader = require('../lib/aws-s3-upload');

//node modules
const fs = require('fs');

let filename = process.argv[2] || '';

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

readFile(filename)
.then(uploader.prepareFile)
.then(uploader.awsUpload)
.then(console.log)
.catch(console.error);
