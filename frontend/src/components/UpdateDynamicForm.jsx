import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useAuthStore from "../store/authStore";

const UpdateDynamicForm = ({
  title,
  onSubmit,
  isEmbedded = true,
  viewData = false,
  data,
  tableName,
  users = [],
  portfolios = [],
}) => {
  console.log("update dynamic form opened... in", tableName);
  console.log("Form data:", data); // Debugging

  const {
    users: storeUsers,
    portfolios: storePortfolios,
    departments,
    roles,
  } = useAuthStore();
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
        name: "name",
        label: "Portfolio English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم المحفظة بالعربي",
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
        name: "name",
        label: "Objective English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم الهدف بالعربي",
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
        name: "name",
        label: "Program English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم البرنامج بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "program_manager",
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
        name: "portfolio_id",
        label: "Portfolio",
        type: "select",
        required: true,
        columnSpan: 1,
        options:
          finalPortfolios && finalPortfolios.length > 0
            ? finalPortfolios.map((portfolio) => ({
                value: portfolio.id.toString(),
                label: portfolio.name,
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
        name: "name",
        label: "Department English Name",
        type: "text",
        required: true,
        columnSpan: 1,
      },
      {
        name: "arabic_name",
        label: "اسم الإدارة بالعربي",
        type: "text",
        required: true,
        columnSpan: 1,
      },
    ],
    vendor: [
      {
        name: "name",
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
    users: [
      {
        name: "first_name",
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
        name: "rewritePassword",
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
        options:
          departments && departments.length > 0
            ? departments.map((dept) => ({
                value: dept.id.toString(),
                label: dept.name,
              }))
            : [],
      },
      {
        name: "role",
        label: "User Role",
        type: "select",
        required: true,
        columnSpan: 1,
        options:
          roles && roles.length > 0
            ? roles.map((role) => ({
                value: role.id.toString(),
                label: role.name,
              }))
            : [],
      },
    ],
    project: [
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
  } = useForm({
    defaultValues: data || {},
  });

  useEffect(() => {
    if (data) {
      const fields = getFormFields()[tableName] || [];
      const fieldNames = fields.map((field) => field.name);
      const filteredData = {};

      // Only include fields defined in getFormFields for the current tableName
      fieldNames.forEach((name) => {
        if (tableName === "users" && name === "department") {
          filteredData[name] = data.department_id?.toString() || "";
        } else if (tableName === "users" && name === "role") {
          filteredData[name] = data.role_id?.toString() || "";
        } else {
          filteredData[name] = data[name] || "";
        }
      });

      // Add id explicitly since it's not in form fields but needed for submission
      filteredData.id = data.id;

      reset(filteredData);
    }
  }, [data, reset, tableName]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFormSubmit = (formData) => {
    const { rewritePassword, ...submitData } = formData;

    if (
      tableName === "users" &&
      formData.password !== formData.rewritePassword
    ) {
      console.error("Passwords do not match");
      return; // Add proper error handling if needed
    }

    // For users, map department and role back to department_id and role_id
    if (tableName === "users") {
      onSubmit({
        ...submitData,
        department_id: submitData.department,
        role_id: submitData.role,
      });
    } else {
      // For other tables (like vendor), only submit fields defined in DB
      const fields = getFormFields()[tableName] || [];
      const fieldNames = fields.map((field) => field.name);
      const filteredSubmitData = { id: submitData.id };
      fieldNames.forEach((name) => {
        filteredSubmitData[name] = submitData[name];
      });
      onSubmit(filteredSubmitData);
    }
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
                defaultValue={
                  name === "department"
                    ? data?.department_id?.toString() || ""
                    : name === "role"
                    ? data?.role_id?.toString() || ""
                    : data?.[name] || ""
                }
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
              {name === "department"
                ? departments.find(
                    (dept) =>
                      dept.id.toString() === data?.department_id?.toString()
                  )?.name || "N/A"
                : name === "role"
                ? roles.find(
                    (role) => role.id.toString() === data?.role_id?.toString()
                  )?.name || "N/A"
                : data?.[name] || "N/A"}
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
