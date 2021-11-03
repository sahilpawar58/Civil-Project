const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config();
const jwt_secret = process.env.JWT_SECRET;
const admin_secret = process.env.ADMIN_SECRET;
// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "", secret: "" };
  //incorrecr mail
  if (err.message === "Incorrect secret") {
    errors.secret = "Incorrect secret";
  }
  if (err.message === "Incorrect email") {
    errors.password = "Incorrect email or password";
  }
  if (err.message === "Incorrect password") {
    errors.password = "Incorrect email or password";
  }
  if (err.code === 11000) {
    // duplicate email error
    errors.email = "that email is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, jwt_secret, {
    expiresIn: maxAge,
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  let { firstname, lastname, email, password } = req.body;
  email = String(email);
  password = String(password);
  firstname = String(firstname);
  lastname = String(lastname);
  additionalinfo = {
    fullname: "",
    address: "",
    city: "",
    district: "",
    propertytype: null,
    adharcard: null,
    pancard: null,
  };
  
  // let finalres = mongoose.sanitizeFilter(
  //   JSON.stringify({ firstname, lastname, email, password })
  // );
  //console.log("here it is", finalres);
  try {
    role = "user";
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
      additionalinfo,
      
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  console.log("passed authController.js");
  //console.log(req);
  let { email, password } = req.body;
  email = String(email);
  password = String(password);
  try {
    const user = await User.login(email, String(password));
    if (user.role != "admin") {
      const token = createToken(user._id);
      //res.redirect("additional-user-info");
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    } else {
      errors = {
        errors: {
          email: "",
          password: "Incorrect email or password",
        },
      };

      res.status(400).json(errors);
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

//vendor login removed
// module.exports.vendorlogin_get = (req, res) => {
//   res.render("vendorlogin");
// };
module.exports.vendorsignup_get = (req, res) => {
  res.render("vendorsignup");
};
module.exports.vendorlogin_post = async (req, res) => {
  let { email, password } = req.body;
  email = String(email);
  password = String(password);
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.vendorsignup_post = async (req, res) => {
  let { firstname, lastname, email, password } = req.body;
  email = String(email);
  password = String(password);
  firstname = String(firstname);
  lastname = String(lastname);
  additionalinfo = {
    fullname: "",
    address: "",
    city: "",
    district: "",
    propertytype: null,
    adharcard: null,
    pancard: null,
  };
  try {
    role = "vendor";
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      role,
      additionalinfo,
    });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.adminsignup_post = async (req, res) => {
  let { firstname, lastname, email, password, secret } = req.body;
  email = String(email);
  password = String(password);
  firstname = String(firstname);
  lastname = String(lastname);
  secret = String(secret);
  if (secret == admin_secret) {
    try {
      role = "admin";
      const user = await User.create({
        firstname,
        lastname,
        email,
        password,
        role,
      });
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(201).json({ user: user._id });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  } else {
    const errors = handleErrors(Error("Incorrect secret"));
    res.status(403).json({ errors });
  }
};
module.exports.adminlogin_post = async (req, res) => {
  let { email, password, secret } = req.body;
  email = String(email);
  password = String(password);
  secret = String(secret);

  if (secret == admin_secret) {
    try {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ user: user._id });
    } catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
  } else {
    const errors = handleErrors(Error("Incorrect secret"));
    res.status(403).json({ errors });
  }
};

module.exports.additionalinfo = (req, res) => {
  //console.log(req);
  let { fullname, address, city, district, propertytype, adharcard, pancard } =
    req.body;
  const token = req.cookies.jwt;
  let newpropertytype = "";
  fullname = String(fullname);
  address = String(address);
  city = String(city);
  district = String(district);
  propertytype = Number(propertytype);
  adharcard = Number(adharcard);
  pancard = Number(pancard);
  //chossing property type
  switch (propertytype) {
    case 1:
      propertytype = "Residential";
      break;
    case 2:
      propertytype = "Commercial";
      break;
    case 3:
      propertytype = "Single Home";
      break;
  }
  additionalinfo = {
    fullname,
    address,
    city,
    district,
    propertytype,
    adharcard,
    pancard,
  };

  if (token) {
    jwt.verify(token, jwt_secret, async (err, decodedtoken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedtoken);
        let user = await User.findById(decodedtoken.id);
        const result = await User.updateOne(
          { email: user.email },
          {
            $set: {
              additionalinfo,
            },
          }
        );
        console.log(result);
        res.locals.user = user;
        res.render("home");
        //next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
