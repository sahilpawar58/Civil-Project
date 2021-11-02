const route = require('express').Router()
const controller = require('../controllers/controller');
const store = require('../middleware/multer')

// routes

const use =fn => (req,res,next)=>{
    Promise.resolve(fn(req,res,next)).catch(next)
}
route.get('/', controller.home);
route.post('/uploadmultiple',use(store.array('images', 12)),use(controller.uploads))


module.exports = route;
