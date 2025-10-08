const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

validate.saveComparisonRules = () => {
  return [
    // Comparison name is required
    body("comparison_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3, max: 100 })
      .withMessage("Please provide a comparison name between 3-100 characters."),

    // Comparison description is optional but if provided, validate length
    body("comparison_description")
      .optional({ checkFalsy: true })
      .trim()
      .escape()
      .isLength({ max: 500 })
      .withMessage("Description cannot exceed 500 characters."),

    // At least one vehicle must be selected
    body("vehicle1_id")
      .notEmpty()
      .isInt({ min: 1 })
      .withMessage("Please select at least one vehicle for comparison."),

    // Vehicle 2 is optional but if provided must be valid integer
    body("vehicle2_id")
      .optional({ checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle selection for vehicle 2."),

    // Vehicle 3 is optional but if provided must be valid integer
    body("vehicle3_id")
      .optional({ checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("Invalid vehicle selection for vehicle 3."),
  ];
};

validate.checkSaveComparisonData = async (req, res, next) => {
  const {
    comparison_name,
    comparison_description,
    vehicle1_id,
    vehicle2_id,
    vehicle3_id
  } = req.body;

  let errors = [];
  errors = validationResult(req);

  const selectedVehicles = [vehicle1_id, vehicle2_id, vehicle3_id]
    .filter(id => id && id !== '')
    .map(id => parseInt(id));

  const uniqueVehicles = [...new Set(selectedVehicles)];

  if (selectedVehicles.length !== uniqueVehicles.length) {
    errors.errors.push({
      msg: "Please select different vehicles for comparison.",
      param: "vehicle_selection",
      location: "body"
    });
  }

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();

    const isEdit = req.route.path.includes('edit') || req.route.path.includes('update');

    if (isEdit) {
      const comparison_id = req.params.comparison_id;
      const comparisonModel = require("../models/comparison-model");
      const invModel = require("../models/inventory-model");

      const comparison = await comparisonModel.getComparisonById(comparison_id, res.locals.accountData.account_id);

      const vehicleIds = [comparison.vehicle1_id, comparison.vehicle2_id, comparison.vehicle3_id].filter(id => id);
      const comparisonVehicles = await comparisonModel.getVehiclesByIds(vehicleIds);

      const classifications = await invModel.getClassifications();

      res.render("comparison/edit", {
        title: `Edit Comparison: ${comparison.comparison_name}`,
        nav,
        comparison: {
          ...comparison,
          comparison_name,
          comparison_description,
          vehicle1_id,
          vehicle2_id,
          vehicle3_id
        },
        classifications: classifications.rows,
        vehicles: comparisonVehicles,
        errors,
      });
    } else {
      const queryParams = new URLSearchParams({
        vehicle1: vehicle1_id || '',
        vehicle2: vehicle2_id || '',
        vehicle3: vehicle3_id || ''
      }).toString();

      req.flash("notice", "Please correct the errors and try again.");
      res.redirect(`/compare/view?${queryParams}`);
    }
    return;
  }
  next();
};

module.exports = validate;