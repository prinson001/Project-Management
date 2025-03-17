const sql = require("../database/db");

//  @Description add new Vendor
//  @Route site.com/data-management/addvendor
const addVendor = async (req, res) => {
  // Check if data exists in the request body
  console.log('Vendor Body', req.body);
  
  // Create a data object from the request body
  const data = { ...req.body };
  
  // Remove userId from data as it's not a column in the vendor table
  if (data.userId) {
    delete data.userId;
  }
  
  // Map form field names to database column names
  if (data.vendorEnglish) {
    data.name = data.vendorEnglish;
    delete data.vendorEnglish;
  }
  
  if (data.vendorArabic) {
    data.arabic_name = data.vendorArabic;
    delete data.vendorArabic;
  }
  
  console.log('Processed data:', data);

  // Make sure we have at least some data to insert
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      status: "failure",
      message: "No data fields provided for insertion",
      result: null,
    });
  }

  try {
    // Extract column names and values from the data object
    const columns = Object.keys(data);
    const values = Object.values(data);

    // Validate column names to prevent SQL injection
    for (const column of columns) {
      if (!/^[a-zA-Z0-9_]+$/.test(column)) {
        return res.status(400).json({
          status: "failure",
          message: `Invalid column name: ${column}`,
          result: null,
        });
      }
    }

    // Build parameterized query
    const placeholders = columns.map((_, index) => `$${index + 1}`);

    const queryText = `
        INSERT INTO vendor (${columns.map((col) => `"${col}"`).join(", ")})
        VALUES (${placeholders.join(", ")})
        RETURNING *
      `;

    // Execute the query
    const result = await sql.unsafe(queryText, values);

    // Return success response with the newly created vendor
    return res.status(201).json({
      status: "success",
      message: "Vendor added successfully",
      result: result[0] || result,
    });
  } catch (error) {
    console.error("Error adding vendor:", error);

    // Handle unique constraint violations or other specific errors
    if (error.code === "23505") {
      // PostgreSQL unique violation code
      return res.status(409).json({
        status: "failure",
        message: "Vendor with this identifier already exists",
        result: error.detail || error,
      });
    }

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error adding vendor",
      result: error.message || error,
    });
  }
};

//  @Description get all vendors
//  @Route site.com/data-management/vendors
const getVendors = async (req, res) => {
  try {
    // Build the query to get all vendors
    const queryText = `
      SELECT * FROM vendor
      ORDER BY id DESC
    `;

    // Execute the query
    const result = await sql.unsafe(queryText);

    // Return success response with all vendors
    return res.status(200).json({
      status: "success",
      message: "Vendors retrieved successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error retrieving vendors:", error);

    // Handle other errors
    return res.status(500).json({
      status: "failure",
      message: "Error retrieving vendors",
      result: error.message || error,
    });
  }
};

module.exports = { addVendor, getVendors };
