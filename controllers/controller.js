const UploadModel = require('../models/User');
const fs = require('fs');
const {getUserInfo} = require('../middleware/authMiddleware')

exports.home = async (req, res) => {
    //const user = await get
    const user = await getUserInfo(req,res)
    //console.log("x",user.id) 
    const all_images = await UploadModel.findById(user.id)
    //console.log(all_images)
    //await UploadModel.insert({"firstname":"ffffffffff","lastname":"ssssssss","email":"mm@dmil.com","password":"$2b$10$KGPIzT0.fhvcLsdeWyN/pu4F17uhVPDl2tRSBCWzqADBb6sd3jT6u","role":"user","additionalinfo":{"fullname":"ffffffffff ssssssss","address":"ddddddd","city":"ddddddd","district":"dddd","propertytype":"residential","adharcard":{"$numberInt":"33333333"},"pancard":"33333"},"__v":{"$numberInt":"0"}})
    // await UploadModel.create(
    //     {firstname:"ffffffffff",lastname:"ssssssss",email:"cdddol@dmil.com",password:"$2b$10$KGPIzT0.fhvcLsdeWyN/pu4F17uhVPDl2tRSBCWzqADBb6sd3jT6u",role:"user",additionalinfo :{
    //         fullname: "",
    //         address: "",
    //         city: "",
    //         district: "",
    //         propertytype: null,
    //         adharcard: null,
    //         pancard: null,
    //       }},
    //   )    
    //working update query
//     await UploadModel.updateOne({email:"cdddol@dmil.com"},{$push:{
//         images: {
//        filename: 'aboddffddut me',
//        contentType: 'image/png',
//        imageBase64: 'iVBdfSUhEUgAAC',
//      }
//    }
    
//    })
//console.log(Object.keys(all_images))
//console.log(all_images.images)
    res.render('indextest', { user : all_images });
}



exports.uploads = async (req, res , next) => {
    const files = req.files;
    console.log(Object.getOwnPropertyNames(files).length-1)
    const filenumber= Object.getOwnPropertyNames(files).length-1
    
    const user = await getUserInfo(req,res)
    console.log("filenumberindb",user.images.length)
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
            filename : user.email + '-' + Date.now().toString()+ext,
            contentType : files[index].mimetype,
            imageBase64 : src
        }

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