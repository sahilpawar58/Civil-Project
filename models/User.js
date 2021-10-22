const { isEmail } = require("validator");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "Please enter Firstname"],
  },
  lastname: {
    type: String,
    required: [true, "Please enter Lastname"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter valid email"],
  },
  role: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "MinLength is 6"],
  },
  additionalinfo: {
    fullname: {
      type: String,
      lowercase: true,
    },
    address: {
      type: String,
      lowercase: true,
    },
    city: {
      type: String,
      lowercase: true,
    },
    district: {
      type: String,
      lowercase: true,
    },
    propertytype: {
      type: String,
      lowercase: true,
    },
    adharcard: {
      type: Number,
    },
    pancard: {
      type: String,
    },
  },
});
// fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  this.password = String(this.password);
  this.email = String(this.email);
  //console.log(this.password, this.email);
  console.log("user about to log in ", this);
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//static methos to login user
userSchema.statics.login = async function (temail, tpassword) {
  const email = String(temail);
  const password = String(tpassword);
  console.log(email, password);
  console.log(typeof email, typeof password);
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);

    if (auth) {
      return user;
      //console.log(user);
    }
    throw Error("Incorrect password");
  }
  throw Error("Incorrect email");
};
const User = mongoose.model("user", userSchema);
module.exports = User;
