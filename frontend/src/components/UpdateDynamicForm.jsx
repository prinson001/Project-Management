import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const UpdateDynamicForm = ({
  title,
  onSubmit,
  isEmbedded = true,
  viewData = false,
  data,
  tableName,
}) => {
  console.log("update dynamic form opened... in", tableName);
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
        name: "Portfolio EnglishName",
        label: "Portfolio English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "PortfolioArabicName",
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
    program: [
      {
        dbName: "name",
        name: "ProgramEnglishName",
        label: "Program English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "ProgramArabicName",
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
    project: [
      {
        dbName: "name",
        name: "ProjectEnglishName",
        label: "Project English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "ProjectArabicName",
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
    department: [
      {
        dbName: "name",
        name: "departmentEnglishName",
        label: "Department English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "departmentArabicName",
        label: "اسم الإدارة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
      },
    ],
    objective: [
      {
        dbName: "name",
        name: "ObjectiveEnglishName",
        label: "Objective English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "ObjectiveArabicName",
        label: "اسم الإدارة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
      },
    ],
    vendor: [
      {
        dbName: "name",
        name: "ObjectiveEnglishName",
        label: "Objective English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        dbName: "arabic_name",
        name: "ObjectiveArabicName",
        label: "اسم الإدارة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
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
      reset(data);
    }
  }, [data, reset]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (formData) => {
    onSubmit(formData);
  };

  const formContent = (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 shadow-md rounded-md w-full"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {label}
            </label>
            {type === "select" ? (
              <select
                {...register(dbName, { required })}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
              />
            ) : (
              <input
                type={type}
                {...register(dbName, { required })}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
  console.log(getFormFields()[tableName]);
  const viewContent = (
    <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 shadow-md rounded-md w-full">
      {getFormFields()[tableName].map(
        ({ dbName, label, className, columnSpan }, index) => (
          <div
            key={index}
            className={`${columnSpan === 2 ? "col-span-2" : ""} ${
              className || ""
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              {label}
            </label>
            <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-gray-900 dark:text-white w-full">
              {data?.[dbName] || "N/A"}
            </div>
          </div>
        )
      )}
    </div>
  );

  if (isEmbedded) {
    return viewData ? viewContent : formContent;
  }

  return (
    <>
      <button
        onClick={openModal}
        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
      >
        Open Form
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-70 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-4 dark:text-white">
              {title || "Update Form"}
            </h2>
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
