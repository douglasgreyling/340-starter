const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

Util.buildInventoryDetails = async function (data) {
  let detail = '<div class="inventory-details">';

  detail +=
    '<img src="' +
    data.inv_image +
    '" alt="Image of ' +
    data.inv_make +
    " " +
    data.inv_model +
    ' on CSE Motors" />';
  detail += '<div class="info">';
  detail += "<h2>" + data.inv_make + " " + data.inv_model + "</h2>";
  detail += "<hr />";
  detail += '<p><span class="bold">Year: </span>' + data.inv_year + "</p>";
  detail +=
    '<p><span class="bold">Price: </span>$' +
    new Intl.NumberFormat("en-US").format(data.inv_price) +
    "</p>";
  detail +=
    '<p><span class="bold">Miles: </span>' +
    new Intl.NumberFormat("en-US").format(data.inv_miles) +
    "</p>";
  detail += '<p><span class="bold">Color: </span>' + data.inv_color + "</p>";
  detail +=
    '<p><span class="bold">Description: </span>' +
    data.inv_description +
    "</p>";
  detail += "</div>";
  detail += "</div>";

  return detail;
};

Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      },
    );
  } else {
    next();
  }
};

Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Classification Name validation rules
 * *************************************** */
Util.classificationValidation = () => {
  const { body } = require("express-validator");
  return [
    // classification name is required and must be string with no spaces or special characters
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Classification name cannot contain spaces or special characters.",
      ),
  ];
};

/* ****************************************
 * Check data and return errors or continue to classification addition
 **************************************** */
Util.checkClassificationData = async (req, res, next) => {
  const { validationResult } = require("express-validator");
  const { classification_name } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await Util.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
    return;
  }
  next();
};

/* ****************************************
 * Build classification list for select dropdown
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 *  Inventory validation rules
 * *************************************** */
Util.inventoryValidation = () => {
  const { body } = require("express-validator");
  return [
    // Classification is required
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),

    // Make is required and must be string
    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters long."),

    // Model is required and must be string
    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters long."),

    // Year must be 4 digits
    body("inv_year")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be exactly 4 digits.")
      .isNumeric()
      .withMessage("Year must be numeric."),

    // Description is required
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters long."),

    // Image path is required
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required.")
      .matches(/^\/images\//)
      .withMessage("Image path must start with /images/"),

    // Thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required.")
      .matches(/^\/images\//)
      .withMessage("Thumbnail path must start with /images/"),

    // Price must be positive number
    body("inv_price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    // Miles must be positive integer
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),

    // Color is required
    body("inv_color")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Color must be at least 2 characters long."),
  ];
};

/* ****************************************
 * Check data and return errors or continue to inventory addition
 **************************************** */
Util.checkInventoryData = async (req, res, next) => {
  const { validationResult } = require("express-validator");
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await Util.getNav();
    let classificationSelect =
      await Util.buildClassificationList(classification_id);
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationSelect,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
    return;
  }
  next();
};

module.exports = Util;
