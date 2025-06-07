import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Target,
  Puzzle,
  Users,
  Briefcase,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";

const ProjectTiles = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sample data matching the reference
  const projectData = {
    id: "12025",
    title: "External Platform upgrade for long name project applies in this year",
    type: "Strategic",
    category: "Capex",
    initiative: "Enhance customer experience",
    portfolio: "Portfolio number sixteen",
    altProjectManager: "Abdulaziz Hawara",
    vendor: "PwC",
    program: "Programmed projects now",
    mainBusinessOwner: "Information Technology",
    creationDate: "25-MAY-2025",
    plannedBudget: "1,500,000 SAR",
    plannedInvoices: "900,000 SAR",
    plannedInvoicesPercentage: "60%",
    deliverables: "8",
    partiallyDelayed: "1",
    delayed: "1",
    onPlan: "3",
    notStarted: "1",
    completed: "2",
    invoiced: "500,000 SAR",
    delayedInvoices: "100,000 SAR",
    delayedInvoicesPercentage: "6%",
    schedulePerformanceIndex: ".78",
    scheduleVariance: "75,000 SAR",
    actualCompletion: "45%",
    actualCompletionPercentage: "10%",
    plannedCompletion: "55%",
    executionStartDate: "18-Aug-2024",
    executionEndDate: "18-Aug-2024",
    duration: "7 months",
    maintenanceStartDate: "18-Aug-2024",
    maintenanceEndDate: "18-Aug-2024",
    maintenanceDuration: "7 months",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const topInfoData = [
    { icon: Target, label: "TYPE", value: projectData.type },
    { icon: Puzzle, label: "CATEGORY", value: projectData.category },
    { icon: Users, label: "INITIATIVE", value: projectData.initiative },
    { icon: Briefcase, label: "PORTFOLIO", value: projectData.portfolio },
    { icon: User, label: "ALT. PROJECT MANAGER", value: projectData.altProjectManager },
    { icon: Briefcase, label: "VENDOR NAME", value: projectData.vendor },
    { icon: User, label: "PROJECT MANAGER", value: projectData.altProjectManager },
    { icon: Puzzle, label: "PROGRAM", value: projectData.program },
    { icon: Briefcase, label: "MAIN BUSINESS OWNER", value: projectData.mainBusinessOwner },
    { icon: Calendar, label: "CREATION DATE", value: projectData.creationDate },
  ];

  const fixedStats = [
    { icon: DollarSign, label: "Budget", value: projectData.plannedBudget, className: "bg-gray-50" },
    { icon: FileText, label: "Planned invoices", value: projectData.plannedInvoices, subValue: projectData.plannedInvoicesPercentage, className: "bg-gray-50" },
    { icon: FileText, label: "Deliverables", value: projectData.deliverables, className: "bg-gray-50" },
    { icon: AlertTriangle, label: "Partially Delayed", value: projectData.partiallyDelayed, className: "bg-yellow-50", iconColor: "text-yellow-600" },
    { icon: CheckCircle, label: "On Plan", value: projectData.onPlan, className: "bg-green-50", iconColor: "text-green-600" },
    { icon: DollarSign, label: "Invoiced", value: projectData.invoiced, className: "bg-gray-50" },
    { icon: FileText, label: "Delayed invoices", value: projectData.delayedInvoices, subValue: projectData.delayedInvoicesPercentage, className: "bg-gray-50" },
    { icon: CheckCircle, label: "Completed", value: projectData.completed, className: "bg-blue-50", iconColor: "text-blue-600" },
    { icon: XCircle, label: "Delayed", value: projectData.delayed, className: "bg-red-50", iconColor: "text-red-600" },
    { icon: Clock, label: "Not started", value: projectData.notStarted, className: "bg-gray-50" },
  ];

  const performanceIndices = [
    { label: "SPI", value: projectData.schedulePerformanceIndex, bgColor: "bg-red-600" },
    { label: "SV", value: projectData.scheduleVariance, bgColor: "bg-gray-50 text-gray-900 border" },
    { label: "ACTUAL COMPLETION", value: projectData.actualCompletion, subValue: projectData.actualCompletionPercentage, bgColor: "bg-gray-50 text-gray-900 border" },
    { label: "PLANNED COMPLETION", value: projectData.plannedCompletion, bgColor: "bg-gray-50 text-gray-900 border" },
  ];

  const dateInfo = [
    { label: "EXECUTION START DATE", value: projectData.executionStartDate },
    { label: "EXECUTION END DATE", value: projectData.executionEndDate },
    { label: "Duration", value: projectData.duration },
    { label: "Maintenance and operation", value: projectData.maintenanceStartDate },
    { label: "Maintenance and operation", value: projectData.maintenanceEndDate },
    { label: "Duration", value: projectData.maintenanceDuration },
  ];

  return (
    <motion.div
      className="border rounded-lg shadow-sm bg-white p-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="flex justify-between items-start mb-6"
        variants={cardVariants}
      >
        <h2 className="text-xl font-medium text-gray-900">
          P_{projectData.id}: {projectData.title}
        </h2>
        <motion.button
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
          transition={{ duration: 0.2 }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Collapsible Info Grid - 5 columns */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 },
            }}
            style={{ overflow: "hidden" }}
          >
            <motion.div
              className="grid grid-cols-5 gap-4 mb-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {topInfoData.map((item, index) => (
                <AnimatedInfoCard
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse/Expand button */}
      <motion.div className="flex justify-center mb-6" variants={cardVariants}>
        <motion.button
          className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border hover:bg-gray-200"
          onClick={() => setIsExpanded(!isExpanded)}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Fixed Stats Grid - First Row (7 tiles) */}
      <motion.div
        className="grid grid-cols-7 gap-4 mb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          ...fixedStats.slice(0, 5),
          performanceIndices[0], // SPI
          performanceIndices[2], // Actual Completion
        ].map((item, index) => (
          <motion.div
            key={index}
            className={`bg-gray-50 border rounded-lg p-4 flex flex-col justify-center ${item.bgColor === "bg-red-600" ? "!bg-[#e60000] !text-white !border-0" : ""}`}
            variants={cardVariants}
            style={item.bgColor === "bg-red-600" ? { backgroundColor: '#e60000', color: '#fff', border: 'none' } : {}}
          >
            {/* Add icon for stat tiles if present */}
            {item.icon && (
              <span className="mb-1 flex items-center">
                <item.icon className={`w-5 h-5 mr-2 ${item.iconColor || 'text-gray-600'}`} />
                <span className="text-xs text-gray-600 uppercase font-medium">{item.label}</span>
              </span>
            )}
            {/* For performance indices, just label */}
            {!item.icon && (
              <span className="text-xs text-gray-600 mb-1 uppercase font-medium" style={item.bgColor === "bg-red-600" ? { color: '#fff' } : {}}>{item.label}</span>
            )}
            <span className={`text-sm font-bold ${item.bgColor === "bg-red-600" ? "text-white" : "text-gray-900"}`}>{item.value}</span>
            {item.subValue && (
              <span className="text-xs text-gray-500 mt-1">{item.subValue}</span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Fixed Stats Grid - Second Row (7 tiles) */}
      <motion.div
        className="grid grid-cols-7 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {[
          ...fixedStats.slice(5, 10),
          performanceIndices[1], // SV
          performanceIndices[3], // Planned Completion
        ].map((item, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 border rounded-lg p-4 flex flex-col justify-center"
            variants={cardVariants}
          >
            {item.icon && (
              <span className="mb-1 flex items-center">
                <item.icon className={`w-5 h-5 mr-2 ${item.iconColor || 'text-gray-600'}`} />
                <span className="text-xs text-gray-600 uppercase font-medium">{item.label}</span>
              </span>
            )}
            {!item.icon && (
              <span className="text-xs text-gray-600 mb-1 uppercase font-medium">{item.label}</span>
            )}
            <span className="text-sm font-bold text-gray-900">{item.value}</span>
            {item.subValue && (
              <span className="text-xs text-gray-500 mt-1">{item.subValue}</span>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Date Information */}
      <motion.div
        className="grid grid-cols-6 gap-4"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1,
            },
          }}
        }
        initial="hidden"
        animate="visible"
      >
        {dateInfo.map((item, index) => (
          <motion.div
            key={index}
            className="bg-gray-50 border rounded-lg p-4"
            variants={cardVariants}
          >
            <p className="text-xs text-gray-500 font-medium uppercase mb-2">{item.label}</p>
            <p className="text-sm font-medium text-gray-900">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const AnimatedInfoCard = ({ icon: Icon, label, value, delay }) => {
  return (
    <motion.div
      className="bg-gray-50 border rounded-lg p-4 cursor-pointer"
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: delay,
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <motion.div transition={{ duration: 0.2 }}>
          <Icon className="w-5 h-5 text-gray-500" />
        </motion.div>
        <span className="text-xs text-gray-500 font-medium uppercase">{label}</span>
      </div>
      <motion.p
        className="text-sm font-medium text-gray-900"
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
};

const AnimatedStatCard = ({
  icon: Icon,
  label,
  value,
  subValue,
  className = "bg-gray-50",
  iconColor = "text-gray-600",
}) => {
  return (
    <motion.div
      className={`${className} border rounded-lg p-4 cursor-pointer`}
      variants={{
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          },
        },
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <motion.div transition={{ duration: 0.2 }}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </motion.div>
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      <motion.p
        className="text-sm font-medium text-gray-900"
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.p>
      {subValue && (
        <motion.p
          className="text-xs text-gray-500 mt-1"
          initial={{ opacity: 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {subValue}
        </motion.p>
      )}
    </motion.div>
  );
};

export default ProjectTiles;