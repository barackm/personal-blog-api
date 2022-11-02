'use strict';
const FormData = require('form-data');

const { CLOUDINARY } = require('../utlis/constants');
const cloudinary = require('cloudinary').v2;
const uploadProjectImage = async (file) => {
  const buffer = Buffer.from(file.buffer, 'base64');
  const formData = new FormData();

  formData.append('file', buffer);
  formData.append('upload_preset', CLOUDINARY.UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY.CLOUD_NAME);
  return await cloudinary.uploader.upload(
    'data:image/png;base64,' + buffer.toString('base64'),
    {
      upload_preset: CLOUDINARY.UPLOAD_PRESET,
    },
  );
};

module.exports = {
  uploadProjectImage,
};
