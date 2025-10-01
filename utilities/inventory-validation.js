const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* ****************************************
 *  Inventory validation rules
 * *************************************** */
validate.inventoryValidation = () => {
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
validate.checkInventoryData = async (req, res, next) => {
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
    let nav = await utilities.getNav();
    let classificationSelect =
      await utilities.buildClassificationList(classification_id);
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

/* ****************************************
 * Check data and return errors or continue to inventory update
 **************************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
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
    let nav = await utilities.getNav();
    let classificationSelect =
      await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
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

module.exports = validate;
