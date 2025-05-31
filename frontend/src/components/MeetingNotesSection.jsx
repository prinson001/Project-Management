import React, { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  CheckCircle2,
  Circle,
  Flag,
  ChevronDown,
} from "lucide-react";

const MeetingNotesSection = () => {
  const meetingNotes = {
    disasterRecovery: [
      { id: 1, text: "Send invitation to bidders", completed: true },
      {
        id: 2,
        text: "Arrange for another meeting with the vendor",
        completed: true,
      },
      {
        id: 3,
        text: "Invite business owners to next workshop",
        completed: true,
      },
    ],
    bigData: [
      { id: 4, text: "Arrange for UAT to start", completed: true },
      { id: 5, text: "Sign deliverable one delivery note", completed: true },
      { id: 6, text: "Send user manual to business owners", completed: true },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Meeting Notes
      </h3>

      {/* Disaster Recovery Project */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">
          Disaster recovery project:
        </h4>
        <div className="space-y-3">
          {meetingNotes.disasterRecovery.map((note) => (
            <div key={note.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flag className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{note.text}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="underline">New to do note</span>
          </button>
        </div>
      </div>

      {/* Big Data Project */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Big Data project</h4>
        <div className="space-y-3">
          {meetingNotes.bigData.map((note) => (
            <div key={note.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flag className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">{note.text}</span>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700">
            <Plus className="w-4 h-4" />
            <span className="underline">New to do note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingNotesSection;
