import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const DeliverableAccordion = ({ itemId = 1, projectBudget = 10000 }) => {
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
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:4000/pm/getDeliverables",
          {
            itemId: itemId,
          }
        );
        console.log(data);
        setItems(
          data.result?.map((item) => ({
            ...item,
            id: item.id.toString(),
            start_date: item.start_date.split("T")[0],
            end_date: item.end_date.split("T")[0],
            duration: calculateDuration(item.start_date, item.end_date),
            error: "",
          })) || []
        );
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [itemId]);

  // Function to calculate duration in months
  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate > endDate) return "Invalid";

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;
    return months > 0 ? months + " months" : "Invalid";
  };

  // Handle input changes
  const handleChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          let updatedItem = { ...item, [field]: value };

          // If date fields change, recalculate duration & validate
          if (field === "start_date" || field === "end_date") {
            updatedItem.duration = calculateDuration(
              updatedItem.start_date,
              updatedItem.end_date
            );

            updatedItem.error =
              updatedItem.duration === "Invalid"
                ? "Start Date cannot be after End Date"
                : "";
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Row operations
  const handleAddRow = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      name: "",
      amount: "",
      start_date: "",
      end_date: "",
      duration: "",
      error: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleDeleteRow = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (!id.toString().startsWith("temp-")) {
      setDeletions((prev) => [...prev, id]);
    }
  };

  // Save handler
  const handleSave = async () => {
    try {
      // Separate new items and updates
      let newItems = items.filter((item) =>
        item.id.toString().startsWith("temp-")
      );
      newItems = newItems.map((e) => {
        return { ...e, item_id: Number(itemId) };
      });
      const updates = items.filter(
        (item) => !item.id.toString().startsWith("temp-")
      );

      // Prepare payload
      const payload = {
        newItems: newItems.map(({ id, total, error, ...rest }) => rest),
        updates: updates.map(({ total, error, ...rest }) => rest),
        deletions,
      };

      console.log(payload);
      // API call
      const { data } = await axios.post(
        "http://localhost:4000/pm/saveDeliverables",
        {
          itemId: itemId,
          ...payload,
        }
      );

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
      {/* Items Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Name",
                "Amount",
                "Start Date",
                "End Date",
                "Duration",
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
                    value={item.amount}
                    onChange={(e) =>
                      handleChange(index, "amount", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={item.start_date}
                    onChange={(e) =>
                      handleChange(index, "start_date", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={item.end_date}
                    onChange={(e) =>
                      handleChange(index, "end_date", e.target.value)
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2 font-medium">
                  {item.error ? (
                    <span className="text-red-600">{item.error}</span>
                  ) : (
                    item.duration
                  )}
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

export default DeliverableAccordion;
