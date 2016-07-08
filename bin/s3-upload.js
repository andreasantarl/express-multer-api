'use strict';

require('dotenv').config();

//node modules
const fs = require('fs');
const crypto = require('crypto');

//npm modules
const fileType = require('file-type');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}); //constructor function

const mimeType = (data) => {
  return Object.assign({  //Amazon needs to know extension and mime type to save to bucket, so set defaults
    ext: 'bin',   //binary default
    mime: 'application/octet-stream'  //stream of bits default
  }, fileType(data));   //merge/overwrite first object with second object if don't have something in data: object that is returned with extension and mime type
  // by default, returns object based on NPM extension file-type
};

const randomHexString = (length) => {
  return new Promise ((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => {
      if (error) {
        reject(error);
      }
      resolve(buffer.toString('hex'));  //buffer does not return a string, so need to coerce it
    });
  });
};

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

const awsUpload = (file) => {

  return randomHexString(16)
  .then((filename) => {
    let dir = new Date().toISOString().split('T')[0];
    return {
      ACL: "public-read",
      Body: file.data,
      Bucket: 'andreasantarlasci',
      ContentType: file.mime,
      Key: `${dir}/${filename}.${file.ext}`,
    };
  })
  .then((options) => {
    return new Promise ((resolve, reject) => {
        s3.upload(options, (error, data) => {
          if (error) {
            reject(error);
          }
          resolve(data);
        });
      });
  });
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
