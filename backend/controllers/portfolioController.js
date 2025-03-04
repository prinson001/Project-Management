const sql = require("../database/db");

const addPortfolio = async (req, res) => {
  const { 
    portfolioEnglishName, 
    portfolioArabicName, 
    descriptionEnglish, 
    descriptionArabic, 
    portfolioManager 
  } = req.body;

  try {
    // Convert portfolioManager to integer if it's a string
    let managerId;
    
    if (typeof portfolioManager === 'string') {
      // If portfolioManager is a name like "Manager 1", we need to find the corresponding ID
      // This assumes you have a users table with a name column
      const managerResult = await sql`
        SELECT id FROM users WHERE name = ${portfolioManager} LIMIT 1
      `;
      
      if (managerResult.length > 0) {
        managerId = managerResult[0].id;
      } else {
        // Default to a valid user ID if the manager name doesn't exist
        // You might want to handle this differently based on your requirements
        return res.status(400).json({
          status: "failure",
          message: "Invalid portfolio manager selected",
          error: "Manager not found in users table"
        });
      }
    } else if (typeof portfolioManager === 'number') {
      // If it's already a number, use it directly
      managerId = portfolioManager;
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Invalid portfolio manager format",
        error: "Portfolio manager must be a user ID or name"
      });
    }

    const result = await sql`
      INSERT INTO portfolio (
        name, 
        arabic_name, 
        description, 
        arabic_description, 
        portfolio_manager,
        created_date
      ) 
      VALUES (
        ${portfolioEnglishName}, 
        ${portfolioArabicName}, 
        ${descriptionEnglish}, 
        ${descriptionArabic}, 
        ${managerId},
        CURRENT_DATE
      ) 
      RETURNING *`;

    res.status(200).json({
      status: "success",
      message: "Portfolio added successfully",
      result
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: "failure",
      message: "Error adding portfolio",
      error: e.message
    });
  }
};

module.exports = { addPortfolio };