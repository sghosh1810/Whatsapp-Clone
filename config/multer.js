const multer = require('multer');
const path = require('path');

const profile_image_storage = multer.diskStorage({
    destination: './public/user_files/profile_images/',
    filename: function(req, file, cb){
      cb(null,req.user._id+path.extname(file.originalname));
    }
});
  
  // Init Upload
const profile_image_upload = multer({
    storage: profile_image_storage,
    limits:{fileSize: 5000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('profile-image');

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = {profile_image_upload:profile_image_upload}