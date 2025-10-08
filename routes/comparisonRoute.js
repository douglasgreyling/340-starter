const express = require("express");
const router = new express.Router();
const compController = require("../controllers/comparisonController");
const utilities = require("../utilities/");
const compValidate = require("../utilities/comparison-validation");

router.get("/select", utilities.handleErrors(compController.buildComparisonSelect));
router.get("/view", utilities.handleErrors(compController.buildComparisonView));
router.get("/popular", utilities.handleErrors(compController.buildPopularComparisons));

router.get(
  "/ajax/vehicles/:classification_id",
  utilities.handleErrors(compController.getVehiclesByClassification)
);

router.get(
  "/my-comparisons",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(compController.buildMyComparisons)
);

router.post(
  "/save",
  utilities.checkJWTToken,
  utilities.checkLogin,
  compValidate.saveComparisonRules(),
  compValidate.checkSaveComparisonData,
  utilities.handleErrors(compController.saveComparison)
);

router.get(
  "/saved/:comparison_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(compController.viewSavedComparison)
);

router.get(
  "/edit/:comparison_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(compController.buildEditComparison)
);

router.post(
  "/update/:comparison_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  compValidate.saveComparisonRules(),
  compValidate.checkSaveComparisonData,
  utilities.handleErrors(compController.updateComparison)
);

router.post(
  "/delete/:comparison_id",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(compController.deleteComparison)
);

module.exports = router;