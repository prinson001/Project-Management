const supabase = require("../database/supabase");
const sql = require("../database/db");

const createDocumentTemplate = async (req, res) => {
  try {
    // Parse the JSON data from the request body
    let templateData;
    try {
      templateData = JSON.parse(req.body.data);
    } catch (err) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid JSON format in request body",
      });
    }

    // Validate required fields
    if (!templateData.name || !templateData.arabic_name) {
      return res.status(400).json({
        status: "failure",
        message: "Name and Arabic Name are required fields",
      });
    }

    // Extract file URL from the payload (optional field)
    const fileUrl = templateData.file_url || null;
    const fileName = fileUrl ? templateData.name + "_template" : null; // Optional: Generate a sanitized name if needed
    const storagePath = fileUrl ? `document-templates/${fileName}` : null;

    // Insert template data into database, including file URL if provided
    const insertQuery = `
      INSERT INTO document_template (
        name, arabic_name, description, is_capex, is_opex, is_internal, is_external, phase, document_name, document_path, document_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name;
    `;

    const insertParams = [
      templateData.name,
      templateData.arabic_name,
      templateData.description || null,
      templateData.is_capex || false,
      templateData.is_opex || false,
      templateData.is_internal || false,
      templateData.is_external || false,
      templateData.phase || [],
      fileName, // Optional: You can adjust this based on your needs
      storagePath, // Optional: Adjust this if you want to store a path
      fileUrl, // Store the provided file URL directly
    ];

    const dbResult = await sql`
      INSERT INTO document_template (
        name, arabic_name, description, is_capex, is_opex, is_internal, is_external, phase, document_name, document_path, document_url
      ) VALUES (${templateData.name}, ${templateData.arabic_name}, ${
      templateData.description || null
    }, 
        ${templateData.is_capex || false}, ${templateData.is_opex || false}, 
        ${templateData.is_internal || false}, ${
      templateData.is_external || false
    }, 
        ${templateData.phase || []}, ${fileName}, ${storagePath}, ${fileUrl})
      RETURNING id, name;
    `;

    if (!dbResult || dbResult.length === 0) {
      throw new Error("Database insertion failed");
    }

    const newTemplate = dbResult[0];

    res.status(201).json({
      status: "success",
      message: "Document template created successfully",
      data: {
        id: newTemplate.id,
        name: newTemplate.name,
        arabic_name: templateData.arabic_name,
        description: templateData.description,
        is_capex: templateData.is_capex,
        is_opex: templateData.is_opex,
        is_internal: templateData.is_internal,
        is_external: templateData.is_external,
        phase: templateData.phase,
        document_url: fileUrl,
      },
    });
  } catch (error) {
    console.error("Error creating document template:", error);

    // Handle specific database error codes
    if (error.code === "23505") {
      return res.status(409).json({
        status: "failure",
        message: "Template name already exists",
      });
    }

    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Other functions remain unchanged
const getCurrentPhaseDocumentTemplates = async (req, res) => {
  try {
    const { phase } = req.body;
    console.log("Fetching document templates for phase:", phase, "Type:", typeof phase);
    
    if (!phase) {
      return res.status(400).json({
        status: "failure",
        message: "Phase is required in the request body",
      });
    }

    // Ensure phase is a string
    const phaseValue = String(phase);
    console.log("Using phase value:", phaseValue);

    // Use string-based search to handle concatenated phase strings
    // This will match if the phase name appears anywhere in the phase column
    const documents = await sql`
      SELECT * FROM document_template 
      WHERE LOWER(phase::text) LIKE ${'%' + phaseValue.toLowerCase() + '%'}
    `;
    
    console.log(`Found ${documents.length} document templates for phase ${phaseValue}`);
    
    res.status(200).json({
      status: "success",
      message: "Documents retrieved successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents for phase:", error);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

const getProjectPhaseDocuments = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        status: "failure",
        message: "Both projectId are required in the request body",
      });
    }

    const documents = await sql`
      SELECT pd.*, dt.name, dt.arabic_name, dt.description 
      FROM project_documents pd
      JOIN document_template dt ON pd.template_id = dt.id
      WHERE pd.project_id = ${projectId}
    `;

    res.status(200).json({
      status: "success",
      message: "Project documents retrieved successfully",
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching project documents:", error);
    res.status(500).json({
      status: "failure",
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

module.exports = {
  createDocumentTemplate,
  getCurrentPhaseDocumentTemplates,
  getProjectPhaseDocuments,
};
