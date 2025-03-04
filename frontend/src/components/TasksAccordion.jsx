import React, { useState } from 'react';

// Accordion Item Component
const AccordionItem = ({
    title,
    children,
    isOpen = false,
    toggleAccordion,
    index
}) => {
    return (
        <>
            <h2 id={`accordion-heading-${index}`}>
                <button
                    type="button"
                    className={`flex items-center w-full p-5 font-medium text-gray-500 border ${index === 0 ? 'rounded-t-xl' : ''
                        } ${!isOpen && index !== 0 ? 'border-t-0' : ''
                        } border-gray-200 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3`}
                    onClick={() => toggleAccordion(index)}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-body-${index}`}
                >
                    <svg
                        className={`w-3 h-3 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 9 4-4-4-4"
                        />
                    </svg>
                    <span className="flex-1 text-left">{title}</span>
                </button>
            </h2>
            <div
                id={`accordion-body-${index}`}
                className={`transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
                aria-labelledby={`accordion-heading-${index}`}
            >
                <div className="p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900 max-h-[calc(100vh-10rem)] overflow-y-auto">
                    {children}
                </div>
            </div>
        </>
    );
};

// Main Accordion Component
const TasksAccordion = ({ items, defaultOpen = 0, allowMultiple = false }) => {
    const [openItems, setOpenItems] = useState(
        defaultOpen !== null
            ? (Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen])
            : []
    );

    const toggleAccordion = (index) => {
        if (allowMultiple) {
            setOpenItems(prevOpenItems =>
                prevOpenItems.includes(index)
                    ? prevOpenItems.filter(item => item !== index)
                    : [...prevOpenItems, index]
            );
        } else {
            setOpenItems(prevOpenItems =>
                prevOpenItems.includes(index) ? [] : [index]
            );
        }
    };

    return (
        <div className="left-0 w-full h-[100vh] overflow-y-auto" data-accordion="collapse">
            {items.map((item, index) => (
                <AccordionItem
                    key={index}
                    title={item.title}
                    isOpen={openItems.includes(index)}
                    toggleAccordion={toggleAccordion}
                    index={index}
                >
                    {item.content}
                </AccordionItem>
            ))}
        </div>
    );
};

export default TasksAccordion;