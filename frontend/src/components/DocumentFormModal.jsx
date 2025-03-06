import React, { useState } from "react";
import { Construction, ConstructionIcon, Download, Upload } from "lucide-react";
import axios from "axios";

const phasesList = [
  "Planning phase",
  "Bidding phase",
  "Pre-execution phase",
  "Execution",
  "Closing phase",
];

const DocumentFormModal = ({ onClose }) => {
  const [selectedPhases, setSelectedPhases] = useState(
    Array(phasesList.length).fill(false)
  );
  const [data, setData] = useState({});
  const [capexSelected, setCapexSelected] = useState(false);
  const [opexSelected, setOpexSelected] = useState(false);
  const [internalSelected, setInternalSelected] = useState(false);
  const [externalSelected, setExternalSelected] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  // Handles phase toggling (ensuring all below phases are selected)
  const handlePhaseToggle = (index) => {
    const newSelection = [...selectedPhases];
    if (!newSelection[index]) {
      for (let i = index; i < newSelection.length; i++) {
        newSelection[i] = true;
      }
    } else {
      newSelection[index] = false;
    }
    setSelectedPhases(newSelection);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0]);
    }
  };
  const handleSave = async () => {
    let payloadData = { ...data, phase: [] };
    selectedPhases.forEach((p, index) => {
      if (p === true) {
        payloadData.phase.push(phasesList[index]);
      }
    });
    payloadData["is_capex"] = capexSelected;
    payloadData["is_opex"] = opexSelected;
    payloadData["is_internal"] = internalSelected;
    payloadData["is_external"] = externalSelected;

    const formData = new FormData();
    formData.append("file", documentFile);
    formData.append("data", JSON.stringify(payloadData)); // Convert JSON object to string

    try {
      const result = await axios.post(
        "http://localhost:4000/data-management/addDocumentTemplate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[100]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="mb-4 border-b pb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add Document</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 pr-2">
          {/* Document Name Fields - Side by Side */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Document English Name *
              </label>
              <input
                type="text"
                onChange={(e) => handleInputChange(e)}
                className="w-full p-2 border rounded"
                name="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-right">
                اسم الوثيقة بالعربي *
              </label>
              <input
                type="text"
                name="arabic_name"
                onChange={(e) => handleInputChange(e)}
                className="w-full p-2 border rounded text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Document Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Document Description *
            </label>
            <textarea
              name="description"
              onChange={(e) => handleInputChange(e)}
              className="w-full p-2 border rounded"
              rows={4}
            ></textarea>
          </div>

          {/* Two Column Layout for Phases and Categories */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Select Targeted Phases */}
            <div>
              <p className="font-semibold mb-2">Select targeted phases</p>
              {phasesList.map((phase, index) => (
                <label
                  key={phase}
                  className="flex items-center cursor-pointer mb-2"
                >
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={selectedPhases[index]}
                    onChange={() => handlePhaseToggle(index)}
                  />
                  <div
                    className={`relative w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full transition-all ${
                      selectedPhases[index] ? "peer-checked:bg-blue-600" : ""
                    }`}
                  >
                    <div
                      className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                        selectedPhases[index] ? "translate-x-full bg-white" : ""
                      }`}
                    />
                  </div>
                  <span className="ml-3 text-sm font-medium">{phase}</span>
                </label>
              ))}
            </div>

            {/* Project Categories */}
            <div>
              <p className="font-semibold mb-2">
                Select project Category availability
              </p>
              <label className="flex items-center cursor-pointer mb-2">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={capexSelected}
                  onChange={() => setCapexSelected(!capexSelected)}
                />
                <div
                  className={`relative w-11 h-6 bg-gray-200 rounded-full transition-all ${
                    capexSelected ? "peer-checked:bg-blue-600" : ""
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                      capexSelected ? "translate-x-full bg-white" : ""
                    }`}
                  />
                </div>
                <span className="ml-3 text-sm font-medium">Capex projects</span>
              </label>
              <label className="flex items-center cursor-pointer mb-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={opexSelected}
                  onChange={() => setOpexSelected(!opexSelected)}
                />
                <div
                  className={`relative w-11 h-6 bg-gray-200 rounded-full transition-all ${
                    opexSelected ? "peer-checked:bg-blue-600" : ""
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                      opexSelected ? "translate-x-full bg-white" : ""
                    }`}
                  />
                </div>
                <span className="ml-3 text-sm font-medium">Opex projects</span>
              </label>

              {/* Document Template Section */}
              <div className="mt-6">
                <p className="font-semibold mb-2">Document template</p>
                <div className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">File name.doc</p>
                      <p className="text-xs text-gray-500">
                        Creation date: 14-Jan-25
                      </p>
                    </div>
                    <Download className="text-blue-600" size={20} />
                  </div>
                </div>
                <button
                  className="mt-2 bg-blue-500 text-white px-3 py-2 rounded flex items-center text-sm"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Upload size={16} className="mr-2" />
                  Upload new file
                </button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Select Project Type Availability */}
          <div className="mb-6">
            <p className="font-semibold mb-2">
              Select project type availability
            </p>
            <label className="flex items-center cursor-pointer mb-2">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={externalSelected}
                onChange={() => setExternalSelected(!externalSelected)}
              />
              <div
                className={`relative w-11 h-6 bg-gray-200 rounded-full transition-all ${
                  externalSelected ? "peer-checked:bg-blue-600" : ""
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                    externalSelected ? "translate-x-full bg-white" : ""
                  }`}
                />
              </div>
              <span className="ml-3 text-sm font-medium">
                Available for external projects
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={internalSelected}
                onChange={() => setInternalSelected(!internalSelected)}
              />
              <div
                className={`relative w-11 h-6 bg-gray-200 rounded-full transition-all ${
                  internalSelected ? "peer-checked:bg-blue-600" : ""
                }`}
              >
                <div
                  className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-5 w-5 transition-all ${
                    internalSelected ? "translate-x-full bg-white" : ""
                  }`}
                />
              </div>
              <span className="ml-3 text-sm font-medium">
                Available for internal projects
              </span>
            </label>
          </div>
        </div>
        {/* Save Button */}
        <div className="mt-4 pt-4 border-t">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded w-32"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentFormModal;
