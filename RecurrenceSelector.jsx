import React, { useState } from "react";

const RecurrenceSelector = ({ recurrenceData, setRecurrenceData }) => {
  const handleTypeChange = (e) => {
    setRecurrenceData({ type: e.target.value, dates: [], range: { start: "", end: "" } });
  };

  const handleDateChange = (e, index) => {
    const updatedDates = [...recurrenceData.dates];
    updatedDates[index] = e.target.value;
    setRecurrenceData({ ...recurrenceData, dates: updatedDates });
  };

  const addNewDate = () => {
    setRecurrenceData({ ...recurrenceData, dates: [...recurrenceData.dates, ""] });
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Recurrence Type
      </label>
      <select
        value={recurrenceData.type}
        onChange={handleTypeChange}
        className="w-full border border-gray-300 rounded-md p-2"
      >
        <option value="once">Today Only</option>
        <option value="everyday">Everyday</option>
        <option value="specific">Specific Dates</option>
        <option value="range">Date Range</option>
      </select>

      {/* Specific Dates */}
      {recurrenceData.type === "specific" && (
        <div className="mt-2 space-y-2">
          {recurrenceData.dates.map((date, index) => (
            <input
              key={index}
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e, index)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          ))}
          <button
            type="button"
            onClick={addNewDate}
            className="mt-1 text-blue-600 text-sm"
          >
            + Add Date
          </button>
        </div>
      )}

      {/* Date Range */}
      {recurrenceData.type === "range" && (
        <div className="mt-2 flex gap-2">
          <input
            type="date"
            value={recurrenceData.range.start}
            onChange={(e) =>
              setRecurrenceData({
                ...recurrenceData,
                range: { ...recurrenceData.range, start: e.target.value },
              })
            }
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
          <input
            type="date"
            value={recurrenceData.range.end}
            onChange={(e) =>
              setRecurrenceData({
                ...recurrenceData,
                range: { ...recurrenceData.range, end: e.target.value },
              })
            }
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
        </div>
      )}
    </div>
  );
};

export default RecurrenceSelector;
