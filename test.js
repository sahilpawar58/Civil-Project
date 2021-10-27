const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");

var svgCaptcha = require("svg-captcha");

var captcha = svgCaptcha.create();
console.log(captcha);
// {data: '<svg.../svg>', text: 'abcd'}
const app = express();
var svgCaptcha = require("svg-captcha");

app.get("/captcha", function (req, res) {
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;

  res.type("svg");
  res.status(200).send(captcha.data);
});
