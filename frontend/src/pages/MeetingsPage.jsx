import React, { useState } from "react";
import TopHeader from "../components/TopHeader";
import ProjectMeetingSidebar from "../components/ProjectMeetingSidebar";
import MeetingNotesSection from "../components/MeetingNotesSection";
import ProjectTasksSection from "../components/ProjectTasksSection";
import ProjectMeetingHeader from "../components/ProjectMeetingHeader";
import ProjectMeetingMainSection from "../components/ProjectMeetingMainSection";
import { ChevronRight, ChevronLeft, NotebookPen } from "lucide-react"; // Import icons for expand/collapse and NotebookPen icon

// Mock data for filter categories and their options (copied from ProjectMeetingSidebar for now)
const filterCategories = [
  {
    id: "favorite",
    title: "Favorite One",
    icon: "Star", // Use string name or pass actual icon component if needed elsewhere
    options: ["Most Liked", "Recently Favorited", "Top Rated"],
  },
  {
    id: "managers",
    title: "Project Managers",
    icon: "Users",
    options: [
      "John Smith",
      "Sarah Johnson",
      "Mike Chen",
      "Emily Davis",
      "Alex Rodriguez",
    ],
  },
  {
    id: "type",
    title: "Project Type",
    icon: "FolderOpen",
    options: ["Strategic", "External", "Internal", "PoC", "Research"],
  },
  {
    id: "phase",
    title: "Project Phase",
    icon: "GitBranch",
    options: [
      "Planning",
      "Development",
      "Testing",
      "Deployment",
      "Maintenance",
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    icon: "Briefcase",
    options: [
      "Digital Transformation",
      "Infrastructure",
      "Product Development",
      "Innovation",
    ],
  },
  {
    id: "program",
    title: "Program",
    icon: "Code",
    options: [
      "Alpha Program",
      "Beta Initiative",
      "Core Platform",
      "Mobile First",
    ],
  },
  {
    id: "vendor",
    title: "Vendor",
    icon: "Building",
    options: [
      "TechCorp",
      "InnovateLabs",
      "DataSystems",
      "CloudProvider",
      "DevTools Inc",
    ],
  },
  {
    id: "owner",
    title: "Business Owner",
    icon: "User",
    options: [
      "Marketing Team",
      "Sales Division",
      "Operations",
      "Finance",
      "HR Department",
    ],
  },
  {
    id: "budget",
    title: "Project budget status",
    icon: "DollarSign",
    options: ["Under Budget", "On Budget", "Over Budget", "Budget Pending"],
  },
];

const MeetingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false); // State for notes panel
  const [activeCategory, setActiveCategory] = useState("managers"); // Moved from ProjectMeetingSidebar
  const [activeOption, setActiveOption] = useState("Strategic"); // Moved from ProjectMeetingSidebar

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  // Toggle function for notes panel
  const toggleNotesPanel = () => setIsNotesPanelOpen((open) => !open);

  // Handlers for category and option selection (Moved from ProjectMeetingSidebar)
  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    // Set first option as default when category changes
    const category = filterCategories.find((cat) => cat.id === categoryId);
    if (category && category.options.length > 0) {
      setActiveOption(category.options[0]);
    }
  };

  const handleOptionSelect = (categoryId, option) => {
    // Find the category to ensure the option belongs to it (optional, but good practice)
    const category = filterCategories.find((cat) => cat.id === categoryId);
    if (category && category.options.includes(option)) {
      setActiveOption(option);
    }
  };

  // Find the current category data based on activeCategory state
  const currentCategoryData = filterCategories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Project Meeting Sidebar (Left Navigation) */}
        <ProjectMeetingSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          selectedCategory={activeCategory}
          onCategorySelect={handleCategorySelect}
          selectedOption={activeOption} // Pass active option for styling
        />

        {/* Main Content Area (Header + Main Section) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Project Meeting Header */}
          <ProjectMeetingHeader
            toggleSidebar={toggleSidebar}
            currentCategory={currentCategoryData}
            activeOption={activeOption}
            handleOptionClick={handleOptionSelect}
            filterCategories={filterCategories}
          />

          {/* Project Meeting Main Section */}
          <ProjectMeetingMainSection
            currentCategory={currentCategoryData}
            activeOption={activeOption}
            mainContent={<ProjectTasksSection />}
          />
        </div>

        {/* Sticky Toggle for Notes Panel */}
        {!isNotesPanelOpen && (
          <button
            onClick={toggleNotesPanel}
            className="fixed right-4 bottom-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
            aria-label="Open Meeting Notes"
          >
            <NotebookPen size={24} />
          </button>
        )}

        {/* Sticky Expandable Notes Panel */}
        <div
          className={`fixed right-0 top-16 bottom-0 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-y-auto ${
            isNotesPanelOpen ? "w-80" : "w-0"
          }`}
        >
          <div
            className={`p-4 h-full ${isNotesPanelOpen ? "block" : "hidden"}`}
          >
            {" "}
            {/* Hide content when collapsed */}
            <button
              onClick={toggleNotesPanel}
              className="absolute top-2 left-2 text-gray-500 hover:text-gray-700"
            >
              {isNotesPanelOpen ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}{" "}
              {/* Arrow icon */}
            </button>
            <MeetingNotesSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingsPage;
