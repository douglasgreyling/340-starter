const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId),
);
router.get("/detail/:id", utilities.handleErrors(invController.buildById));

router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildManagement),
);

router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddClassification),
);
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.classificationValidation(),
  utilities.checkClassificationData,
  utilities.handleErrors(invController.addClassification),
);

router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildAddInventory),
);
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidate.inventoryValidation(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory),
);

// Route to get inventory by classification as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON),
);

// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.editInventoryView),
);

// Route to handle inventory update
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  invValidate.inventoryValidation(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory),
);

// Route to build delete confirmation view
router.get(
  "/delete/:inv_id",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteConfirmationView),
);

// Route to handle inventory deletion
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventory),
);

module.exports = router;
