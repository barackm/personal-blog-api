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
  if (buffer.length > 2097152) {
    throw new Error({
      message: 'File size is too large. Max file size is 2MB.',
    });
  }

  return await cloudinary.uploader.upload(
    'data:image/png;base64,' + buffer.toString('base64'),
    {
      upload_preset: CLOUDINARY.UPLOAD_PRESET,
    },
  );
};

const uploadArticleImage = async (file) => {
  const buffer = Buffer.from(file.buffer, 'base64');
  const formData = new FormData();

  formData.append('file', buffer);
  formData.append('upload_preset', CLOUDINARY.UPLOAD_PRESET_ARTICLES);
  formData.append('cloud_name', CLOUDINARY.CLOUD_NAME);
  if (buffer.length > 2097152) {
    throw new Error({
      message: 'File size is too large. Max file size is 2MB.',
    });
  }

  return await cloudinary.uploader.upload(
    'data:image/png;base64,' + buffer.toString('base64'),
    {
      upload_preset: CLOUDINARY.UPLOAD_PRESET,
    },
  );
};

const uploadProfileImage = async (file) => {
  const buffer = Buffer.from(file.buffer, 'base64');
  const formData = new FormData();

  formData.append('file', buffer);
  formData.append('upload_preset', CLOUDINARY.UPLOAD_PRESET);
  formData.append('cloud_name', CLOUDINARY.CLOUD_NAME);
  if (buffer.length > 2097152) {
    throw new Error({
      message: 'File size is too large. Max file size is 2MB.',
    });
  }

  return await cloudinary.uploader.upload(
    'data:image/png;base64,' + buffer.toString('base64'),
    {
      upload_preset: CLOUDINARY.UPLOAD_PRESET,
    },
  );
};

module.exports = {
  uploadProjectImage,
  uploadArticleImage,
  uploadProfileImage,
};
