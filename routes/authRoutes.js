const { Router } = require("express");
const authController = require("../controllers/authController");
const router = Router();
const rateLimit = require("express-rate-limit");

//1 hour 10 request
const createAccountLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 min window
  max: 20, // Start blocking after 20 requests
  message:
    "Too many accounts created from this IP, please try again after an hour",
});

const loginAccountLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 min window
  max: 20, // Start blocking after 100 requests
  message: "Too many requests from this IP, please try again after an hour",
});

//user-routes
router.get("/signup", authController.signup_get);
router.post("/signup", createAccountLimiter, authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", loginAccountLimiter, authController.login_post);
router.get("/logout", authController.logout_get);

//vendor-routes
/*router.get("/vendor-login", authController.vendorlogin_get);
router.post(
  "/vendor-login",
  loginAccountLimiter,
  authController.vendorlogin_post
);
//vendor login combined with userlogin
router.get("/vendor-signup", authController.vendorsignup_get);
*/
router.post(
  "/vendor-signup",
  createAccountLimiter,
  authController.vendorsignup_post
);

router.get("/admin/signup", (req, res) => {
  res.render("adminsignup");
});
router.get("/admin/login", (req, res) => {
  res.render("adminlogin");
});
router.post(
  "/admin/login",
  loginAccountLimiter,
  authController.adminlogin_post
);
router.post(
  "/admin/signup",
  createAccountLimiter,
  authController.adminsignup_post
);
module.exports = router;
