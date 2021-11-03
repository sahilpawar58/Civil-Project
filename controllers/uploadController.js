const UploadModel = require('../models/User');
const fs = require('fs');
const {getUserInfo} = require('../middleware/authMiddleware')
var crypto = require("crypto");


exports.home = async (req, res) => {
    
    const user = await getUserInfo(req,res)
    
    const all_images = await UploadModel.findById(user.id)
    res.render('photoUpload', { user : all_images });
}

exports.uploads = async (req, res , next) => {
    const files = req.files;
    
    const filenumber= Object.getOwnPropertyNames(files).length-1
    
    const user = await getUserInfo(req,res)
    
    //throw new Error("image upload limit reached")
    if(user.images.length > 0){
        if((user.images.length + filenumber) > 10){
           throw new Error("image upload limit reached")
        }
    }
    
    //console.log('xxx',data)
    if(!files){
        const error = new Error('Please choose files');
        error.httpStatusCode = 400;
        return next(error)
    }
    
    // convert images into base64 encoding
    let imgArray = files.map((file) => {
        console.log("file path is:"+file.path)
        let img = fs.readFileSync(file.path)

        return encode_image = img.toString('base64')
    })

    let result = imgArray.map(async(src, index) => {
        
        //determining ext type
        var ext;
        if(files[index].mimetype === 'image/jpeg'){
            ext=".jpeg"
        }
        if(files[index].mimetype === 'image/png'){
            ext=".png"
        }
        // create object to store data in the collection
        let finalImg = {
            filename : user.email + '-' + Date.now().toString()+'-'+crypto.randomBytes(5).toString('hex')+ext,
            contentType : files[index].mimetype,
            imageBase64 : src
        }
        return  await UploadModel.updateOne({email:user.email},{$push:{images: finalImg}}).then(() => {
            return { msg : `${files[index].originalname} Uploaded Successfully...!`}
        })
        .catch(error =>{
            if(error){
                if(error.name === 'MongoError' && error.code === 11000){
                    //return Promise.reject({ error : `Duplicate ${files[index].originalname}. File Already exists! `});
                }
                return Promise.reject({ error : error.message || `Cannot Upload ${files[index].originalname} Something Missing!`})
            }
        })   
                       
              
    });

    Promise.all(result)
        .then( msg => {
                // res.json(msg);
            res.redirect('/uploads')
        })
        .catch(err =>{
            res.json(err);
        })
}

exports.reencodefiles =async(req,res,next) =>{
    const files = req.files;
    
    console.log(files)

}

exports.delete =async(req,res) =>{
    const {imagename} = req.body
    const user = await getUserInfo(req,res)
    if(user){
        const deleteimage = await UploadModel.updateOne({_id:user.id},
            { $pull: { 'images': { filename: imagename } } })
       // console.log(deleteimage)
        res.send("ok")
    } 
}