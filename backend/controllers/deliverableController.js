const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const sql = require('../database/db'); // Your existing postgres.js instance
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage to pass buffer to Supabase
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not allowed! Allowed types: " + allowedTypes.toString()));
  }
});

// Helper function to determine storage folder based on document type
const getStorageFolderPath = (documentType, deliverableId) => {
  switch (documentType) {
    case 'INVOICE':
      return `invoices/${deliverableId}`;
    case 'DELIVERY_NOTE':
      return `delivery-completions/${deliverableId}`;
    case 'SCOPE_EVIDENCE':
      return `scope-evidence/${deliverableId}`;
    default:
      return `other-documents/${deliverableId}`;
  }
};

// Helper function to get document download URL from Supabase storage
const getDocumentDownloadUrl = async (storagePath, bucketName = 'deliverable-proofs') => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 3600); // URL valid for 1 hour

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getDocumentDownloadUrl:', error);
    return null;
  }
};

const getItemsWithDeliverables = async (req, res) => {
  let { projectId } = req.body;
  try {
    const items = await sql`
            SELECT
              i.*,
              COALESCE(
                json_agg(d.* ORDER BY d.created_at) FILTER (WHERE d.id IS NOT NULL),
                '[]'
              ) as deliverables
            FROM item i
            LEFT JOIN deliverable d ON d.item_id = i.id
            WHERE i.project_id = ${projectId} AND i.type != 'Operation'
            GROUP BY i.id
          `;

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

const saveDeliverablesItems = async (req, res) => {
  const { newDeliverables, updatedDeliverables, deletedDeliverables } =
    req.body;

  try {
    await sql.begin(async (trx) => {
      // Delete first
      if (deletedDeliverables.length) {
        await trx`
          DELETE FROM deliverable
          WHERE id IN ${sql(deletedDeliverables)}
        `;
      }

      // Dynamic update for existing deliverables
      if (updatedDeliverables.length) {
        for (const deliverable of updatedDeliverables) {
          const { id, ...fields } = deliverable;
          await trx`
            UPDATE deliverable
            SET ${sql(fields)}
            WHERE id = ${id}
          `;
        }
      }

      // Insert new
      if (newDeliverables.length) {
        await trx`
          INSERT INTO deliverable ${sql(newDeliverables)}
        `;
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Save failed:", error);
    res.status(500).json({ error: "Save failed" });
  }
};

const getDeliverables = async (req, res) => {
  const { itemId } = req.body;

  if (!itemId) {
    res.status(400).json({
      status: "failure",
      message: "Project id is missing",
    });
    return;
  }
  try {
    const result =
      await sql`SELECT * FROM "deliverable" where item_id = ${itemId} `;
    res.status(200).json({
      status: "success",
      message: "tasks records fetched successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "failed to fetch tasks record",
      result: e.message,
    });
  }
};

const saveDeliverables = async (req, res) => {
  try {
    const { newItems, updates, deletions } = req.body;

    await sql.begin(async (trx) => {
      // Insert new records
      if (newItems?.length > 0) {
        await trx`
            INSERT INTO deliverable ${sql(newItems)} 
            RETURNING id
          `;
      }

      // Update existing records
      if (updates?.length > 0) {
        for (const item of updates) {
          const { id, ...fields } = item;
          await trx`
              UPDATE deliverable 
              SET ${sql(fields)} 
              WHERE id = ${id}
            `;
        }
      }

      // Delete records - CORRECTED SECTION
      if (deletions?.length > 0) {
        const validDeletions = deletions.map(Number).filter((id) => !isNaN(id));

        if (validDeletions.length > 0) {
          await trx`
              DELETE FROM deliverable 
              WHERE id IN ${sql(validDeletions)}
            `;
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Operations completed successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

async function uploadDeliverableDocument(req, res) {
  const { deliverableId } = req.params;
  const {
    document_type, // e.g., 'INVOICE', 'SCOPE_EVIDENCE'
    description,
    invoice_amount,
    invoice_date,
    related_scope_percentage,
    related_payment_percentage
  } = req.body;
  // const userId = req.user.id; // From your auth middleware

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }  const file = req.file;
  
  // Use helper function to get the appropriate folder path
  const folderPath = getStorageFolderPath(document_type, deliverableId);
  const uniqueFileName = `${folderPath}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
  const bucketName = 'deliverable-proofs'; // Use same bucket as submitDeliverableDocument

  try {
    // Step 1: Upload file to Supabase Storage
    // const { data: uploadResult, error: uploadError } = await supabase.storage
    //   .from(bucketName)
    //   .upload(uniqueFileName, file.buffer, {
    //     contentType: file.mimetype,
    //     upsert: false, // Set to true if you want to overwrite if file exists
    //   });

    // if (uploadError) {
    //   console.error('Supabase storage upload error:', uploadError);
    //   return res.status(500).json({ message: "Storage upload failed.", error: uploadError.message });
    // }
    // const storagePath = uploadResult.path; // Path in Supabase storage

    // SIMULATED - replace with actual Supabase upload above
    const storagePath = uniqueFileName; // Placeholder for actual path from Supabase    // Step 2: Prepare data for appropriate table based on document type
    const documentData = {
      deliverable_id: deliverableId,
      document_type,
      file_name: file.originalname,
      storage_path: storagePath,
      mime_type: file.mimetype,
      file_size_bytes: file.size,
      description,
      invoice_amount: document_type === 'INVOICE' && invoice_amount ? parseFloat(invoice_amount) : null,
      invoice_date: document_type === 'INVOICE' && invoice_date ? invoice_date : null,
      related_scope_percentage: related_scope_percentage ? parseInt(related_scope_percentage, 10) : null,
      related_payment_percentage: related_payment_percentage ? parseInt(related_payment_percentage, 10) : null,
      uploaded_at: sql`NOW()`,
    };

    let insertedDocument;
    
    // Route to appropriate table based on document type
    if (document_type === 'INVOICE') {
      // Insert into deliverable_payment_history for invoice documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_payment_history ${sql(documentData)}
        RETURNING id, deliverable_id, document_type, related_scope_percentage, related_payment_percentage, invoice_amount
      `;
    } else if (document_type === 'DELIVERY_NOTE') {
      // Insert into deliverable_progress_history for delivery completion documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_progress_history ${sql(documentData)}
        RETURNING id, deliverable_id, document_type, related_scope_percentage, related_payment_percentage, invoice_amount
      `;
    } else {
      // For other document types (like SCOPE_EVIDENCE), keep using deliverable_documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_documents ${sql(documentData)}
        RETURNING id, deliverable_id, document_type, related_scope_percentage, related_payment_percentage, invoice_amount
      `;
    }    // Step 3: Update the parent deliverable based on the document
    let deliverableUpdateQuery = null;
    if (insertedDocument.document_type === 'SCOPE_EVIDENCE' && insertedDocument.related_scope_percentage !== null) {
      deliverableUpdateQuery = sql`
        UPDATE deliverable
        SET scope_percentage = ${insertedDocument.related_scope_percentage}
        WHERE id = ${insertedDocument.deliverable_id}
        RETURNING id, scope_percentage
      `;
    } else if (insertedDocument.document_type === 'INVOICE' && insertedDocument.related_payment_percentage !== null) {
      // If an invoice also implies a certain payment percentage completion
      deliverableUpdateQuery = sql`
        UPDATE deliverable
        SET payment_percentage = ${insertedDocument.related_payment_percentage} 
        WHERE id = ${insertedDocument.deliverable_id}
        RETURNING id, payment_percentage
      `;
    } else if (insertedDocument.document_type === 'DELIVERY_NOTE') {
      // Update deliverable progress when delivery note is uploaded
      try {
        await sql`
          INSERT INTO deliverable_progress (deliverable_id, scope_percentage, status, last_updated)
          VALUES (${insertedDocument.deliverable_id}, 100, 'COMPLETED', NOW())
          ON CONFLICT (deliverable_id) DO UPDATE SET
            scope_percentage = 100,
            status = 'COMPLETED',
            last_updated = NOW()
        `;
      } catch (progressError) {
        console.error("Error updating deliverable_progress for delivery completion:", progressError);
      }
    }

    if (deliverableUpdateQuery) {
      const [updatedDeliverable] = await deliverableUpdateQuery;
      // console.log('Updated deliverable:', updatedDeliverable);
    }

    res.status(201).json({ message: "Document uploaded and processed successfully.", document: insertedDocument });

  } catch (dbError) {
    console.error('Database or processing error:', dbError);
    // TODO: If DB operation fails after storage upload, consider deleting the file from storage (rollback)
    res.status(500).json({ message: "Server error during document processing.", error: dbError.message });
  }
}

const submitDeliverableDocument = async (req, res) => {
  // Debug log to see what is received
  console.log('submitDeliverableDocument req.params:', req.params);
  console.log('submitDeliverableDocument req.body:', req.body);

  // Hardcode deliverable_id and document_type for testing
  const actualDeliverableId = req.params.deliverable_id || '12'; // fallback to 12 for test
  const document_type = req.body.document_type || 'INVOICE';
  const {
    invoice_amount,
    related_payment_percentage,
    related_scope_percentage,
    description,
  } = req.body; // These come from FormData

  const file = req.file;
  // const userId = req.user?.id; // Assuming verifyToken middleware adds user to req - Placeholder
  const userId = '00000000-0000-0000-0000-000000000000'; // Replace with actual user ID from auth

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }
  // Use actualDeliverableId from params for the check
  if (!actualDeliverableId || !document_type) {
    return res.status(400).json({ error: "Missing deliverable_id (from URL) or document_type (from body)." });
  }
  if (!userId) { // Basic check, ensure proper auth in production
    return res.status(401).json({ error: "User not authenticated." });
  }  const bucketName = 'deliverable-proofs'; // Make sure this bucket exists in your Supabase project
  
  // Use helper function to get the appropriate folder path
  const folderPath = getStorageFolderPath(document_type, actualDeliverableId);
  const uniqueFileName = `${folderPath}/${Date.now()}_${file.originalname.replace(/\\s+/g, '_')}`;

  try {
    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false, // true to overwrite if file exists, false to error
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload file to storage.", details: uploadError.message });
    }    // 2. Insert record into appropriate table based on document type
    const documentRecord = {
      deliverable_id: actualDeliverableId, // Use actualDeliverableId from params
      document_type,
      file_name: file.originalname,
      storage_path: uploadData.path, // path from Supabase storage response
      mime_type: file.mimetype,
      file_size_bytes: file.size, // Fixed column name
      invoice_amount: invoice_amount ? parseFloat(invoice_amount) : null,
      related_payment_percentage: related_payment_percentage ? parseInt(related_payment_percentage, 10) : null,
      related_scope_percentage: related_scope_percentage ? parseInt(related_scope_percentage, 10) : null,
      description: description || null,
      status: 'PENDING_REVIEW', // Default status
      uploaded_at: sql`NOW()`, // Set upload timestamp
    };

    let insertedDocument;
    
    // Route to appropriate table based on document type
    if (document_type === 'INVOICE') {
      // Insert into deliverable_payment_history for invoice documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_payment_history ${sql(documentRecord)}
        RETURNING *
      `;
    } else if (document_type === 'DELIVERY_NOTE') {
      // Insert into deliverable_progress_history for delivery completion documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_progress_history ${sql(documentRecord)}
        RETURNING *
      `;
    } else {
      // For other document types (like SCOPE_EVIDENCE), keep using deliverable_documents
      [insertedDocument] = await sql`
        INSERT INTO deliverable_documents ${sql(documentRecord)}
        RETURNING *
      `;
    }    // Update deliverable_progress based on the document
    if (insertedDocument.document_type === 'SCOPE_EVIDENCE' && insertedDocument.scope_percentage_at_upload !== null) {
      const newScopePercentage = insertedDocument.scope_percentage_at_upload;
      let newStatus;

      if (newScopePercentage >= 100) {
        newStatus = 'PENDING_REVIEW'; 
      } else if (newScopePercentage > 0) {
        newStatus = 'IN_PROGRESS';
      } else { 
        newStatus = 'NOT_STARTED';
      }

      try {
        const [updatedProgress] = await sql`
          INSERT INTO deliverable_progress (deliverable_id, scope_percentage, status, last_updated)
          VALUES (${insertedDocument.deliverable_id}, ${newScopePercentage}, ${newStatus}, NOW())
          ON CONFLICT (deliverable_id) DO UPDATE SET
            scope_percentage = EXCLUDED.scope_percentage,
            status = EXCLUDED.status,
            last_updated = NOW()
          RETURNING *
        `;
        // console.log('Updated deliverable_progress:', updatedProgress);
      } catch (progressError) {
        console.error("Error updating deliverable_progress:", progressError);
      }
    } else if (insertedDocument.document_type === 'DELIVERY_NOTE') {
      // Update deliverable progress when delivery note is uploaded
      try {
        const [updatedProgress] = await sql`
          INSERT INTO deliverable_progress (deliverable_id, scope_percentage, status, last_updated)
          VALUES (${insertedDocument.deliverable_id}, 100, 'COMPLETED', NOW())
          ON CONFLICT (deliverable_id) DO UPDATE SET
            scope_percentage = 100,
            status = 'COMPLETED',
            last_updated = NOW()
          RETURNING *
        `;
        // console.log('Updated deliverable_progress for delivery completion:', updatedProgress);
      } catch (progressError) {
        console.error("Error updating deliverable_progress for delivery completion:", progressError);
      }
    }
    // TODO: Consider if other document_types (e.g., INVOICE, DELIVERY_NOTE) should affect deliverable_progress.status

    res.status(201).json({
      success: true,
      message: "Document submitted successfully.",
      document: insertedDocument,
    });

  } catch (error) {
    console.error("Error submitting deliverable document:", error);
    // If storage upload succeeded but DB insert failed, consider deleting the orphaned file from storage.
    // This is a good practice for production but omitted here for brevity.
    res.status(500).json({ error: "Server error while submitting document.", details: error.message });
  }
};

// Get all deliverables for a specific project (expects projectId from params)
const getDeliverablesByProjectId = async (req, res) => {
  const projectId = req.params.projectid;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required in params" });
  }

  try {    const deliverables = await sql`
      WITH latest_payment_percentage AS (
        SELECT 
          deliverable_id,
          related_payment_percentage,
          ROW_NUMBER() OVER (PARTITION BY deliverable_id ORDER BY uploaded_at DESC) as rn
        FROM deliverable_payment_history 
        WHERE related_payment_percentage IS NOT NULL
      )
      SELECT 
        d.id, 
        d.name, 
        d.amount, /* This is used as the budget/total value */
        d.start_date,
        d.end_date,
        d.duration,
        d.item_id, 
        i.project_id,
        COALESCE(dp.progress_percentage, 0) as progress_percentage,
        COALESCE(dp.scope_percentage, 0) as scope_percentage,
        COALESCE(dp.status, 'NOT_STARTED') as status,
        dp.notes as progress_notes,
        COALESCE(SUM(dph.invoice_amount), 0) as invoiced,
        COALESCE(d.amount, 0) - COALESCE(SUM(dph.invoice_amount), 0) as remaining_budget,
        COALESCE(
          lpp.related_payment_percentage, 
          ROUND(LEAST( (COALESCE(SUM(dph.invoice_amount), 0) / NULLIF(d.amount, 0)) * 100 , 100))
        ) as payment_percentage,
        d.created_at,
        d.updated_at,
        dp.updated_at as progress_updated_at
      FROM deliverable d
      JOIN item i ON d.item_id = i.id 
      LEFT JOIN deliverable_progress dp ON d.id = dp.deliverable_id
      LEFT JOIN deliverable_payment_history dph ON d.id = dph.deliverable_id
      LEFT JOIN latest_payment_percentage lpp ON d.id = lpp.deliverable_id AND lpp.rn = 1
      WHERE i.project_id = ${projectId}
      GROUP BY d.id, i.project_id, dp.id, lpp.related_payment_percentage
      ORDER BY d.start_date ASC, d.created_at ASC
    `;
    return res.status(200).json(deliverables);
  } catch (error) {
    console.error("Error fetching deliverables by project ID (params):", error);
    res.status(500).json({ message: "Error fetching project deliverables", error: error.message });
  }
};

// NEW: Get all deliverables for a specific project (expects projectId in body)
const getProjectDeliverablesFromBody = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required in body" });
  }

  try {    const deliverables = await sql`
      WITH latest_payment_percentage AS (
        SELECT 
          deliverable_id,
          related_payment_percentage,
          ROW_NUMBER() OVER (PARTITION BY deliverable_id ORDER BY uploaded_at DESC) as rn
        FROM deliverable_payment_history 
        WHERE related_payment_percentage IS NOT NULL
      )
      SELECT 
        d.id, 
        d.name, 
        d.amount, /* This is used as the budget/total value */
        d.start_date,
        d.end_date,
        d.duration,
        d.item_id, 
        i.project_id,
        COALESCE(dp.progress_percentage, 0) as progress_percentage,
        COALESCE(dp.scope_percentage, 0) as scope_percentage,
        COALESCE(dp.status, 'NOT_STARTED') as status,
        dp.notes as progress_notes,
        COALESCE(SUM(dph.invoice_amount), 0) as invoiced,
        COALESCE(d.amount, 0) - COALESCE(SUM(dph.invoice_amount), 0) as remaining_budget,
        COALESCE(
          lpp.related_payment_percentage, 
          ROUND(LEAST( (COALESCE(SUM(dph.invoice_amount), 0) / NULLIF(d.amount, 0)) * 100 , 100))
        ) as payment_percentage,
        d.created_at,
        d.updated_at,
        dp.updated_at as progress_updated_at
      FROM deliverable d
      JOIN item i ON d.item_id = i.id
      LEFT JOIN deliverable_progress dp ON d.id = dp.deliverable_id
      LEFT JOIN deliverable_payment_history dph ON d.id = dph.deliverable_id
      LEFT JOIN latest_payment_percentage lpp ON d.id = lpp.deliverable_id AND lpp.rn = 1
      WHERE i.project_id = ${projectId}
      GROUP BY d.id, i.project_id, dp.id, lpp.related_payment_percentage
      ORDER BY d.start_date ASC, d.created_at ASC
    `;
    return res.status(200).json(deliverables);
  } catch (error) {
    console.error("Error fetching deliverables by project ID (body):", error);
    res.status(500).json({ message: "Error fetching project deliverables", error: error.message });
  }
};

const getDeliverablesByProject = async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    return res.status(400).json({ message: "Project ID is required in params" });
  }
  try {
    const result = await sql`
      SELECT
        d.id,
        d.name,
        d.description,
        TO_CHAR(d.start_date, 'YYYY-MM-DD') as start_date,
        TO_CHAR(d.end_date, 'YYYY-MM-DD') as end_date,
        d.amount,
        i.project_id, 
        dp.id as progress_id,
        COALESCE(dp.progress_percentage, 0) as progress_percentage,
        COALESCE(dp.status, 'NOT_STARTED') as progress_status,
        COALESCE(dp.scope_percentage, 0) as scope_percentage,
        dp.notes as progress_notes,
        dp.last_updated as progress_last_updated,
        d.item_id,
        d.created_at,
        d.updated_at
      FROM deliverable d
      JOIN item i ON d.item_id = i.id
      LEFT JOIN deliverable_progress dp ON d.id = dp.deliverable_id
      WHERE i.project_id = ${projectId}
      ORDER BY d.start_date ASC, d.created_at ASC
    `;
    res.json(result);
  } catch (error) {
    console.error('Error fetching deliverables by project (params):', error);
    res.status(500).json({ message: 'Error fetching deliverables by project', error: error.message });
  }
};

const getDeliverableById = async (req, res) => {
  const { id } = req.params; // This is deliverable ID
  if (!id) {
    return res.status(400).json({ message: "Deliverable ID is required" });
  }
  try {
    const result = await sql`
      SELECT
        d.id,
        d.name,
        d.description,
        TO_CHAR(d.start_date, 'YYYY-MM-DD') as start_date,
        TO_CHAR(d.end_date, 'YYYY-MM-DD') as end_date,
        d.amount,
        i.project_id, 
        dp.id as progress_id,
        COALESCE(dp.progress_percentage, 0) as progress_percentage,
        COALESCE(dp.status, 'NOT_STARTED') as progress_status,
        COALESCE(dp.scope_percentage, 0) as scope_percentage,
        dp.notes as progress_notes,
        dp.last_updated as progress_last_updated,
        d.item_id,
        d.created_at,
        d.updated_at
      FROM deliverable d
      JOIN item i ON d.item_id = i.id 
      LEFT JOIN deliverable_progress dp ON d.id = dp.deliverable_id
      WHERE d.id = ${id}
    `;
    if (result.length === 0) {
      return res.status(404).json({ message: 'Deliverable not found' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching deliverable by ID:', error);
    res.status(500).json({ message: 'Error fetching deliverable by ID', error: error.message });
  }
};

// NEW: Manually update deliverable progress
const updateDeliverableProgressManual = async (req, res) => {
  const { deliverableId } = req.params;
  const {
    scope_percentage,
    progress_percentage,
    status,
    notes
  } = req.body;

  if (scope_percentage === undefined && progress_percentage === undefined && status === undefined && notes === undefined) {
    return res.status(400).json({ message: "No update data provided." });
  }

  const parsedScopePercentage = scope_percentage !== undefined ? parseFloat(scope_percentage) : undefined;
  const parsedProgressPercentage = progress_percentage !== undefined ? parseFloat(progress_percentage) : undefined;

  if (parsedScopePercentage !== undefined && (isNaN(parsedScopePercentage) || parsedScopePercentage < 0 || parsedScopePercentage > 100)) {
    return res.status(400).json({ message: "Invalid scope_percentage. Must be a number between 0 and 100." });
  }
  if (parsedProgressPercentage !== undefined && (isNaN(parsedProgressPercentage) || parsedProgressPercentage < 0 || parsedProgressPercentage > 100)) {
    return res.status(400).json({ message: "Invalid progress_percentage. Must be a number between 0 and 100." });
  }
  // TODO: Add validation for 'status' against an enum or predefined list if applicable

  try {
    const updateFields = {};
    const setClauses = [];
    const values = [deliverableId];
    let valueCounter = 2; // Start after deliverableId

    if (parsedScopePercentage !== undefined) {
      updateFields.scope_percentage = parsedScopePercentage;
      setClauses.push(sql`scope_percentage = ${parsedScopePercentage}`);
    }
    if (parsedProgressPercentage !== undefined) {
      updateFields.progress_percentage = parsedProgressPercentage;
      setClauses.push(sql`progress_percentage = ${parsedProgressPercentage}`);
    } else if (parsedScopePercentage !== undefined && parsedProgressPercentage === undefined) {
      // Default progress_percentage to scope_percentage if scope is given and progress is not
      updateFields.progress_percentage = parsedScopePercentage;
      setClauses.push(sql`progress_percentage = ${parsedScopePercentage}`);
    }
    if (status !== undefined) {
      updateFields.status = status;
      setClauses.push(sql`status = ${status}`);
    }
    if (notes !== undefined) { // Allow empty string for notes
      updateFields.notes = notes;
      setClauses.push(sql`notes = ${notes}`);
    }
    
    updateFields.last_updated = sql`NOW()`; // Always update timestamp
    setClauses.push(sql`last_updated = NOW()`);


    if (setClauses.length === 1 && updateFields.last_updated) { // Only last_updated means no effective change
        return res.status(400).json({ message: "No effective update data provided beyond timestamp." });
    }
    
    // Prepare for INSERT part
    const insertColumns = ['deliverable_id'];
    const insertValuesPlaceholders = [deliverableId]; // SQL injection safe placeholder for deliverableId

    if (updateFields.scope_percentage !== undefined) {
        insertColumns.push('scope_percentage');
        insertValuesPlaceholders.push(updateFields.scope_percentage);
    }
    if (updateFields.progress_percentage !== undefined) {
        insertColumns.push('progress_percentage');
        insertValuesPlaceholders.push(updateFields.progress_percentage);
    }
    if (updateFields.status !== undefined) {
        insertColumns.push('status');
        insertValuesPlaceholders.push(updateFields.status);
    }
    if (updateFields.notes !== undefined) {
        insertColumns.push('notes');
        insertValuesPlaceholders.push(updateFields.notes);
    }
    // last_updated will be handled by default or NOW() on insert/update

    const [updatedProgress] = await sql`
      INSERT INTO deliverable_progress (${sql(insertColumns)})
      VALUES (${sql(insertValuesPlaceholders)})
      ON CONFLICT (deliverable_id) DO UPDATE SET
        ${sql.join(setClauses, sql`, `)}
      RETURNING *
    `;

    res.status(200).json({
      success: true,
      message: "Deliverable progress updated successfully.",
      progress: updatedProgress,
    });

  } catch (error) {
    console.error("Error updating deliverable progress manually:", error);
    if (error.message.includes("check constraint")) { // More specific error for check constraint
        return res.status(400).json({ message: "Update failed due to invalid data (e.g., percentage out of range).", error: error.message });
    }
    res.status(500).json({ message: "Server error while updating progress.", error: error.message });
  }
};

// Get payment history for a specific deliverable
const getDeliverablePaymentHistory = async (req, res) => {
  const { deliverableId } = req.params;

  if (!deliverableId) {
    return res.status(400).json({ message: "Deliverable ID is required" });
  }

  try {
    const paymentHistory = await sql`
      SELECT 
        id,
        deliverable_id,
        document_type,
        file_name,
        storage_path,
        mime_type,
        file_size_bytes,
        uploaded_at,
        description,
        invoice_amount,
        invoice_date,
        related_scope_percentage,
        related_payment_percentage,
        status
      FROM deliverable_payment_history
      WHERE deliverable_id = ${deliverableId}
      ORDER BY uploaded_at DESC
    `;
    
    return res.status(200).json(paymentHistory);
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ message: "Error fetching payment history", error: error.message });
  }
};

// Get progress history for a specific deliverable
const getDeliverableProgressHistory = async (req, res) => {
  const { deliverableId } = req.params;

  if (!deliverableId) {
    return res.status(400).json({ message: "Deliverable ID is required" });
  }

  try {
    const progressHistory = await sql`
      SELECT 
        id,
        deliverable_id,
        document_type,
        file_name,
        storage_path,
        mime_type,
        file_size_bytes,
        uploaded_at,
        description,
        invoice_amount,
        invoice_date,
        related_scope_percentage,
        related_payment_percentage,
        status
      FROM deliverable_progress_history
      WHERE deliverable_id = ${deliverableId}
      ORDER BY uploaded_at DESC
    `;
    
    return res.status(200).json(progressHistory);
  } catch (error) {
    console.error("Error fetching progress history:", error);
    res.status(500).json({ message: "Error fetching progress history", error: error.message });
  }
};

// Get all documents for a specific deliverable with download URLs
const getDeliverableDocuments = async (req, res) => {
  const { deliverableId } = req.params;
  const { documentType } = req.query; // Optional filter by document type

  if (!deliverableId) {
    return res.status(400).json({ message: "Deliverable ID is required" });
  }

  try {
    let documents = [];

    // Get documents from all relevant tables
    const [paymentDocs, progressDocs, otherDocs] = await Promise.all([
      // Payment history documents
      sql`
        SELECT 
          id, deliverable_id, document_type, file_name, storage_path,
          mime_type, file_size_bytes, uploaded_at, description,
          invoice_amount, invoice_date, related_scope_percentage,
          related_payment_percentage, status, 'payment_history' as source_table
        FROM deliverable_payment_history
        WHERE deliverable_id = ${deliverableId}
        ${documentType ? sql`AND document_type = ${documentType}` : sql``}
      `,
      
      // Progress history documents  
      sql`
        SELECT 
          id, deliverable_id, document_type, file_name, storage_path,
          mime_type, file_size_bytes, uploaded_at, description,
          invoice_amount, invoice_date, related_scope_percentage,
          related_payment_percentage, status, 'progress_history' as source_table
        FROM deliverable_progress_history
        WHERE deliverable_id = ${deliverableId}
        ${documentType ? sql`AND document_type = ${documentType}` : sql``}
      `,
      
      // Other documents (scope evidence, etc.)
      sql`
        SELECT 
          id, deliverable_id, document_type, file_name, storage_path,
          mime_type, file_size_bytes, uploaded_at as uploaded_at, description,
          invoice_amount, invoice_date, related_scope_percentage,
          related_payment_percentage, status, 'documents' as source_table
        FROM deliverable_documents
        WHERE deliverable_id = ${deliverableId}
        ${documentType ? sql`AND document_type = ${documentType}` : sql``}
      `
    ]);

    // Combine all documents
    documents = [...paymentDocs, ...progressDocs, ...otherDocs];

    // Generate download URLs for each document
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const downloadUrl = await getDocumentDownloadUrl(doc.storage_path);
        return {
          ...doc,
          download_url: downloadUrl,
          folder_type: doc.document_type === 'INVOICE' ? 'invoices' :
                      doc.document_type === 'DELIVERY_NOTE' ? 'delivery-completions' :
                      doc.document_type === 'SCOPE_EVIDENCE' ? 'scope-evidence' : 'other-documents'
        };
      })
    );

    // Sort by upload date (newest first)
    documentsWithUrls.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));

    return res.status(200).json({
      deliverable_id: deliverableId,
      total_documents: documentsWithUrls.length,
      documents: documentsWithUrls
    });

  } catch (error) {
    console.error("Error fetching deliverable documents:", error);
    res.status(500).json({ message: "Error fetching deliverable documents", error: error.message });
  }
};

module.exports = {
  getItemsWithDeliverables,
  saveDeliverablesItems,
  getDeliverables,
  saveDeliverables,
  uploadDeliverableDocument,
  submitDeliverableDocument,
  getDeliverablesByProjectId,
  getProjectDeliverablesFromBody,
  getDeliverablesByProject,
  getDeliverableById,
  updateDeliverableProgressManual,
  getDeliverablePaymentHistory,
  getDeliverableProgressHistory,
  getDeliverableDocuments,
  // ...other exports
};
