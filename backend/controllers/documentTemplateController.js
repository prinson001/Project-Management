const supabase = require("../database/supabase");
const sql = require("../database/db");

const createDocumentTemplate = async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).json({
        status: "failure",
        message: "No document file uploaded",
      });
    }

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

    // Insert template data into database
    const insertQuery = `
        INSERT INTO document_template (
          name, arabic_name, description, iscapex, isopex, is_internal, is_external, phase
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name;
      `;

    const insertParams = [
      templateData.name,
      templateData.arabic_name,
      templateData.description || null,
      templateData.iscapex || false,
      templateData.isopex || false,
      templateData.is_internal || false,
      templateData.is_external || false,
      templateData.phase || [],
    ];

    const dbResult = await sql`
    INSERT INTO document_template (
      name, arabic_name, description, is_capex, is_opex, is_internal, is_external, phase
    ) VALUES (${templateData.name}, ${templateData.arabic_name}, ${
      templateData.description || null
    }, 
      ${templateData.iscapex || false}, ${templateData.isopex || false}, 
      ${templateData.is_internal || false}, ${
      templateData.is_external || false
    }, 
      ${templateData.phase || []})
    RETURNING id, name;
  `;

    if (!dbResult || dbResult.length === 0) {
      throw new Error("Database insertion failed");
    }
    const newTemplate = dbResult[0];

    // Sanitize filename
    const sanitizedName = newTemplate.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");

    // Generate unique filename
    const fileExtension = req.file.originalname.split(".").pop();
    const fileName = `${newTemplate.id}_${sanitizedName}.${fileExtension}`;
    const storagePath = `document-templates/${fileName}`;

    console.log("file extension", fileExtension);
    console.log("storage path", storagePath);

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("templates")
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("File upload failed:", uploadError);
      await sql.query("DELETE FROM document_template WHERE id = $1", [
        newTemplate.id,
      ]);
      return res.status(500).json({
        status: "failure",
        message: "File upload failed",
        error: uploadError.message,
      });
    }

    // Get public URL of the uploaded file
    const { data, error } = supabase.storage
      .from("templates")
      .getPublicUrl(storagePath);

    if (error) {
      console.error("Error getting public URL:", error);
    }

    const publicUrl = data?.publicUrl || null; // Ensure we handle undefined values
    console.log(publicUrl);
    // Update database with file information
    const updateQuery = `
        UPDATE document_template
        SET
          document_name = $1,
          document_path = $2,
          document_url = $3
        WHERE id = $4
        RETURNING *;
      `;

    const updateParams = [
      req.file.originalname,
      storagePath,
      publicUrl,
      newTemplate.id,
    ];

    const updatedTemplate = await sql`
    UPDATE document_template
    SET
      document_name = ${req.file.originalname},
      document_path = ${storagePath},
      document_url = ${publicUrl}
    WHERE id = ${newTemplate.id}
    RETURNING *;
  `;

    if (!updatedTemplate || updatedTemplate.length === 0) {
      throw new Error("Database update failed");
    }

    res.status(201).json({
      status: "success",
      message: "Document template created successfully",
      data: updatedTemplate[0],
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

const getCurrentPhaseDocuments = async (req, res) => {
  try {
    const { phase } = req.body;

    if (!phase) {
      return res.status(400).json({
        status: "failure",
        message: "Phase is required in the request body",
      });
    }

    // Fetch documents from the database where phase matches
    const documents = await sql`
      SELECT * FROM document_template WHERE phase @> ${[phase]}
    `;

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

module.exports = { createDocumentTemplate, getCurrentPhaseDocuments };
