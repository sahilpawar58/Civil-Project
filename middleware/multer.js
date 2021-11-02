const multer = require('multer');

// set storage
var storage = multer.diskStorage({
    destination : function ( req , file , cb ){
        cb(null, 'uploads')
    },
    filename : function (req, file , cb){
        // image.jpg
        console.log(file.size)
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        console.log("ssssss"+file.size)
        cb(null, file.fieldname + '-' + Date.now() + ext)
    },
    limits: {
      fileSize: 1000, // 5MB
    },
    onError : function(err, next) {
        console.log('error', err);
        next(err);
    }
})


const fileFilter = (req,file, cb) => {
    // reject a file
    const fileSize = parseInt(req.headers['content-length']);
   //console.log(fileSize)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('wrong file type') , false);
    }

    // if (fileSize > 1048576) {
    //   cb(new Error('limit exceeded') , false);
    // }
  };
  module.exports = store = multer({ storage : storage ,
    fileFilter: fileFilter})