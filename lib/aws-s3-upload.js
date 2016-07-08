'use strict';
require('dotenv').config();

const AWS = require('aws-sdk');

const crypto = require('crypto');

//npm modules
const fileType = require('file-type');

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
}); //constructor function

const prepareFile = (data) => {
  return Object.assign({  //Amazon needs to know extension and mime type to save to bucket, so set defaults
    data,
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

module.exports = {
  prepareFile,
  awsUpload,
};
