const controller = require('../controllers/homeController');
const route = require('express').Router()


route.get('/', controller.home);


module.exports = route;