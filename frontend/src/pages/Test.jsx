import React, { useState } from "react";
import TaskPage from "./TasksPage";

const Test = () => {
  const [isOpen, setIsOpen] = useState(false);
  function handleonClick(e) {
    e.preventDefault();
    setIsOpen((state) => !state);
  }
  return (
    <>
      <button style={{ cursor: "pointer" }} onClick={handleonClick}>
        Click me
      </button>
      <br></br>
      {isOpen && <TaskPage />}
    </>
  );
};

export default Test;
