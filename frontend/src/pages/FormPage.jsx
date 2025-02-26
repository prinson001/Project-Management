import React from "react";
import DynamicForm from "../components/DynamicForm";
const FormPage = () => {
  const handleInitiativeSubmit = (data) =>
    console.log("Initiative Data:", data);

  const initiativeFields = [
    {
      name: "initiativeEnglishName",
      label: "Initiative English Name",
      type: "text",
      required: true,
    },
    {
      name: "initiativeArabicName",
      label: "اسم المبادرة بالعربي",
      type: "text",
      required: true,
      className: "text-right",
    },
    {
      name: "descriptionEnglish",
      label: "Description in English",
      type: "textarea",
      required: true,
    },
    {
      name: "descriptionArabic",
      label: "الوصف بالعربي",
      type: "textarea",
      required: true,
      className: "text-right",
    },
  ];
  return (
    <DynamicForm fields={initiativeFields} onSubmit={handleInitiativeSubmit} />
  );
};

export default FormPage;
