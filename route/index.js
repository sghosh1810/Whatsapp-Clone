const express = require('express');
const router = express.Router();
const {forwardAuthenticated,ensureAuthenticated} = require('../config/auth');
router.get('/',forwardAuthenticated,(req,res) => {
    res.redirect('/users/login');
})

module.exports=router