import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../axiosInstance";

const BoqTaskAccordion = ({
  parentId = null,
  projectBudget = 0,
  project,
  isReadable = false,
}) => {
  // State management
  const [items, setItems] = useState([]);
  const [deletions, setDeletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log("Received project", project);

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
      const { data } = await axiosInstance.post(`/pm/getItems`, {
        projectId: parentId,
      });
      console.log(data);
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
    if (isReadable) return;
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
    if (isReadable) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (!id.toString().startsWith("temp-")) {
      setDeletions((prev) => [...prev, id]);
    }
  };

  const handleChange = (index, field, value) => {
    if (isReadable) return;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Save handler
  const handleSave = async () => {
    if (isReadable) return;
    try {
      let newItems = items.filter((item) =>
        item.id.toString().startsWith("temp-")
      );
      newItems = newItems.map((e) => {
        return { ...e, project_id: Number(parentId) };
      });
      const updates = items.filter(
        (item) => !item.id.toString().startsWith("temp-")
      );

      const payload = {
        newItems: newItems.map(({ id, total, ...rest }) => rest),
        updates: updates.map(({ total, ...rest }) => rest),
        deletions,
      };
      console.log("Payload", payload);

      const { data } = await axiosInstance.post(`/pm/saveItems`, {
        projectId: parentId,
        ...payload,
      });
      console.log("Save result:", data);

      await fetchItems();
      setDeletions([]);
    } catch (err) {
      console.error("Save error:", err);
      console.log(err.message);
      alert("Error saving data. Please try again.");
    }
  };

  // Send for Approval handler
  const handleSendForApproval = async () => {
    if (isReadable) return;
    try {
      await handleSave();
      console.log("Parent Id", parentId);
      const response = await axiosInstance.post(
        `/tasks/createBoqApprovalTaskForPMO`,
        { projectId: parentId },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data.status === "success") {
        console.log("Schedule plan task created successfully:", response.data);
        alert("BOQ saved and sent for approval successfully!");
      } else {
        throw new Error(
          response.data.message || "Failed to create schedule plan task"
        );
      }
    } catch (err) {
      console.error("Error sending for approval:", err);
      alert("Error sending BOQ for approval: " + err.message);
    }
  };

  // Loading and error states
  if (loading) return <div className="p-4 text-center">Loading items...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={item.id}>
                {["name", "unit", "quantity", "unit_amount", "type"].map(
                  (field) => (
                    <td key={field} className="px-4 py-2">
                      <input
                        value={item[field]}
                        onChange={(e) =>
                          handleChange(index, field, e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                        readOnly={isReadable}
                      />
                    </td>
                  )
                )}
                <td className="px-4 py-2">
                  {!isReadable && (
                    <button
                      onClick={() => handleDeleteRow(item.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={isReadable}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!isReadable && (
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
          <button
            onClick={handleSendForApproval}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Send for Approval
          </button>
        </div>
      )}
    </div>
  );
};

export default BoqTaskAccordion;
