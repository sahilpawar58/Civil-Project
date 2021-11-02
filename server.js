const express = require('express')
const app = express();

const hbs = require('express-handlebars');
const path = require('path');

app.use(express.json());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// connect mongodb database
require('./server/database/database')();

// setup view engine
app.set("view engine", "ejs");

// calling routes
app.use('/', require('./server/router/router'));

app.use(function(err,req,res,next){
    //console.log(err)
    if(err.message === "wrong file type"){
        res.status(500).send("<h1>PLZ wait REdirecting......</h1><script>alert('this file type is not allowed');location.href='/'</script>")
    }
    if(err.message === 'limit exceeded'){
        res.status(500).send("<h1>PLZ wait REdirecting......</h1><script>alert('your file is too large');location.href='/'</script>")
    }
})
app.listen(3000, () => console.log(`Server is stated on http://localhost:3000`));