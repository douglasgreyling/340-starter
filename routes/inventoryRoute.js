const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");

router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId),
);
router.get("/detail/:id", utilities.handleErrors(invController.buildById));

router.get("/", utilities.handleErrors(invController.buildManagement));

router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification),
);
router.post(
  "/add-classification",
  utilities.classificationValidation(),
  utilities.checkClassificationData,
  utilities.handleErrors(invController.addClassification),
);

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory),
);
router.post(
  "/add-inventory",
  utilities.inventoryValidation(),
  utilities.checkInventoryData,
  utilities.handleErrors(invController.addInventory),
);

module.exports = router;
