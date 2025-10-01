const express = require("express");
const router = new express.Router();
const accController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const utilities = require("../utilities");

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accController.buildManagement),
);
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accController.buildUpdateAccount),
);
router.get("/login", accController.buildLogin);
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accController.accountLogin),
);
router.get("/register", accController.buildRegister);
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accController.registerAccount),
);
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.accountUpdateRules(),
  regValidate.checkAccountUpdateData,
  utilities.handleErrors(accController.updateAccount),
);
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.passwordUpdateRules(),
  regValidate.checkPasswordUpdateData,
  utilities.handleErrors(accController.updatePassword),
);
router.get("/logout", utilities.handleErrors(accController.accountLogout));

module.exports = router;
