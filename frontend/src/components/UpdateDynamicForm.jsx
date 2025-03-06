import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const UpdateDynamicForm = ({
  title,
  onSubmit,
  isEmbedded = true,
  data,
  tableName,
}) => {
  const getFormFields = () => ({
    initiative: [
      {
        dbName: "name",
        name: "initiativeEnglishName",
        label: "Initiative English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "initiativeArabicName",
        label: "اسم المبادرة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        dbName: "description",
        name: "descriptionEnglish",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        dbName: "arabic_description",
        name: "descriptionArabic",
        label: "الوصف بالعربي",
        type: "textarea",
        required: true,
        columnSpan: 2,
        className: "text-right",
      },
    ],
    portfolio: [
      {
        dbName: "name",
        name: "initiativeEnglishName",
        label: "Initiative English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "initiativeArabicName",
        label: "اسم المبادرة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        dbName: "description",
        name: "descriptionEnglish",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        dbName: "arabic_description",
        name: "descriptionArabic",
        label: "الوصف بالعربي",
        type: "textarea",
        required: true,
        columnSpan: 2,
        className: "text-right",
      },
    ],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (data) {
      reset(data); // Populate form fields with existing values
    }
  }, [data, reset]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (formData) => {
    // closeModal();
    onSubmit(formData);
    // reset();
    console.log(formData);
  };

  const formContent = (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-2 gap-4 p-4 bg-white shadow-md rounded-md"
    >
      {getFormFields()[tableName].map(
        (
          {
            name,
            label,
            type,
            required,
            className,
            options,
            columnSpan,
            dbName,
          },
          index
        ) => (
          <div
            key={index}
            className={`${columnSpan === 2 ? "col-span-2" : ""} ${
              className || ""
            }`}
          >
            <label className="block text-sm font-medium">{label}</label>
            {type === "select" ? (
              <select
                {...register(dbName, { required })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {options?.map((option, i) => (
                  <option key={i} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : type === "textarea" ? (
              <textarea
                {...register(dbName, { required })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            ) : (
              <input
                type={type}
                {...register(dbName, { required })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
              />
            )}
            {errors[dbName] && (
              <span className="text-red-500 text-sm">{label} is required</span>
            )}
          </div>
        )
      )}

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

  return isEmbedded ? (
    formContent
  ) : (
    <>
      <button
        onClick={openModal}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
      >
        Open Form
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">{title || "Update Form"}</h2>
            {formContent}
            <button
              onClick={closeModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateDynamicForm;
