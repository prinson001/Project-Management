import React, { useState , useEffect , useRef} from "react";
import TopHeader from "../components/TopHeader";
import ProjectMeetingSidebar from "../components/ProjectMeetingSidebar";
import MeetingNotesSection from "../components/MeetingNotesSection";
import ProjectTasksSection from "../components/ProjectTasksSection";
import ProjectMeetingHeader from "../components/ProjectMeetingHeader";
import ProjectMeetingMainSection from "../components/ProjectMeetingMainSection";
import axiosInstance from "../axiosInstance";
import { ChevronRight, ChevronLeft, NotebookPen } from "lucide-react"; // Import icons for expand/collapse and NotebookPen icon
import ProjectSelectCard from "../components/ProjectSelectCard";

const MeetingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false); // State for notes panel


  const [sideBarFilters , setSideBarFilters] = useState([]);
  const [activeSideBarFilter , setActiveSideBarFilter] = useState("");
  const [subFilters , setSubFilters] = useState([]);
  const [activeSubFilter , setActiveSubFilter] = useState("");
  const subFiltersCache = useRef({});


  // Mounting stage
  useEffect(()=>{
    fetchMainFilters();
    console.log("use effect is called");
    // console.log(formatDateWithWeek(new Date("2025-05-01")));
  },[]);



  const fetchMainFilters = async ()=>{
    const response = await axiosInstance.get('/meeting/main-filters');
    if(response)
    {
      console.log(response.data.result);
      setSideBarFilters(response.data.result);
    }
  }
  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  // Toggle function for notes panel
  const toggleNotesPanel = () => setIsNotesPanelOpen((open) => !open);

  const handleSideBarOptionClick = async (option)=>{
    setActiveSideBarFilter(option);
    console.log("the option clicked "+option );
    if(subFiltersCache.current[option])
    { 
      console.log("inside the cache");
      setSubFilters(subFiltersCache.current[option]);
    }

    const response = await axiosInstance.get(`/meeting/sub-filters/${option}`);

    if(response)
    {
      console.log(response.data.result);
      setSubFilters(response.data.result);
      subFiltersCache.current[option] = response.data.result;
    }
  }
  const handleSubOptionClick = async (option)=>{
    setActiveSubFilter(option);
  }

  // Dummy projects data for selection
  const dummyProjects = [
    {
      id: 1,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "850,000 SAR",
      percent1: 10,
      percent2: 60,
      lastUpdated: "3 days ago",
      status: "danger",
    },
    {
      id: 2,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "1,400,000 SAR",
      percent1: 0,
      percent2: 90,
      lastUpdated: "3 days ago",
      status: "success",
    },
    {
      id: 3,
      title: "External Platform upgrade for long name project applies in this year",
      amount: "120,000 SAR",
      percent1: 50,
      percent2: 20,
      lastUpdated: "3 days ago",
      status: "danger",
    },
  ];

  // Show project select cards for any tab (for demo)
  const showProjectCards = !!activeSubFilter;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-black">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Project Meeting Sidebar (Left Navigation) */}
        <ProjectMeetingSidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          activeSideBarFilter={activeSideBarFilter}
          handleSideBarOptionClick={handleSideBarOptionClick}
          categories={sideBarFilters}
        />

        {/* Main Content Area (Header + Main Section) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Project Meeting Header */}
          <ProjectMeetingHeader
            toggleSidebar={toggleSidebar}
            subFilters={subFilters}
            activeSubFilter={activeSubFilter}
            handleSubOptionClick={handleSubOptionClick}
          />

          {/* Main Section: Show project cards for any tab (demo) */}
          {showProjectCards && (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {dummyProjects.map((project) => (
                <ProjectSelectCard
                  key={project.id}
                  project={project}
                  onSelect={() => {
                    // handle project selection (e.g., set selected project)
                  }}
                />
              ))}
            </div>
          )}

          {/* Project Meeting Main Section */}
          {/* <ProjectMeetingMainSection
            currentCategory={currentCategoryData}
            activeOption={activeOption}
            mainContent={<ProjectTasksSection />}
          /> */}
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
            isNotesPanelOpen ? "w-150" : "w-0"
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
