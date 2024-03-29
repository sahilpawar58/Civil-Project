const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
var csurf = require("csurf");
require("dotenv").config();
const {
  requireAuth,
  checkUser,
  displayallusers,
  deleteUser,
  searchuser,
  isAdmin,
  invaidCsrfToken,
} = require("./middleware/authMiddleware");
const mongoSantize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const app = express();

// middleware
app.disable("x-powered-by");
app.use(express.static("public"));
app.use(mongoSantize());
app.use(xss());
app.use(express.json());
app.use(cookieParser());

//handling wrong invlid json syntax
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    //console.error(err);
    return res.status(400).send("Invalid Json formatting"); // Bad request
  }
});

// view engine
app.set("view engine", "ejs");

// database connection
const mongoUsername = process.env.MONGO_USERNAME;
const mongoPassword = process.env.MONGO_PASSWORD;
const dbURI =
  "mongodb+srv://" +
  mongoUsername +
  ":" +
  mongoPassword +
   "@nodepractice.l9viu.mongodb.net/real-auth?retryWrites=true&w=majority";
 // "@cluster0.4wmbc.mongodb.net/real_auth?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => app.listen(4000))
  .catch((err) => console.log(err));
//logout above due to additional info functionality
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});
// routes
app.get("*", checkUser);
//app.use(csurf());
//app.use(invaidCsrfToken);
app.get("/", (req, res) => res.render("home"));
app.get("/add", (req, res) => res.render("additional-user-info"));
app.use('/uploads', require('./routes/uploadRouter'));
app.use(function(err,req,res,next){
  //console.log(err)
  if(err.message === "wrong file type"){
      res.status(500).send("<h1>PLZ wait REdirecting......</h1><script>alert('this file type is not allowed');location.href='/'</script>")
  }
  if(err.message === 'limit exceeded'){
      res.status(500).send("<h1>PLZ wait REdirecting......</h1><script>alert('your file is too large');location.href='/'</script>")
  }
  if(err.message === 'image upload limit reached'){
    res.status(500).send("<h1>PLZ wait REdirecting......</h1><script>alert('u can upload inly 10 files');location.href='/uploads'</script>")
}
})

//user-home
app.use("/home",  require('./routes/homeRoutes'));
app.get("/stages", (req, res) => res.render("stage"));

app.get("/vaibhav", (req, res) => res.render("additional-user-info"));
app.get("/smoothies", requireAuth, (req, res) => res.render("smoothies"));

app.post("/admin/delete/user", isAdmin, deleteUser, (req, res) =>
  res.send("delete user")
  
);
app.get("/admin/search/user", isAdmin, searchuser, (req, res) =>
  res.render("searchedUser")
);
app.get("/admin", isAdmin, displayallusers, (req, res) => res.render("admin"));
app.use(authRoutes);
