import React, { useState } from "react";
import Accordion from "../components/Accordion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { Maximize2 } from "lucide-react";
import DashboardTabs from "../components/DashboardTabs";
import ProjectSelectCard from "../components/ProjectSelectCard";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const DashboardCard = ({
  title,
  total,
  mainPercent,
  mainLabel,
  secondaryPercent,
  secondaryLabel,
  mainColor = "#3b82f6",
  secondaryColor = "#e53e3e",
}) => {
  const data = {
    labels: [mainLabel, secondaryLabel],
    datasets: [
      {
        label: "Progress",
        data: [mainPercent, secondaryPercent],
        backgroundColor: [mainColor + "80", secondaryColor + "80"],
        borderColor: [mainColor, secondaryColor],
        borderWidth: 1,
        cutout: "65%",
        hoverOffset: 20,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: "65%",
    radius: "80%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    interaction: {
      mode: "nearest",
      intersect: true,
    },
  };

  return (
    <div className="relative border border-gray-200 rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">{title}</h3>
      <div className="w-full flex justify-between mb-2">
        <span className="text-red-600 font-medium">
          {secondaryPercent}% {secondaryLabel}
        </span>
        <Maximize2 size={16} className="text-gray-500" />
      </div>
      <div className="w-56 h-56 relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold">{total}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="font-medium">
          {mainPercent}% {mainLabel}
        </span>
      </div>
    </div>
  );
};

const PerformanceChart = ({ title, value, data, color }) => {
  const months = ["April", "May", "June", "July", "Aug", "Sep", "Oct"];

  const chartData = {
    labels: months,
    datasets: [
      {
        data: data,
        borderColor: color === "red" ? "#ef4444" : "#10b981",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: color === "red" ? "#ef4444" : "#10b981",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        min: 0.9,
        max: 1.1,
        ticks: {
          stepSize: 0.05,
        },
        grid: {
          display: true,
          color: "#f0f0f0",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <div
          className={`px-2 py-1 ${
            color === "red"
              ? "bg-red-600 text-white"
              : "bg-green-100 text-green-800"
          } rounded`}
        >
          {value}
        </div>
        <Maximize2 size={16} className="text-gray-500" />
      </div>
      <div className="h-40">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

function DashboardContent() {
  const scheduleData = [1.0, 1.04, 0.97, 1.0, 0.95, 0.99, 0.95];
  const costData = [1.0, 1.01, 0.98, 1.02, 1.0, 0.97, 1.03];

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

  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Project selection grid */}
      {!selectedProject && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {dummyProjects.map((project) => (
            <ProjectSelectCard
              key={project.id}
              project={project}
              onSelect={() => setSelectedProject(project)}
            />
          ))}
        </div>
      )}
      {/* Show project details if selected */}
      {selectedProject && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedProject.title}</h2>
            <button
              className="px-3 py-1 text-sm rounded bg-gray-100 border hover:bg-gray-200"
              onClick={() => setSelectedProject(null)}
            >
              Back to Projects
            </button>
          </div>
          {/* Project Tiles, Deliverables, Risks, etc. (dummy) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Project Tiles</h3>
            <div className="bg-white border rounded-lg p-4 mb-4">
              <span className="text-gray-700">
                [ProjectTiles for {selectedProject.title}]
              </span>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Project Deliverables</h3>
            <div className="bg-white border rounded-lg p-4 mb-4">
              <span className="text-gray-700">
                [ProjectDeliverables for {selectedProject.title}]
              </span>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Risks and Issues</h3>
            <div className="bg-white border rounded-lg p-4 mb-4">
              <span className="text-gray-700">
                [RisksAndIssuesTable for {selectedProject.title}]
              </span>
            </div>
          </div>
        </>
      )}
      {/* ...existing dashboard content (cards, charts) can be shown below or hidden if project is selected... */}
      {!selectedProject && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
            <DashboardCard
              title="Invoices"
              total={35}
              mainPercent={90}
              mainLabel="Invoiced"
              secondaryPercent={10}
              secondaryLabel="Delayed"
              mainColor="#3b82f6"
              secondaryColor="#f87171"
            />
            <DashboardCard
              title="Deliverables"
              total={121}
              mainPercent={80}
              mainLabel="On Plan"
              secondaryPercent={20}
              secondaryLabel="Delayed"
              mainColor="#10b981"
              secondaryColor="#f87171"
            />
            <DashboardCard
              title="Tasks"
              total={8}
              mainPercent={6}
              mainLabel="In Progress"
              secondaryPercent={2}
              secondaryLabel="Delayed"
              mainColor="#10b981"
              secondaryColor="#f87171"
            />
            <DashboardCard
              title="Near Due Risks"
              total={88}
              mainPercent={90}
              mainLabel="Closed"
              secondaryPercent={10}
              secondaryLabel="Open Risks"
              mainColor="#d6bcfa"
              secondaryColor="#f87171"
            />
            <DashboardCard
              title="Issues"
              total={12}
              mainPercent={80}
              mainLabel="Closed"
              secondaryPercent={20}
              secondaryLabel="Open"
              mainColor="#d6bcfa"
              secondaryColor="#f87171"
            />
            <DashboardCard
              title="Documentation"
              total={125}
              mainPercent={60}
              mainLabel="Uploaded"
              secondaryPercent={40}
              secondaryLabel="Delayed"
              mainColor="#fed7aa"
              secondaryColor="#f87171"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerformanceChart
              title="Schedule Performance Index"
              value="0.95"
              data={scheduleData}
              color="red"
            />
            <PerformanceChart
              title="Cost Performance Index"
              value="1.01"
              data={costData}
              color="green"
            />
          </div>
        </>
      )}
    </div>
  );
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("kpis");

  // Optionally, you can add a renderAddButton function if needed for DashboardTabs
  const renderAddButton = null;

  return (
    <div>
      <DashboardTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        renderAddButton={renderAddButton}
        tabs={[{ label: "KPIs", value: "kpis" }]}
      />
      {activeTab === "kpis" ? (
        <DashboardContent />
      ) : (
        <div className="p-8 text-center text-gray-400 text-lg">
          Coming soon...
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
