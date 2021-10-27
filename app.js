const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
var csrf = require("csurf");
var svgCaptcha = require("svg-captcha");
var captcha = svgCaptcha.create();
var svgCaptcha = require("svg-captcha");
var csrfProtection = csrf({ cookie: true });
require("dotenv").config();
const {
  requireAuth,
  checkUser,
  displayallusers,
  deleteUser,
  searchuser,
  isAdmin,
  invaidCsrfToken,
  getCSRFToken,
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
//"@cluster0.4wmbc.mongodb.net/real_auth?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => app.listen(4000))
  .catch((err) => console.log(err));
//logout above due to additional info functionality

app.get("/captcha", function (req, res) {
  var captcha = svgCaptcha.create();
  req.cookie.captcha = captcha.text;

  res.type("svg");
  res.status(200).send(captcha.data);
});
app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
});
console.log("helllo");
//getCSRFToken();
console.log();
// routes
app.get("*", csrfProtection, checkUser);

//app.use(invaidCsrfToken);
app.get("/add", csrfProtection, (req, res) => {
  console.log("zeeeeeeeee");
  console.log(req.csrfToken());
  res.render("additional-user-info", { csrfToken: req.csrfToken() });
});
app.get("/", (req, res) => res.render("home"));
app.get("/csrf", csrfProtection, (req, res, next) => {
  res.json({ csrfToken: req.csrfToken() });
});
//app.use(csrfProtection);
app.get("/getcsrf", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/test", (req, res) => res.render("required-document"));
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
