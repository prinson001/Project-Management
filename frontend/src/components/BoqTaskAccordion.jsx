import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
const PORT = import.meta.env.VITE_PORT;
const BoqTaskAccordion = ({ parentId = null, projectBudget = 0 }) => {
  // State management
  const [items, setItems] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived calculations
  const { totalExecution, totalOperation, totalProjectCost, isOverBudget } =
    useMemo(() => {
      const exec = items.reduce(
        (sum, item) =>
          item.type === "Execution"
            ? sum + item.quantity * item.unit_amount
            : sum,
        0
      );
      const oper = items.reduce(
        (sum, item) =>
          item.type === "Operation"
            ? sum + item.quantity * item.unit_amount
            : sum,
        0
      );
      const total = exec + oper;
      return {
        totalExecution: exec,
        totalOperation: oper,
        totalProjectCost: total,
        isOverBudget: total > projectBudget,
      };
    }, [items, projectBudget]);

  // Data fetching
  const fetchItems = async () => {
    try {
      const { data } = await axios.post(`http://localhost:${PORT}/pm/getItems`, {
        projectId: parentId,
      });
      console.log(data);
      console.log("data");
      setItems(
        data.result?.map((item) => ({ ...item, id: item.id.toString() })) || []
      );
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log("the parent id is " + parentId);
    console.log("the project budget is " + projectBudget);
    fetchItems();
  }, [parentId]);

  // Row operations
  const handleAddRow = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      name: "",
      unit: "",
      quantity: "",
      unit_amount: "",
      type: "Execution",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteRow = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (!id.toString().startsWith("temp-")) {
      setDeletions((prev) => [...prev, id]);
    }
  };

  const handleChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Save handler
  const handleSave = async () => {
    try {
      // Separate new items and updates
      let newItems = items.filter((item) =>
        item.id.toString().startsWith("temp-")
      );
      newItems = newItems.map((e) => {
        return { ...e, project_id: Number(parentId) };
      });
      const updates = items.filter(
        (item) => !item.id.toString().startsWith("temp-")
      );

      // Prepare payload
      const payload = {
        newItems: newItems.map(({ id, total, ...rest }) => rest),
        updates: updates.map(({ total, ...rest }) => rest),
        deletions,
      };
      console.log(payload);
      // API call
      const { data } = await axios.post(`http://localhost:${PORT}/pm/saveItems`, {
        projectId: parentId,
        ...payload,
      });
      console.log("the result of item save");
      console.log(data);
      //Update IDs for new items from response
      // setItems((prev) =>
      //   prev.map((item) =>
      //     data.newIds[item.id] ? { ...item, id: data.newIds[item.id] } : item
      //   )
      // );
      await fetchItems();
      setDeletions([]);
      console.log(data);
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving data. Please try again.");
    }
  };

  // Loading and error states
  if (loading) return <div className="p-4 text-center">Loading items...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      {/* Budget Summary */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="p-3 bg-blue-50 rounded-md">
            <span className="font-semibold">Execution Cost:</span> $
            {totalExecution.toFixed(2)}
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <span className="font-semibold">Operation Cost:</span> $
            {totalOperation.toFixed(2)}
          </div>
        </div>

        <div
          className={`p-4 rounded-md ${
            isOverBudget
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Project Budget</p>
              <p>${projectBudget}</p>
            </div>
            <div>
              <p className="font-medium">Total Cost</p>
              <p>${totalProjectCost.toFixed(2)}</p>
            </div>
          </div>
          {isOverBudget && (
            <p className="mt-2 font-semibold">
              ⚠️ Exceeds budget by $
              {(totalProjectCost - projectBudget).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Name",
                "Unit",
                "Quantity",
                "Unit Amount",
                "Total",
                "Type",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-2">
                  <input
                    value={item.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={item.unit}
                    onChange={(e) =>
                      handleChange(index, "unit", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", Number(e.target.value))
                    }
                    className="w-full border rounded px-2 py-1"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={item.unit_amount}
                    onChange={(e) =>
                      handleChange(index, "unit_amount", Number(e.target.value))
                    }
                    className="w-full border rounded px-2 py-1"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="px-4 py-2 font-medium">
                  ${(item.quantity * item.unit_amount).toFixed(2)}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleChange(index, "type", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  >
                    {["Execution", "Operation"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDeleteRow(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Control Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleAddRow}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Item
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default BoqTaskAccordion;
