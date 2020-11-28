const mongoose = require('mongoose');

const UserSchemaFrontend = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  id : {
    type: String,
    required: true
  },
  status : {
      type: String,
      required: true
  }
  });

  const UserFrontend = mongoose.model('UserFrontend', UserSchemaFrontend);
  //Not used currently!
  module.exports = UserFrontend;