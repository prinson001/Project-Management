import { useEffect, useState, Fragment } from "react";

const DeliveryCompletionModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Delivery Completion</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery name</label>
          <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <button className="flex items-center space-x-2 text-blue-600 hover:underline">
            <span>Delivery note Template</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
      </div>
    </div>
  </div>
);

const DeliveryInvoiceModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Delivery Invoice</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Delivery name</label>
          <input type="text" value={deliverable.name} disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Deliverable remaining value (SAR)</label>
          <input type="text" value="100,000" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Amount (SAR)</label>
          <input type="text" value="50,000" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Full Amount</label>
          <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload signed delivery note</label>
          <div className="flex items-center space-x-2">
            <input type="text" value="Filename.pdf" disabled className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-gray-100" />
            <button className="mt-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Browse</button>
          </div>
          <p className="text-green-600 text-sm mt-1">Uploading completed!</p>
        </div>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
      </div>
    </div>
  </div>
);

const ViewDeliverableDetailsModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">View Deliverable Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <p><strong>Name:</strong> {deliverable.name}</p>
        <p><strong>Budget:</strong> {deliverable.budget}</p>
        <p><strong>Invoiced:</strong> {deliverable.invoiced}</p>
        <p><strong>Start Date:</strong> {deliverable.start_date}</p>
        <p><strong>End Date:</strong> {deliverable.end_date}</p>
        <p><strong>Scope %:</strong> {deliverable.scope_percentage}</p>
        <p><strong>Payment %:</strong> {deliverable.payment_percentage}</p>
      </div>
    </div>
  </div>
);

const ChangeRequestModal = ({ onClose, deliverable }) => (
  <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Apply for Change Request</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <p>Request changes for {deliverable.name}.</p>
        <textarea className="w-full h-32 border border-gray-300 rounded-md p-2" placeholder="Describe the change request"></textarea>
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit Request</button>
      </div>
    </div>
  </div>
);

const ActionPopup = ({ onClose, onSelect, deliverable }) => (
  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
    <div className="py-1">
      <button onClick={() => onSelect('completion')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Delivery Completion</button>
      <button onClick={() => onSelect('invoice')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Delivery Invoice</button>
      <button onClick={() => onSelect('dates')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Change Deliverable Dates</button>
      <button onClick={() => onSelect('details')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Deliverable Details</button>
      <button onClick={() => onSelect('changeRequest')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Apply for Change Request</button>
    </div>
  </div>
);

const ProjectDelivarablesTable = ({ data, columns, tableName }) => {
  const [openAccordion, setOpenAccordion] = useState(null);
  const [columnWidths, setColumnWidths] = useState({});
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(null);
  const [startWidth, setStartWidth] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ASC' });
  const [tableData, setTableData] = useState(data);
  const [showActionPopup, setShowActionPopup] = useState(null);
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  useEffect(() => {
    const initialWidths = {};
    columns.forEach((column) => {
      initialWidths[column.dbColumn] = column.width || 150;
    });
    setColumnWidths(initialWidths);
  }, [columns]);

  const handleResizeStart = (e, columnId) => {
    e.preventDefault();
    setResizingColumn(columnId);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnId] || 150);
  };

  const handleResizeMove = (e) => {
    if (resizingColumn && startX !== null) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    }
  };

  const handleResizeEnd = () => {
    setResizingColumn(null);
    setStartX(null);
    setStartWidth(null);
  };

  useEffect(() => {
    const handleMouseMove = (e) => handleResizeMove(e);
    const handleMouseUp = () => handleResizeEnd();

    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.classList.add('resize-active');
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resize-active');
    };
  }, [resizingColumn, startX, startWidth, columnWidths]);

  const sortDataHandler = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'ASC' ? 'DESC' : 'ASC';
    setSortConfig({ key, direction });

    const sortedData = [...tableData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ASC' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ASC' ? 1 : -1;
      return 0;
    });
    setTableData(sortedData);
  };

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleEditClick = (item) => {
    console.log(`Editing item with id: ${item.id}`);
  };

  const handleDeleteClick = (id) => {
    console.log(`Deleting item with id: ${id}`);
    setTableData(tableData.filter(item => item.id !== id));
  };

  const handleScopeChange = (id, value) => {
    const numericValue = Math.max(0, Math.min(100, Math.round(value / 10) * 10));
    setTableData(tableData.map(item =>
      item.id === id ? { ...item, scope_percentage: `${numericValue}%` } : item
    ));
  };

  const toggleActionPopup = (index) => {
    setShowActionPopup(showActionPopup === index ? null : index);
  };

  const handleActionSelect = (action, deliverable) => {
    setSelectedDeliverable(deliverable);
    setSelectedModal(action);
    setShowActionPopup(null);
  };

  return (
    <div className="relative text-xs overflow-x-auto rounded-lg shadow-md">
      <table className="w-full text-xs text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.columnName}
                className="px-2 py-3 relative border-r border-gray-200"
                style={{ width: columnWidths[column.dbColumn] }}
              >
                <div className="flex items-center justify-between pr-2">
                  <span className="truncate">{column.columnName}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 cursor-pointer"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    onClick={() => sortDataHandler(column.dbColumn)}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <div
                  className={`absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-gray-300 ${
                    resizingColumn === column.dbColumn ? 'bg-blue-400 opacity-50' : ''
                  }`}
                  onMouseDown={(e) => handleResizeStart(e, column.dbColumn)}
                />
              </th>
            ))}
            <th className="px-6 py-3 w-24 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="text-center py-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            tableData.map((item, index) => (
              <Fragment key={item.id}>
                <tr className="bg-white border-b hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={`${index}-${column.dbColumn}`}
                      className="px-2 h-16 border-r border-gray-200 overflow-hidden"
                      style={{ width: columnWidths[column.dbColumn] }}
                    >
                      {column.dbColumn === 'scope_percentage' ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="10"
                            value={parseInt(item[column.dbColumn])}
                            onChange={(e) => handleScopeChange(item.id, parseInt(e.target.value))}
                            className="w-16 border border-gray-300 rounded-md p-1"
                          />
                          <span>%</span>
                          {item[column.dbColumn] === '100%' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      ) : column.dbColumn === 'payment_percentage' ? (
                        <div className="flex items-center space-x-1">
                          <span>{item[column.dbColumn]}</span>
                          {item[column.dbColumn] === '100%' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="text-gray-500 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      ) : column.dbColumn === 'start_date' || column.dbColumn === 'end_date' ? (
                        <span>{item[column.dbColumn].split('-').reverse().join('-')}</span>
                      ) : (
                        <span className="px-2 py-2">{item[column.dbColumn]}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 h-16 text-center relative">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => handleEditClick(item)} className="text-blue-500 hover:text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteClick(item.id)} className="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z" />
                        </svg>
                      </button>
                      <button onClick={() => toggleAccordion(index)} className="text-gray-500 hover:text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`w-5 h-5 transition-transform ${openAccordion === index ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button onClick={() => toggleActionPopup(index)} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                      {showActionPopup === index && (
                        <ActionPopup
                          onClose={() => setShowActionPopup(null)}
                          onSelect={(action) => handleActionSelect(action, item)}
                          deliverable={item}
                        />
                      )}
                    </div>
                  </td>
                </tr>
                {openAccordion === index && (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-0">
                      <div className="px-6 py-4 bg-gray-50">
                        <p>Details for {item.name}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))
          )}
        </tbody>
      </table>

      {selectedModal === 'completion' && (
        <DeliveryCompletionModal
          onClose={() => setSelectedModal(null)}
          deliverable={selectedDeliverable}
        />
      )}
      {selectedModal === 'invoice' && (
        <DeliveryInvoiceModal
          onClose={() => setSelectedModal(null)}
          deliverable={selectedDeliverable}
        />
      )}
      {selectedModal === 'details' && (
        <ViewDeliverableDetailsModal
          onClose={() => setSelectedModal(null)}
          deliverable={selectedDeliverable}
        />
      )}
      {selectedModal === 'changeRequest' && (
        <ChangeRequestModal
          onClose={() => setSelectedModal(null)}
          deliverable={selectedDeliverable}
        />
      )}
      {selectedModal === 'dates' && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Change Deliverable Dates</h2>
              <button onClick={() => setSelectedModal(null)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Start Date</label>
                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New End Date</label>
                <input type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Submit</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .resize-active {
          cursor: col-resize !important;
          user-select: none !important;
        }
        th, td {
          position: relative;
        }
        .cursor-col-resize {
          cursor: col-resize;
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ProjectDelivarablesTable;