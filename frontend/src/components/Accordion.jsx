import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const Accordion = ({
  title,
  children,
  defaultOpen = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [height, setHeight] = useState(defaultOpen ? "auto" : "0px");
  const contentRef = useRef(null);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      setHeight(`${contentRef.current.scrollHeight}px`);
      // After animation completes, set to auto to allow for dynamic content changes
      const timer = setTimeout(() => {
        setHeight("auto");
      }, 300); // Match this to the transition duration
      return () => clearTimeout(timer);
    } else {
      // First set a fixed height to enable animation from auto
      setHeight(`${contentRef.current.scrollHeight}px`);
      // Force a reflow to ensure the browser registers the fixed height
      contentRef.current.offsetHeight;
      // Then animate to 0
      setTimeout(() => {
        setHeight("0px");
      }, 10);
    }
  }, [isOpen]);

  return (
    <div className={`border border-gray-200 rounded-lg shadow-sm ${className}`}>
      <div
        className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer rounded-lg"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
      >
        <span className="text-gray-700 dark:text-gray-300 mr-2">
          {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div
        ref={contentRef}
        style={{ height, overflow: "hidden" }}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="border-t border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-900 overflow-y-auto max-h-[calc(100vh-100px)]">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
