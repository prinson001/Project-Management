import React, { useState, useEffect } from "react";
import { Disclosure } from "@headlessui/react";
import axios from "axios";

const DeliverablesAccordion = ({ projectId = 2 }) => {
  const [items, setItems] = useState([]);
  const [openIndex, setOpenIndex] = useState(-1);
  const [changes, setChanges] = useState({
    newDeliverables: [],
    updatedDeliverables: [],
    deletedDeliverables: [],
  });

  useEffect(() => {
    const fetchItemsWithDeliverables = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/pm/${projectId}/items-with-deliverables`
        );
        console.log(response);
        setItems(response.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItemsWithDeliverables();
  }, [projectId]);

  const handleDeliverableChange = (
    itemIndex,
    deliverableIndex,
    field,
    value
  ) => {
    setItems((prev) => {
      const updatedItems = [...prev];
      const deliverable =
        updatedItems[itemIndex].deliverables[deliverableIndex];

      if (deliverable.id) {
        setChanges((prevChanges) => ({
          ...prevChanges,
          updatedDeliverables: [
            ...prevChanges.updatedDeliverables,
            deliverable.id,
          ],
        }));
      }

      updatedItems[itemIndex].deliverables[deliverableIndex][field] = value;
      return updatedItems;
    });
  };

  const addDeliverable = (itemIndex) => {
    setItems((prev) => {
      const updatedItems = [...prev];
      updatedItems[itemIndex].deliverables.push({
        id: null,
        name: "",
        description: "",
        status: "new",
      });
      return updatedItems;
    });
  };

  useEffect(() => {
    console.log(items);
  }, [items]);

  const deleteDeliverable = (itemIndex, deliverableIndex) => {
    setItems((prev) => {
      const updatedItems = [...prev];
      const deleted = updatedItems[itemIndex].deliverables.splice(
        deliverableIndex,
        1
      )[0];

      if (deleted.id) {
        setChanges((prevChanges) => ({
          ...prevChanges,
          deletedDeliverables: [...prevChanges.deletedDeliverables, deleted.id],
        }));
      }

      return updatedItems;
    });
  };

  const handleSave = async () => {
    // try {
    //   const payload = {
    //     "newDeliverables": items.flatMap(item =>
    //       item.deliverables.filter(d => d.status === 'new')
    //         .map(({ name, description, itemId }) => ({ name, description, itemId })),
    //     "updatedDeliverables": items.flatMap(item =>
    //       item.deliverables.filter(d => changes.updatedDeliverables.includes(d.id))
    //         .map(({ id, name, description }) => ({ id, name, description })),
    //     "deletedDeliverables": changes.deletedDeliverables
    //   };
    //   await axios.post(`/api/projects/${projectId}/save-deliverables`, payload);
    //   setChanges({ newDeliverables: [], updatedDeliverables: [], deletedDeliverables: [] });
    //   alert('Deliverables saved successfully!');
    // } catch (error) {
    //   console.error('Error saving deliverables:', error);
    //   alert('Error saving deliverables');
    // }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Project Deliverables</h2>

      {items.map((item, itemIndex) => (
        <Disclosure key={item.id || itemIndex}>
          {({ open }) => (
            <div className="mb-4">
              <Disclosure.Button
                className="flex justify-between w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                onClick={() => setOpenIndex(open ? -1 : itemIndex)}
              >
                <span className="font-medium">{item.name}</span>
                <span>{open ? "−" : "+"}</span>
              </Disclosure.Button>

              <Disclosure.Panel className="px-4 pt-4 pb-2">
                <div className="space-y-4">
                  {item.deliverables.map((deliverable, deliverableIndex) => (
                    <div
                      key={deliverableIndex}
                      className="flex gap-4 items-center"
                    >
                      <input
                        type="text"
                        value={deliverable.name}
                        onChange={(e) =>
                          handleDeliverableChange(
                            itemIndex,
                            deliverableIndex,
                            "name",
                            e.target.value
                          )
                        }
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Deliverable name"
                      />
                      <input
                        type="text"
                        value={deliverable.description}
                        onChange={(e) =>
                          handleDeliverableChange(
                            itemIndex,
                            deliverableIndex,
                            "description",
                            e.target.value
                          )
                        }
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Description"
                      />
                      <button
                        onClick={() =>
                          deleteDeliverable(itemIndex, deliverableIndex)
                        }
                        className="text-red-600 hover:text-red-800 px-3 py-2"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addDeliverable(itemIndex)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-2"
                  >
                    + Add Deliverable
                  </button>
                </div>
              </Disclosure.Panel>
            </div>
          )}
        </Disclosure>
      ))}

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          disabled={
            !changes.newDeliverables.length &&
            !changes.updatedDeliverables.length &&
            !changes.deletedDeliverables.length
          }
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default DeliverablesAccordion;
