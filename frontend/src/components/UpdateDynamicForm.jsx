import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useAuthStore from "../store/authStore"; // Assuming this provides users, portfolios, etc.

const UpdateDynamicForm = ({
  title,
  onSubmit,
  isEmbedded = true,
  viewData = false,
  data,
  tableName,
  users = [], // Optional prop for dynamic options
  portfolios = [], // Optional prop for dynamic options
}) => {
  console.log("update dynamic form opened... in", tableName);

  const { users: storeUsers, portfolios: storePortfolios } = useAuthStore(); // Fallback to store if props not provided
  const finalUsers = users.length > 0 ? users : storeUsers;
  const finalPortfolios = portfolios.length > 0 ? portfolios : storePortfolios;

  const getFormFields = () => ({
    initiative: [
      {
        name: "name",
        label: "Initiative English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم المبادرة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        name: "description",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        name: "arabic_description",
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
        name: "portfolio_manager",
        label: "Portfolio Manager",
        type: "select",
        required: true,
        columnSpan: 1,
        options:
          finalUsers && finalUsers.length > 0
            ? finalUsers.map((user) => ({
                value: user.id.toString(),
                label: `${user.first_name} ${user.family_name || ""}`,
              }))
            : [],
      },
      {
        name: "description",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        name: "arabic_description",
        label: "الوصف بالعربي",
        type: "textarea",
        required: true,
        columnSpan: 2,
        className: "text-right",
      },
    ],
    objective: [
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
      },
      {
        name: "description",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        name: "arabic_description",
        label: "الوصف بالعربي",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
    ],
    program: [
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
      },
      {
        name: "program_manager", // Assuming this is the DB field name
        label: "Program Manager",
        type: "select",
        required: true,
        columnSpan: 1,
        options:
          finalUsers && finalUsers.length > 0
            ? finalUsers.map((user) => ({
                value: user.id.toString(),
                label: `${user.first_name} ${user.family_name || ""}`,
              }))
            : [],
      },
      {
        name: "description",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        name: "arabic_description",
        label: "الوصف بالعربي",
        type: "textarea",
        required: true,
        columnSpan: 2,
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
    vendor: [
      {
        name: "name", // Adjusted to match typical DB field
        label: "Vendor English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم المورد بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
      },
    ],
    member: [
      {
        name: "first_name", // Adjusted to match typical DB field
        label: "First Name in English",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_first_name",
        label: "الاسم الأول للمستخدم بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        name: "family_name",
        label: "Family Name in English",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_family_name",
        label: "اسم العائلة للمستخدم بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        columnSpan: 1,
      },
      {
        name: "password",
        label: "Password",
        type: "password",
        required: true,
        columnSpan: 1,
      },
      {
        name: "rewrite_password", // Assuming this is for confirmation, not stored
        label: "Re-write Password",
        type: "password",
        required: true,
        columnSpan: 1,
        className: "col-start-2",
      },
      {
        name: "department",
        label: "User Department",
        type: "select",
        required: true,
        columnSpan: 1,
        options: ["HR", "Engineering", "Marketing"], // Static for now; could be dynamic
      },
      {
        name: "role",
        label: "User Role",
        type: "select",
        required: true,
        columnSpan: 1,
        options: ["Admin", "Program Manager", "User"],
      },
    ],
    project: [
      // Added project to align with original
      {
        name: "name",
        label: "Project English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم المشروع بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
        className: "text-right",
      },
      {
        name: "description",
        label: "Description in English",
        type: "textarea",
        required: true,
        columnSpan: 2,
      },
      {
        name: "arabic_description",
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
      reset(data);
    }
  }, [data, reset]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (formData) => {
    // Remove rewrite_password from submission if it’s just for validation
    const { rewrite_password, ...submitData } = formData;
    if (
      tableName === "member" &&
      formData.password !== formData.rewrite_password
    ) {
      console.error("Passwords do not match");
      return; // Add proper error handling if needed
    }
    onSubmit(submitData);
  };

  const formContent = (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 shadow-md rounded-md w-full"
    >
      {getFormFields()[tableName]?.map(
        (
          { name, label, type, required, className, options, columnSpan },
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
                {...register(name, { required })}
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
                {...register(name, { required })}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={4}
              />
            ) : (
              <input
                type={type}
                {...register(name, { required })}
                className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            )}
            {errors[name] && (
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

  const viewContent = (
    <div className="grid grid-cols-2 gap-4 p-4 bg-white dark:bg-gray-800 shadow-md rounded-md w-full">
      {getFormFields()[tableName]?.map(
        ({ name, label, className, columnSpan }, index) => (
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
              {data?.[name] || "N/A"}
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
