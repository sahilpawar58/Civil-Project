const UploadModel = require("../models/User");
const fs = require('fs');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const admin_secret = process.env.ADMIN_SECRET;
const {getUserInfo} = require("../middleware/authMiddleware")

exports.home = async (req, res) => {
    const all_images = await UploadModel.distinct("images")
     //working update query
//     await UploadModel.updateOne({email:"cdddol@dmil.com"},{$push:{
//         images: {
//        filename: 'aboddffddut me',
//        contentType: 'image/png',
//        imageBase64: 'iVBdfSUhEUgAAC',
//      }
//    }
    
//    })     
    res.render('photoUpload', { images : all_images });
}

exports.uploads = (req, res , next) => {
    const files = req.files;
    const token = req.cookies.jwt;
    let user;
    if (token) {
       jwt.verify(token, jwt_secret, async (err, decodedtoken) => {
        if (err) {
          console.log(err.message);
          user = null;
          console.log("1")
        } else {
          console.log(decodedtoken);
          user = await UploadModel.findById(decodedtoken.id); 
          //file upload
          console.log("userid",user.id)
          if(!files){
            const error = new Error('Please choose files');
            error.httpStatusCode = 400;
            return next(error)
        }
    
        // convert images into base64 encoding
        let imgArray = files.map((file) => {
            let img = fs.readFileSync(file.path)
    
            return encode_image = img.toString('base64')
        })
    
        let result = imgArray.map((src, index) => {
    
            // create object to store data in the collection
            let finalImg = {
                images:{
                filename : files[index].originalname,
                contentType : files[index].mimetype,
                imageBase64 : src
                }
            }
            
            console.log("email",user.email)
            let newUpload = new UploadModel(finalImg);
    
            // return newUpload
            //         .save()
            //         .then(() => {
            //             return { msg : `${files[index].originalname} Uploaded Successfully...!`}
            //         })
            //         .catch(error =>{
            //             if(error){
            //                 if(error.name === 'MongoError' && error.code === 11000){
            //                     return Promise.reject({ error : `Duplicate ${files[index].originalname}. File Already exists! `});
            //                 }
            //                 return Promise.reject({ error : error.message || `Cannot Upload ${files[index].originalname} Something Missing!`})
            //             }
            //         })
    
            return newUpload.update({id:user.email},{$set:{ images:{
              filename : files[index].originalname,
              contentType : files[index].mimetype,
              imageBase64 : src
              }}}).then(() => {
              return { msg : `${files[index].originalname} Uploaded Successfully...!`}
          })
          .catch(error =>{
              if(error){
                  if(error.name === 'MongoError' && error.code === 11000){
                      return Promise.reject({ error : `Duplicate ${files[index].originalname}. File Already exists! `});
                  }
                  return Promise.reject({ error : error.message || `Cannot Upload ${files[index].originalname} Something Missing!`})
              }
          })
        });
    
        Promise.all(result)
            .then( msg => {
                    // res.json(msg);
                res.redirect('/')
            })
            .catch(err =>{
                res.json(err);
            })
        }
      });
    } else {
        console.log("3")
      user = null
    }
   

 }