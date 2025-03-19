const sql = require("../database/db");
const supabase = require("../database/supabase"); // Import the initialized Supabase client

// @Description Add a new project document reference
// @Route site.com/data-management/addProjectDocument
const addProjectDocument = async (req, res) => {
  
  console.log("inside the add project document");
  const { project_id, template_id, phase } = req.body;
  const file = req.file; // This should be populated by multer

  console.log("Received file:", file); // Debugging line
  console.log("Request body:", req.body); // Debugging line

  // Check if the file and required fields are present
  if (!file) {
    return res.status(400).json({
      status: "failure",
      message: "No file uploaded.",
    });
  }

  if (!project_id || !template_id || !phase) {
    return res.status(400).json({
      status: "failure",
      message: "Project ID, Template ID, and Phase are required.",
    });
  }

  try {
    // Upload the file to Supabase storage
    const { data, error } = await supabase.storage
      .from("project-documents")
      .upload(`projects/${project_id}/${file.originalname}`, file.buffer);

    console.log("Supabase upload response:", { data, error }); // Log the response

    if (error) {
      console.error("Error uploading file:", error);
      return res.status(500).json({
        status: "failure",
        message: "Failed to upload document",
        result: error.message || error,
      });
    }

    // Save the document metadata to the database
    const documentData = {
      project_id,
      template_id,
      phase,
      file_url: data.fullPath, // Use fullPath or data.path for the file URL
      uploaded_at: new Date(),
    };

    console.log("Document data to be inserted:", documentData); // Log document data

    // Ensure all required fields are defined before insertion
    if (!documentData.project_id || !documentData.template_id || !documentData.file_url || !documentData.phase) {
      return res.status(400).json({
        status: "failure",
        message: "Missing required document data.",
      });
    }

    const result = await sql`
      INSERT INTO project_documents (project_id, template_id, phase, file_url, uploaded_at)
      VALUES (${documentData.project_id}, ${documentData.template_id}, ${documentData.phase}, ${documentData.file_url}, ${documentData.uploaded_at})
      RETURNING *;
    `;

    return res.status(201).json({
      status: "success",
      message: "Document uploaded successfully",
      result: result[0],
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      status: "failure",
      message: "Error uploading document",
      result: error.message || error,
    });
  }
};

module.exports = {
  addProjectDocument,
}; 