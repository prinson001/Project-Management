import React, { useState } from "react";
import { useForm } from "react-hook-form";

const DynamicForm = ({ title, fields, onSubmit, isEmbedded = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (data) => {
    onSubmit(data);
    reset(); // Reset form after submission
    if (!isEmbedded) {
      closeModal(); // Close modal if not embedded
    }
  };

  // If the form is embedded, render just the form without the modal wrapper
  if (isEmbedded) {
    return (
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        {fields.map(
          ({ name, label, type, required, className, options, columnSpan }, index) => (
            <div 
              key={index} 
              className={`${columnSpan === 2 ? 'col-span-2' : ''} ${className || ""}`}
            >
              <label className="block text-sm font-medium">{label}</label>
              {type === "select" ? (
                <select
                  {...register(name, { required })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select</option>
                  {options && options.map((option, i) => (
                    <option key={i} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea
                  {...register(name, { required })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
              ) : (
                <input
                  type={type}
                  {...register(name, { required })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              )}
              {errors[name] && (
                <span className="text-red-500 text-sm">
                  {label} is required
                </span>
              )}
            </div>
          )
        )}

        {/* Submit Button */}
        <div className="col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Save
          </button>
        </div>
      </form>
    );
  }
  return (
    <div>
      {/* Button to Open Modal */}
      <button
        onClick={openModal}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
      >
        Open Form
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-green-800">
          {/* Modal Content */}
          <div className="max-w-3xl bg-white dark:bg-black p-6 rounded-lg shadow-lg w-full mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              {fields.map(
                (
                  { name, label, type, required, className, options },
                  index
                ) => (
                  <div key={index} className={`w-full ${className || ""}`}>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">{label}</label>
                    {type === "select" ? (
                      <select
                        {...register(name, { required })}
                        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select</option>
                        {options.map((option, i) => (
                          <option key={i} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        {...register(name, { required })}
                        className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    )}
                    {errors[name] && (
                      <span className="text-red-500 text-sm">
                        {label} is required
                      </span>
                    )}
                  </div>
                )
              )}

              {/* Submit Button */}
              <div className="col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicForm;
