import { useState, useEffect } from "react";
import { Datepicker } from "flowbite-react";

export default function CustomDatePicker({ label, onDateChange, value }) {
  const [selectedDate, setSelectedDate] = useState(value || null);

  useEffect(() => {
    setSelectedDate(value || null);
  }, [value]);

  const handleDateChange = (date) => {
    console.log("date change", date);
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {label && (
        <label className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <Datepicker
        onSelectedDateChanged={handleDateChange}
        value={selectedDate}
        minDate={new Date()}
      />
      {selectedDate && (
        <p className="mt-2 text-sm text-gray-700">
          Selected Date: {selectedDate.toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
