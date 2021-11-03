const route = require('express').Router()
const controller = require('../controllers/uploadController');
const store = require('../middleware/multer')

// routes

const use =fn => (req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch(next)
}

route.get('/', controller.home);
route.post('/delete',controller.delete)
route.post('/uploadmultiple',use(store.array('images', 12)),controller.reencodefiles,use(controller.uploads))



module.exports = route;
