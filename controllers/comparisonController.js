const utilities = require("../utilities/");
const comparisonModel = require("../models/comparison-model");
const invModel = require("../models/inventory-model");

const compCont = {};

compCont.buildComparisonSelect = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const vehicles = await comparisonModel.getVehiclesForComparison();

  res.render("comparison/select", {
    title: "Compare Vehicles",
    nav,
    classifications: classifications.rows,
    vehicles,
    errors: null,
  });
};

compCont.getVehiclesByClassification = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  const vehicles = await comparisonModel.getVehiclesByClassificationForComparison(classification_id);

  if (vehicles.length > 0) {
    return res.json(vehicles);
  } else {
    return res.json([]);
  }
};

compCont.buildComparisonView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { vehicle1, vehicle2, vehicle3 } = req.query;

  if (!vehicle1) {
    req.flash("notice", "Please select at least one vehicle to compare.");
    return res.redirect("/compare/select");
  }

  const vehicleIds = [vehicle1, vehicle2, vehicle3].filter(id => id && id !== '');
  const vehicles = await comparisonModel.getVehiclesByIds(vehicleIds);

  if (vehicles.length === 0) {
    req.flash("notice", "No vehicles found for comparison.");
    return res.redirect("/compare/select");
  }

  const organizedVehicles = {
    vehicle1: vehicles.find(v => v.inv_id == vehicle1) || null,
    vehicle2: vehicles.find(v => v.inv_id == vehicle2) || null,
    vehicle3: vehicles.find(v => v.inv_id == vehicle3) || null
  };

  res.render("comparison/compare", {
    title: "Vehicle Comparison",
    nav,
    vehicles: organizedVehicles,
    vehicleIds: { vehicle1, vehicle2, vehicle3 },
    errors: null,
  });
};

compCont.saveComparison = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    comparison_name,
    comparison_description,
    vehicle1_id,
    vehicle2_id,
    vehicle3_id
  } = req.body;

  const account_id = res.locals.accountData.account_id;

  if (!comparison_name || !vehicle1_id) {
    req.flash("notice", "Comparison name and at least one vehicle are required.");
    return res.redirect(`/compare/view?vehicle1=${vehicle1_id}&vehicle2=${vehicle2_id || ''}&vehicle3=${vehicle3_id || ''}`);
  }

  const comparisonData = {
    comparison_name,
    comparison_description,
    account_id,
    vehicle1_id: parseInt(vehicle1_id),
    vehicle2_id: vehicle2_id ? parseInt(vehicle2_id) : null,
    vehicle3_id: vehicle3_id ? parseInt(vehicle3_id) : null
  };

  const result = await comparisonModel.saveComparison(comparisonData);

  if (result) {
    req.flash("notice", `Comparison "${comparison_name}" saved successfully!`);
    res.redirect("/compare/my-comparisons");
  } else {
    req.flash("notice", "Sorry, saving the comparison failed.");
    return res.redirect(`/compare/view?vehicle1=${vehicle1_id}&vehicle2=${vehicle2_id || ''}&vehicle3=${vehicle3_id || ''}`);
  }
};

compCont.buildMyComparisons = async function (req, res, next) {
  let nav = await utilities.getNav();
  const account_id = res.locals.accountData.account_id;
  const comparisons = await comparisonModel.getUserComparisons(account_id);

  res.render("comparison/my-comparisons", {
    title: "My Saved Comparisons",
    nav,
    comparisons,
    errors: null,
  });
};

compCont.viewSavedComparison = async function (req, res, next) {
  let nav = await utilities.getNav();
  const comparison_id = parseInt(req.params.comparison_id);
  const account_id = res.locals.accountData.account_id;

  const comparison = await comparisonModel.getComparisonById(comparison_id, account_id);

  if (!comparison) {
    req.flash("notice", "Comparison not found or you don't have permission to view it.");
    return res.redirect("/compare/my-comparisons");
  }

  const vehicleIds = [comparison.vehicle1_id, comparison.vehicle2_id, comparison.vehicle3_id];
  const vehicles = await comparisonModel.getVehiclesByIds(vehicleIds);

  const organizedVehicles = {
    vehicle1: vehicles.find(v => v.inv_id == comparison.vehicle1_id) || null,
    vehicle2: vehicles.find(v => v.inv_id == comparison.vehicle2_id) || null,
    vehicle3: vehicles.find(v => v.inv_id == comparison.vehicle3_id) || null
  };

  res.render("comparison/saved", {
    title: `Comparison: ${comparison.comparison_name}`,
    nav,
    comparison,
    vehicles: organizedVehicles,
    errors: null,
  });
};

compCont.buildEditComparison = async function (req, res, next) {
  let nav = await utilities.getNav();
  const comparison_id = parseInt(req.params.comparison_id);
  const account_id = res.locals.accountData.account_id;

  const comparison = await comparisonModel.getComparisonById(comparison_id, account_id);

  if (!comparison) {
    req.flash("notice", "Comparison not found or you don't have permission to edit it.");
    return res.redirect("/compare/my-comparisons");
  }

  const vehicleIds = [comparison.vehicle1_id, comparison.vehicle2_id, comparison.vehicle3_id].filter(id => id);
  const comparisonVehicles = await comparisonModel.getVehiclesByIds(vehicleIds);

  const classifications = await invModel.getClassifications();

  res.render("comparison/edit", {
    title: `Edit Comparison: ${comparison.comparison_name}`,
    nav,
    comparison,
    classifications: classifications.rows,
    vehicles: comparisonVehicles,
    errors: null,
  });
};

compCont.updateComparison = async function (req, res, next) {
  const comparison_id = parseInt(req.params.comparison_id);
  const account_id = res.locals.accountData.account_id;
  const {
    comparison_name,
    comparison_description,
    vehicle1_id,
    vehicle2_id,
    vehicle3_id
  } = req.body;

  const comparisonData = {
    comparison_name,
    comparison_description,
    vehicle1_id: parseInt(vehicle1_id),
    vehicle2_id: vehicle2_id ? parseInt(vehicle2_id) : null,
    vehicle3_id: vehicle3_id ? parseInt(vehicle3_id) : null
  };

  const result = await comparisonModel.updateComparison(comparison_id, comparisonData, account_id);

  if (result) {
    req.flash("notice", `Comparison "${comparison_name}" updated successfully!`);
    res.redirect(`/compare/saved/${comparison_id}`);
  } else {
    req.flash("notice", "Sorry, updating the comparison failed.");
    res.redirect(`/compare/edit/${comparison_id}`);
  }
};

compCont.deleteComparison = async function (req, res, next) {
  const comparison_id = parseInt(req.params.comparison_id);
  const account_id = res.locals.accountData.account_id;

  const result = await comparisonModel.deleteComparison(comparison_id, account_id);

  if (result) {
    req.flash("notice", "Comparison deleted successfully!");
  } else {
    req.flash("notice", "Sorry, deleting the comparison failed.");
  }

  res.redirect("/compare/my-comparisons");
};

compCont.buildPopularComparisons = async function (req, res, next) {
  let nav = await utilities.getNav();
  const comparisons = await comparisonModel.getPopularComparisons(20);

  res.render("comparison/popular", {
    title: "Popular Vehicle Comparisons",
    nav,
    comparisons,
    errors: null,
  });
};

module.exports = compCont;