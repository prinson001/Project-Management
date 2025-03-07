const sql = require("./db");

const createUsersTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        family_name VARCHAR(100),
        arabic_first_name VARCHAR(100),
        arabic_family_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error(`Error in creating table user ${e}`);
  }
};

const createInitiativeTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE initiative (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT ,
        arabic_name VARCHAR(255) , 
        arabic_description TEXT ,   
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL DEFAULT 'Draft',
        CONSTRAINT status_check CHECK (status IN ('Approved', 'Waiting', 'Draft', 'Linked'))
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(200);
    throw new Error(`error in creating Initiative table`);
  }
};

const createDepartmentTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE department (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        arabic_name VARCHAR(255) NOT NULL
    )`;
    console.log(result);
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error in creating department table");
  }
};

const createObjectiveTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE objective(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        description TEXT,
        arabic_name VARCHAR(255),
        arabic_description TEXT,
        created_date DATE
    )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error in creating objective table");
  }
};

const createVendorTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE vendor(
          id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          arabic_name VARCHAR(255)
      )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error(`Error in creating vendor table ${e}`);
  }
};

const createTableRole = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE role (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL ,
            arabic_name VARCHAR(50) UNIQUE NOT NULL
    )`;
    res.status(200);
    res.json({ status: "success", result });
  } catch (e) {
    res.status(500);
    throw new Error("Error creating role table");
  }
};

const createTableTableSetting = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE user_table_settings(
        id SERIAL PRIMARY KEY,
        user_id INT ,
        table_name VARCHAR(100) NOT NULL,
        setting JSONB NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    console.log(result);
    res.status(200);
    res.json({
      status: "success",
      message: "create table tableSetting successfully",
      result,
    });
  } catch (e) {
    res.status(500);
    res.json({ status: "failure", message: e });
  }
};

const insertTableSetting = async (req, res) => {
  try {
    const result =
      await sql`INSERT INTO user_table_settings (table_name, setting, is_default)
  VALUES (
      'initiative', 
      '{
  "tableName": "initiative",
  "setting": [
    {
      "columnName": "Initiative Id",
      "dbColumn": "id",
      "columnOrder": 0,
      "isVisible": true
    },
    {
      "columnName": "English Name",
      "dbColumn": "name",
      "columnOrder": 1,
      "isVisible": true
    },
    {
      "columnName": "Arabic Name",
      "dbColumn": "name",
      "columnOrder": 2,
      "isVisible": true
    },
    {
      "columnName": "CreatedDate",
      "dbColumn": "created_at",
      "columnOrder": 3,
      "isVisible": true
    },
    {
      "columnName": "Status",
      "dbColumn": "status",
      "columnOrder": 4,
      "isVisible": true
    }
  ]
}
'::jsonb, 
      TRUE
  );`;
    res.status(200);
    res.json({ status: "success", message: "data inserted successfully" });
  } catch (e) {
    res.status(500);
    res.json({ status: "failure", message: "failed to insert table data" });
  }
};

const connectUserWithRole = async (req, res) => {
  try {
    const result = await sql`
      ALTER TABLE users 
      ADD COLUMN role_id INT,
      ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL
    `;

    console.log(result);
    res.status(200).json({
      status: "success",
      message: "Foreign key added to users table successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const connectUserWithDepartment = async (req, res) => {
  try {
    const result = await sql`
      ALTER TABLE users 
      ADD COLUMN department_id INT,
      ADD CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
    `;

    console.log(result);
    res.status(200).json({
      status: "success",
      message: "Foreign key added to users table successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const createTableActivityDuration = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE activity_duration (
        id SERIAL PRIMARY KEY,
        activity_name VARCHAR(255) NOT NULL,
        from_role VARCHAR(100) NOT NULL,
        to_role VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        last_modified DATE
    )`;

    console.log(result);
    res.status(200).json({
      status: "success",
      message: "Created table activity_duration successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const createTablePhase = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE phase (
        id SERIAL PRIMARY KEY,
        phase_name VARCHAR(255) NOT NULL,
        phase_order INTEGER NOT NULL
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table phase successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const createTableBudgetRange = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE budget_range (
        id SERIAL PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        min_budget NUMERIC,
        max_budget NUMERIC,
        budget_order INTEGER NOT NULL
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table budget_range successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const createTablePhaseDuration = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE phase_duration (
        id SERIAL PRIMARY KEY,
        phase_id INTEGER REFERENCES phase(id) NOT NULL,
        range_id INTEGER REFERENCES budget_range(id) NOT NULL,
        duration_weeks INTEGER NOT NULL,
        UNIQUE(phase_id, range_id)
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table phase_duration successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};
const setDefaultPhases = async (req, res) => {
  try {
    const defaultPhases = [
      "Prepare RFP",
      "RFP Releasing Procedures",
      "Bidding Duration",
      "Technical and financial evaluation",
      "Contract preparation",
      "Waiting period before execution starts",
    ];

    const results = [];

    for (const [index, phaseName] of defaultPhases.entries()) {
      const result = await sql`
        INSERT INTO phase (phase_name, phase_order)
        VALUES (${phaseName}, ${index + 1})
        RETURNING *
      `;
      results.push(result);
    }

    res.status(201).json({
      status: "success",
      message: "Default phases seeded successfully",
      data: results,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Failed to seed phases: ${e.message}`,
    });
  }
};
const getPhaseDurations = async (req, res) => {
  try {
    const result = await sql`
    SELECT 
      p.id AS phase_id,
      p.phase_name,
      p.phase_order,
      COALESCE(
        JSON_OBJECT_AGG(
          br.id,
          JSON_BUILD_OBJECT(
            'name', COALESCE(br.label, 'Default Range'),
            'min', COALESCE(br.min_budget, 0),
            'max', COALESCE(br.max_budget, NULL),
            'duration_weeks', COALESCE(pd.duration_weeks, 0)
          )
        ) FILTER (WHERE br.id IS NOT NULL),
        '{}'::json
      ) AS budget_durations
    FROM phase p
    LEFT JOIN phase_duration pd ON p.id = pd.phase_id
    LEFT JOIN budget_range br ON pd.range_id = br.id
    GROUP BY p.id, p.phase_name, p.phase_order
    ORDER BY p.phase_order;
  `;

    res.status(200).json({
      status: "success",
      message: "Phase durations retrieved successfully",
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch phase durations: ${e.message}`,
    });
  }
};
const getBudgetRanges = async (req, res) => {
  try {
    const result = await sql`
      SELECT 
        id,
        label as name,
        min_budget AS min,
        max_budget AS max
      FROM budget_range
      ORDER BY budget_order;
    `;

    res.status(200).json({
      status: "success",
      message: "Budget ranges retrieved successfully",
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch budget ranges: ${e.message}`,
    });
  }
};

const getPhaseDurationsByBudget = async (req, res) => {
  try {
    const { budget } = req.body;

    if (!budget || isNaN(budget)) {
      return res.status(400).json({
        status: "failure",
        message: "Invalid or missing budget parameter",
      });
    }

    // Convert actual budget to match the scale in the database
    const scaledBudget = budget / 1_000_000;

    // Find the appropriate budget range for the given budget
    const budgetRange = await sql`
      SELECT id, label, min_budget, max_budget
      FROM budget_range
      WHERE min_budget <= ${scaledBudget} 
        AND (max_budget IS NULL OR max_budget >= ${scaledBudget})
      LIMIT 1;
    `;

    if (budgetRange.length === 0) {
      return res.status(404).json({
        status: "failure",
        message: "No budget range found for the given budget",
      });
    }

    const rangeId = budgetRange[0].id;

    // Retrieve phase durations for the determined budget range
    const result = await sql`
      SELECT 
        p.id AS phase_id,
        p.phase_name,
        pd.duration_weeks
      FROM phase p
      LEFT JOIN phase_duration pd ON p.id = pd.phase_id
      WHERE pd.range_id = ${rangeId}
      ORDER BY p.id;
    `;

    res.status(200).json({
      status: "success",
      message: "Phase durations retrieved successfully",
      budget_range: budgetRange[0],
      data: result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: `Failed to fetch phase durations: ${e.message}`,
    });
  }
};

const updatePhaseDurations = async (req, res) => {
  try {
    // Validate request body structure
    if (!Array.isArray(req.body?.updates)) {
      return res.status(400).json({
        status: "failure",
        message: "Required field missing: updates array is required",
      });
    }

    const { updates } = req.body;
    const validationErrors = [];

    // Phase 1: Pre-transaction validation
    updates.forEach((change, index) => {
      const errorPrefix = `Change ${index + 1}:`;

      if (!Number.isInteger(change.phase_id)) {
        validationErrors.push(`${errorPrefix} Invalid or missing phase_id`);
      }
      if (!Number.isInteger(change.range_id)) {
        validationErrors.push(`${errorPrefix} Invalid or missing range_id`);
      }
      if (!Number.isInteger(change.duration_weeks)) {
        validationErrors.push(`${errorPrefix} Invalid duration_weeks format`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "failure",
        message: "Validation errors detected",
        errors: validationErrors,
      });
    }

    // Phase 2: Transaction processing
    const result = await sql.begin(async (transaction) => {
      const processedChanges = [];

      for (const change of updates) {
        const upsertResult = await transaction`
          INSERT INTO phase_duration (
            phase_id,
            range_id,
            duration_weeks
          ) VALUES (
            ${change.phase_id},
            ${change.range_id},
            ${change.duration_weeks}
          )
          ON CONFLICT (phase_id, range_id) DO UPDATE
          SET
            duration_weeks = EXCLUDED.duration_weeks
          RETURNING *
        `;

        if (upsertResult.length === 0) {
          throw new Error(
            `Failed to upsert phase ${change.phase_id}, range ${change.range_id}`
          );
        }

        processedChanges.push(upsertResult[0]);
      }

      return processedChanges;
    });

    return res.status(200).json({
      status: "success",
      message: "All changes completed atomically",
      updated: result,
    });
  } catch (error) {
    console.error("Atomic update error:", error);

    // Handle unique constraint violation specifically
    if (error.message.includes("unique constraint")) {
      return res.status(409).json({
        status: "failure",
        message: "Conflict detected - please verify phase/range combinations",
      });
    }

    return res.status(500).json({
      status: "failure",
      message: "Atomic update failed - all changes rolled back",
      error: error.message,
    });
  }
};

const createTableTask = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL 
        CHECK (status IN ('Open', 'Delayed', 'Done')),
      due_date DATE,
      assigned_to INTEGER REFERENCES users(id) NOT NULL,
      related_entity_type VARCHAR(50) NOT NULL,
      related_entity_id INTEGER NOT NULL,
      created_date DATE DEFAULT CURRENT_DATE
    );`;
    res.status(200);
    res.json({
      status: "success",
      message: "successfully created task object",
      result,
    });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "Failed to create task Object",
      result: e,
    });
  }
};

const createTableWorkflowRule = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE workflow_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      trigger_entity_type VARCHAR(255) NOT NULL,
      trigger_on VARCHAR(100),
      from_status VARCHAR(255) NOT NULL,
      to_status  VARCHAR(255) NOT NULL,
      task_title VARCHAR(255) NOT NULL,
      task_description TEXT,
      due_date_offset INTEGER,
      assignment_path VARCHAR(255) NOT NULL
    );`;

    res.status(200).json({
      status: "success",
      message: "Successfully created workflow_rules table",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "Failed to create workflow_rules table",
      error: e.message,
    });
  }
};
const createTablePortfolio = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE portfolio (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      arabic_name VARCHAR(255),
      description TEXT,
      arabic_description TEXT,
      portfolio_manager INTEGER REFERENCES users(id) ,
      created_date DATE DEFAULT CURRENT_DATE
    );`;

    res.status(200).json({
      status: "success",
      message: "Successfully created portfolio object",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "Failed to create portfolio Object",
      result: e.message,
    });
  }
};

const createTableProgram = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE program (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      arabic_name VARCHAR(255),
      description TEXT,
      arabic_description TEXT,
      program_manager INTEGER REFERENCES users(id) ,
      created_date DATE DEFAULT CURRENT_DATE
    );`;

    res.status(200).json({
      status: "success",
      message: "Successfully created program object",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "Failed to create program Object",
      result: e.message,
    });
  }
};

const createTypeProjectCategory = async (req, res) => {
  try {
    const result = await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_category') THEN
          CREATE TYPE project_category AS ENUM ('capex', 'opex');
        END IF;
      END$$;
    `;

    res.status(200).json({
      status: "success",
      message: "Created type project_category successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

// Create project_type table
const createTableProjectType = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS project_type (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table project_type successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

// Create project_phase table
const createTableProjectPhase = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS project_phase (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      description TEXT,
      order_position INT
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table project_phase successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

// Create project table
const createTableProject = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS project (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      arabic_name VARCHAR(255) ,
      description TEXT ,
      project_type_id INT REFERENCES project_type(id) ,
      current_phase_id INT REFERENCES project_phase(id) ,
      category project_category NOT NULL,
      project_manager_id INT REFERENCES users(id) NOT NULL,
      alternative_project_manager_id INT REFERENCES users(id),
      execution_start_date DATE NOT NULL,
      execution_duration INTERVAL NOT NULL,
      maintenance_duration INTERVAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    res.status(200).json({
      status: "success",
      message: "Created table project successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

// Create timestamp update trigger for project table
const createProjectTimestampTrigger = async (req, res) => {
  try {
    const result = await sql`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_project_timestamp ON project;
      
      CREATE TRIGGER update_project_timestamp
      BEFORE UPDATE ON project
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `;

    res.status(200).json({
      status: "success",
      message: "Created timestamp trigger for project table successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

const createTableItem = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit  VARCHAR(100) NOT NULL,
    quantity NUMERIC(15,3) NOT NULL CHECK (quantity > 0),
    unit_amount NUMERIC(15,2) NOT NULL CHECK (unit_amount >= 0),
    total NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_amount) STORED,
    type VARCHAR(50),
    project_id INT REFERENCES project(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    res.status(200).json({
      status: "success",
      message: "created table item",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "failed to create item table",
      result: e.message,
    });
  }
};

const createTableDeliverable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE deliverable (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    Amount NUMERIC(15,3) NOT NULL,
    start_date DATE ,
    end_date DATE ,
    Duration INTERVAL,
    item_id INT REFERENCES item(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
    res.status(200).json({
      status: "success",
      message: "created table deliverable",
      result,
    });
  } catch (e) {
    res.status(500).json({
      status: "failure",
      message: "failed to create deliverable table",
      result: e.message,
    });
  }
};
const createDocumentTemplateTable = async (req, res) => {
  try {
    const result = await sql`CREATE TABLE document_template (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      arabic_name VARCHAR(255),
      description TEXT,
      is_capex BOOLEAN DEFAULT false,
      is_opex BOOLEAN DEFAULT false,
      is_internal BOOLEAN DEFAULT false,
      is_external BOOLEAN DEFAULT false,
      phase VARCHAR(50)[] NOT NULL,
      document_path VARCHAR(255) ,
      document_name VARCHAR(255) ,
      document_url TEXT,
      isrequired BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );`;

    res.status(200);
    res.json({
      status: "success",
      message: "Successfully created document_template table",
      result,
    });
  } catch (e) {
    res.status(500);
    res.json({
      status: "failure",
      message: "Failed to create document_template table",
      error: e.message,
    });
  }
};
const connectObjectiveWithProject = async (req, res) => {
  try {
    const result = await sql`
      ALTER TABLE objective 
      ADD COLUMN project_id INT,
      ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
    `;

    console.log(result);
    res.status(200).json({
      status: "success",
      message: "Foreign key added to objective table successfully",
      result,
    });
  } catch (e) {
    res.status(500).json({ status: "failure", message: e.message });
  }
};

module.exports = {
  createUsersTable,
  createInitiativeTable,
  createDepartmentTable,
  createObjectiveTable,
  createVendorTable,
  createTableRole,
  createTableTableSetting,
  insertTableSetting,
  connectUserWithRole,
  connectUserWithDepartment,
  createTableActivityDuration,
  createTablePhase,
  createTableBudgetRange,
  createTablePhaseDuration,
  setDefaultPhases,
  getPhaseDurations,
  getBudgetRanges,
  getPhaseDurationsByBudget,
  updatePhaseDurations,
  createTableTask,
  createTablePortfolio,
  createTableProgram,
  createTypeProjectCategory,
  createTableProjectType,
  createTableProjectPhase,
  createTableProject,
  createTableItem,
  createTableDeliverable,
  createDocumentTemplateTable,
  connectObjectiveWithProject,
};
