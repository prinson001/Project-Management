import React, { useState, useEffect } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import axiosInstance from "../axiosInstance";
import { toast } from "sonner";
const PORT = import.meta.env.VITE_PORT;

const DeliverablesAccordion2 = ({ project, closeAccordion }) => {
  let projectId = project?.related_entity_id;
  console.log("the project id is ", projectId);
  console.log("the project is ", project);
  // Initialize items as empty array instead of undefined
  const [items, setItems] = useState([]);
  const [projectDocuments, setProjectDocuments] = useState([]);
  const [openIndex, setOpenIndex] = useState(-1);
  const [changes, setChanges] = useState({
    newDeliverables: [],
    updatedDeliverables: [],
    deletedDeliverables: [],
  });

  useEffect(() => {
    console.log("the project id is ", projectId);
    // console.log("the project phase is ", projectPhase);
    const fetchItemsWithDeliverables = async () => {
      try {
        const response = await axiosInstance.post(
          `/pm/items-with-deliverables`,
          {
            projectId,
          }
        );
        console.log("items with deliverables");
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

      // Update the field value
      deliverable[field] = value;

      // Calculate duration if start_date or end_date changes
      if (field === "start_date" || field === "end_date") {
        const startDate = deliverable.start_date;
        const endDate = deliverable.end_date;

        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);

          if (end >= start) {
            // Calculate total days (inclusive)
            const timeDiff = end.getTime() - start.getTime();
            const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;

            // Convert to months with decimal days (average month length)
            const averageDaysPerMonth = 30.436875; // 365/12
            const durationMonths = totalDays / averageDaysPerMonth;

            // Format to 1 decimal place (e.g., "2.3" months)
            deliverable.duration = durationMonths.toFixed(1);
          } else {
            deliverable.duration = ""; // Invalid date range
          }
        } else {
          deliverable.duration = ""; // Missing dates
        }
      }

      // Track changes for existing deliverables
      if (
        deliverable.id &&
        !changes.updatedDeliverables.includes(deliverable.id)
      ) {
        setTimeout(() => {
          setChanges((prevChanges) => ({
            ...prevChanges,
            updatedDeliverables: [
              ...prevChanges.updatedDeliverables,
              deliverable.id,
            ],
          }));
        }, 0);
      }

      return updatedItems;
    });
  };

  // Fixed function to add only one deliverable
  const addDeliverable = (itemIndex) => {
    // Generate a temporary unique ID for this new deliverable
    const tempId = Date.now().toString();

    const newDeliverable = {
      id: null,
      tempId: tempId, // Add a temporary ID to track this item
      name: "",
      amount: "",
      start_date: "",
      end_date: "",
      duration: "",
      status: "new",
      item_id: items[itemIndex].id,
    };

    // Update items and changes separately to avoid race conditions
    setItems((prev) => {
      const updatedItems = JSON.parse(JSON.stringify(prev)); // Deep clone
      updatedItems[itemIndex].deliverables.push(newDeliverable);
      return updatedItems;
    });

    // We'll track new deliverables separately from the item state
    setTimeout(() => {
      setChanges((prevChanges) => ({
        ...prevChanges,
        newDeliverables: [...prevChanges.newDeliverables, newDeliverable],
      }));
    }, 0);
  };

  // Fixed deleteDeliverable function
  const deleteDeliverable = (itemIndex, deliverableIndex) => {
    console.log("the item index is ", itemIndex);
    console.log("the deliverable index is ", deliverableIndex);

    // Get a reference to the deliverable being deleted
    const deliverableToDelete = items[itemIndex].deliverables[deliverableIndex];
    console.log("the deleted item is ", deliverableToDelete);

    // First update the items state to remove the deliverable
    setItems((prev) => {
      const updatedItems = JSON.parse(JSON.stringify(prev)); // Deep clone
      updatedItems[itemIndex].deliverables.splice(deliverableIndex, 1);
      return updatedItems;
    });

    // Then update changes state if needed
    if (deliverableToDelete.id) {
      // If it has an ID, add it to deletedDeliverables
      setTimeout(() => {
        setChanges((prevChanges) => ({
          ...prevChanges,
          deletedDeliverables: [
            ...prevChanges.deletedDeliverables,
            deliverableToDelete.id,
          ],
        }));
      }, 0);
    } else {
      // If it doesn't have an ID, remove it from newDeliverables
      setTimeout(() => {
        setChanges((prevChanges) => ({
          ...prevChanges,
          newDeliverables: prevChanges.newDeliverables.filter(
            (d) => d.tempId !== deliverableToDelete.tempId
          ),
        }));
      }, 0);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        newDeliverables: items.flatMap((item) =>
          item.deliverables
            .filter((d) => d.status === "new")
            .map(
              ({ name, amount, start_date, end_date, duration, item_id }) => ({
                name,
                amount,
                start_date,
                end_date,
                duration,
                item_id,
              })
            )
        ),
        updatedDeliverables: items.flatMap((item) =>
          item.deliverables
            .filter((d) => changes.updatedDeliverables.includes(d.id))
            .map(({ id, name, amount, start_date, end_date, duration }) => ({
              id,
              name,
              amount,
              start_date,
              end_date,
              duration,
            }))
        ),
        deletedDeliverables: changes.deletedDeliverables,
      };

      console.log("Saving payload:", payload);

      await axiosInstance.post(`/pm/${projectId}/save-deliverables`, payload);

      setChanges({
        newDeliverables: [],
        updatedDeliverables: [],
        deletedDeliverables: [],
      });

      toast.success("Deliverables saved successfully!");
      closeAccordion();
    } catch (error) {
      console.error("Error saving deliverables:", error.message);
      toast.error("Error saving deliverables");
    }
  };

  const handleSaveandMarkComplete = async () => {
    try {
      const payload = {
        newDeliverables: items.flatMap((item) =>
          item.deliverables
            .filter((d) => d.status === "new")
            .map(
              ({ name, amount, start_date, end_date, duration, item_id }) => ({
                name,
                amount,
                start_date,
                end_date,
                duration,
                item_id,
              })
            )
        ),
        updatedDeliverables: items.flatMap((item) =>
          item.deliverables
            .filter((d) => changes.updatedDeliverables.includes(d.id))
            .map(({ id, name, amount, start_date, end_date, duration }) => ({
              id,
              name,
              amount,
              start_date,
              end_date,
              duration,
            }))
        ),
        deletedDeliverables: changes.deletedDeliverables,
      };

      console.log("Saving payload:", payload);

      await axiosInstance.post(`/pm/${projectId}/save-deliverables`, payload);

      const response = await axiosInstance.post(
        `/data-management/updateTaskStatusToDone`,
        {
          taskId: project.id,
        }
      );

      setChanges({
        newDeliverables: [],
        updatedDeliverables: [],
        deletedDeliverables: [],
      });

      toast.success("Deliverables saved successfully!");
      closeAccordion();
    } catch (error) {
      console.error("Error saving deliverables:", error.message);
      toast.error("Error saving deliverables");
    }
  };

  const isSaveDisabled =
    changes.newDeliverables.length === 0 &&
    changes.updatedDeliverables.length === 0 &&
    changes.deletedDeliverables.length === 0;

  return (
    <div className="w-full  mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
        Project Deliverables
      </h2>
      <div>
        {projectDocuments.map((e) => {
          return (
            <div>
              <a href={e.document_url} target="_blank">
                {e.document_name}
              </a>
            </div>
          );
        })}
      </div>
      <div className="space-y-1">
        {(Array.isArray(items) ? items : []).map((item, itemIndex) => (
          <Disclosure key={item.id || itemIndex}>
            {({ open }) => (
              <div className="mb-4 border rounded-lg overflow-hidden shadow-sm">
                <Disclosure.Button
                  className="flex justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                  onClick={() => setOpenIndex(open ? -1 : itemIndex)}
                >
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-gray-500 text-xl">
                    {open ? "−" : "+"}
                  </span>
                </Disclosure.Button>

                <Transition
                  show={open}
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel className="px-6 pt-5 pb-4 bg-white">
                    <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p>
                          <span className="font-medium">Unit:</span> {item.unit}
                        </p>
                        <p>
                          <span className="font-medium">Quantity:</span>{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Unit Amount:</span>{" "}
                          {item.unit_amount}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span> $
                          {item.total}
                        </p>
                        <p>
                          <span className="font-medium">Type:</span> {item.type}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-medium text-lg mb-3 text-gray-700">
                      Deliverables
                    </h3>

                    <div className="space-y-4">
                      {item.deliverables && item.deliverables.length > 0 ? (
                        item.deliverables.map(
                          (deliverable, deliverableIndex) => (
                            <div
                              key={
                                deliverable.id ||
                                deliverable.tempId ||
                                deliverableIndex
                              }
                              className="flex gap-4 items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <input
                                type="text"
                                value={deliverable.name || ""}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    itemIndex,
                                    deliverableIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Deliverable name"
                              />
                              <input
                                type="number"
                                value={deliverable.amount || ""}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    itemIndex,
                                    deliverableIndex,
                                    "amount",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Amount"
                              />
                              <input
                                type="date"
                                value={deliverable.start_date || ""}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    itemIndex,
                                    deliverableIndex,
                                    "start_date",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="date"
                                value={deliverable.end_date || ""}
                                onChange={(e) =>
                                  handleDeliverableChange(
                                    itemIndex,
                                    deliverableIndex,
                                    "end_date",
                                    e.target.value
                                  )
                                }
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={deliverable.duration + " months "}
                                disabled={true}
                                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  deleteDeliverable(
                                    itemIndex,
                                    deliverableIndex
                                  );
                                }}
                                className="text-red-600 hover:text-red-800 px-3 py-2 transition-colors rounded-md hover:bg-red-50"
                                title="Delete deliverable"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-gray-500 italic">
                          No deliverables added yet.
                        </p>
                      )}
                      {Number(item.deliverables.length) <
                        Number(item.quantity) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            addDeliverable(itemIndex);
                          }}
                          className="flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add Deliverable
                        </button>
                      )}
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          className={`px-6 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            isSaveDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={isSaveDisabled}
        >
          Save All Changes
        </button>
        <button
          onClick={handleSaveandMarkComplete}
          className={`px-6 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500  bg-green-600 hover:bg-green-700`}
        >
          Save and Mark as Completed
        </button>
      </div>
    </div>
  );
};

export default DeliverablesAccordion2;
