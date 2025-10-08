const pool = require("../database/");

async function getVehiclesForComparison() {
  try {
    const sql = `
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_price,
        i.inv_miles,
        i.inv_color,
        i.inv_image,
        i.inv_thumbnail,
        i.inv_description,
        c.classification_name,
        c.classification_id
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      ORDER BY c.classification_name, i.inv_make, i.inv_model
    `;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("model error: " + error);
    return [];
  }
}

async function getVehiclesByClassificationForComparison(classification_id) {
  try {
    const sql = `
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_price,
        i.inv_miles,
        i.inv_color,
        i.inv_image,
        i.inv_thumbnail,
        i.inv_description,
        c.classification_name,
        c.classification_id
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
      ORDER BY i.inv_make, i.inv_model
    `;
    const result = await pool.query(sql, [classification_id]);
    return result.rows;
  } catch (error) {
    console.error("model error: " + error);
    return [];
  }
}

async function getVehiclesByIds(vehicleIds) {
  try {
    const validIds = vehicleIds.filter(id => id != null);

    if (validIds.length === 0) {
      return [];
    }

    const placeholders = validIds.map((_, index) => `$${index + 1}`).join(', ');

    const sql = `
      SELECT
        i.inv_id,
        i.inv_make,
        i.inv_model,
        i.inv_year,
        i.inv_price,
        i.inv_miles,
        i.inv_color,
        i.inv_image,
        i.inv_thumbnail,
        i.inv_description,
        c.classification_name,
        c.classification_id
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.inv_id IN (${placeholders})
      ORDER BY i.inv_make, i.inv_model
    `;

    const result = await pool.query(sql, validIds);
    return result.rows;
  } catch (error) {
    console.error("model error: " + error);
    return [];
  }
}

async function saveComparison(comparisonData) {
  try {
    const {
      comparison_name,
      comparison_description,
      account_id,
      vehicle1_id,
      vehicle2_id,
      vehicle3_id
    } = comparisonData;

    const sql = `
      INSERT INTO comparison (
        comparison_name,
        comparison_description,
        account_id,
        vehicle1_id,
        vehicle2_id,
        vehicle3_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(sql, [
      comparison_name,
      comparison_description,
      account_id,
      vehicle1_id,
      vehicle2_id || null,
      vehicle3_id || null
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    return null;
  }
}

async function getUserComparisons(account_id) {
  try {
    const sql = `
      SELECT
        c.*,
        v1.inv_make || ' ' || v1.inv_model || ' (' || v1.inv_year || ')' as vehicle1_name,
        v2.inv_make || ' ' || v2.inv_model || ' (' || v2.inv_year || ')' as vehicle2_name,
        v3.inv_make || ' ' || v3.inv_model || ' (' || v3.inv_year || ')' as vehicle3_name,
        v1.inv_thumbnail as vehicle1_thumbnail,
        v2.inv_thumbnail as vehicle2_thumbnail,
        v3.inv_thumbnail as vehicle3_thumbnail
      FROM comparison c
      LEFT JOIN inventory v1 ON c.vehicle1_id = v1.inv_id
      LEFT JOIN inventory v2 ON c.vehicle2_id = v2.inv_id
      LEFT JOIN inventory v3 ON c.vehicle3_id = v3.inv_id
      WHERE c.account_id = $1
      ORDER BY c.created_date DESC
    `;

    const result = await pool.query(sql, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("model error: " + error);
    return [];
  }
}

async function getComparisonById(comparison_id, account_id = null) {
  try {
    let sql = `
      SELECT
        c.*,
        a.account_firstname,
        a.account_lastname
      FROM comparison c
      JOIN account a ON c.account_id = a.account_id
      WHERE c.comparison_id = $1
    `;

    let params = [comparison_id];

    if (account_id) {
      sql += ` AND c.account_id = $2`;
      params.push(account_id);
    }

    const result = await pool.query(sql, params);
    return result.rows[0] || null;
  } catch (error) {
    console.error("model error: " + error);
    return null;
  }
}

async function updateComparison(comparison_id, comparisonData, account_id) {
  try {
    const {
      comparison_name,
      comparison_description,
      vehicle1_id,
      vehicle2_id,
      vehicle3_id
    } = comparisonData;

    const sql = `
      UPDATE comparison SET
        comparison_name = $1,
        comparison_description = $2,
        vehicle1_id = $3,
        vehicle2_id = $4,
        vehicle3_id = $5
      WHERE comparison_id = $6 AND account_id = $7
      RETURNING *
    `;

    const result = await pool.query(sql, [
      comparison_name,
      comparison_description,
      vehicle1_id,
      vehicle2_id || null,
      vehicle3_id || null,
      comparison_id,
      account_id
    ]);

    return result.rows[0] || null;
  } catch (error) {
    console.error("model error: " + error);
    return null;
  }
}

async function deleteComparison(comparison_id, account_id) {
  try {
    const sql = `
      DELETE FROM comparison
      WHERE comparison_id = $1 AND account_id = $2
      RETURNING comparison_id
    `;

    const result = await pool.query(sql, [comparison_id, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("model error: " + error);
    return false;
  }
}

async function getPopularComparisons(limit = 10) {
  try {
    const sql = `
      SELECT
        c.vehicle1_id,
        c.vehicle2_id,
        c.vehicle3_id,
        COUNT(*) as comparison_count,
        MAX(c.comparison_name) as comparison_name,
        MAX(c.comparison_description) as comparison_description,
        MAX(c.created_date) as created_date,
        MAX(a.account_firstname) as account_firstname,
        v1.inv_make || ' ' || v1.inv_model || ' (' || v1.inv_year || ')' as vehicle1_name,
        v2.inv_make || ' ' || v2.inv_model || ' (' || v2.inv_year || ')' as vehicle2_name,
        v3.inv_make || ' ' || v3.inv_model || ' (' || v3.inv_year || ')' as vehicle3_name,
        v1.inv_thumbnail as vehicle1_thumbnail,
        v2.inv_thumbnail as vehicle2_thumbnail,
        v3.inv_thumbnail as vehicle3_thumbnail,
        v1.inv_price as vehicle1_price,
        v2.inv_price as vehicle2_price,
        v3.inv_price as vehicle3_price
      FROM comparison c
      JOIN account a ON c.account_id = a.account_id
      LEFT JOIN inventory v1 ON c.vehicle1_id = v1.inv_id
      LEFT JOIN inventory v2 ON c.vehicle2_id = v2.inv_id
      LEFT JOIN inventory v3 ON c.vehicle3_id = v3.inv_id
      GROUP BY c.vehicle1_id, c.vehicle2_id, c.vehicle3_id, 
               v1.inv_make, v1.inv_model, v1.inv_year, v1.inv_thumbnail, v1.inv_price,
               v2.inv_make, v2.inv_model, v2.inv_year, v2.inv_thumbnail, v2.inv_price,
               v3.inv_make, v3.inv_model, v3.inv_year, v3.inv_thumbnail, v3.inv_price
      ORDER BY COUNT(*) DESC, MAX(c.created_date) DESC
      LIMIT $1
    `;

    const result = await pool.query(sql, [limit]);
    return result.rows;
  } catch (error) {
    console.error("model error: " + error);
    return [];
  }
}

module.exports = {
  getVehiclesForComparison,
  getVehiclesByClassificationForComparison,
  getVehiclesByIds,
  saveComparison,
  getUserComparisons,
  getComparisonById,
  updateComparison,
  deleteComparison,
  getPopularComparisons
};