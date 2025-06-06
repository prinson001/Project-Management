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
  const [isExpanded, setIsExpanded] = useState(true);

  // Sample data matching the reference
  const projectData = {
    id: "12025",
    title:
      "External Platform upgrade for long name project applies in this year",
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
    plannedInvoices: "0 SAR",
    plannedInvoicesPercentage: "0%",
    deliverables: "N/A",
    partiallyDelayed: "0",
    delayed: "0",
    onPlan: "0",
    notStarted: "0",
    invoiced: "0 SAR",
    delayedInvoices: "0 SAR",
    completed: "0",
    schedulePerformanceIndex: ".78",
    costPerformanceIndex: "0",
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
    {
      icon: Users,
      label: "INITIATIVE",
      value: projectData.initiative,
      isHighlighted: true,
    },
    { icon: Briefcase, label: "PORTFOLIO", value: projectData.portfolio },
    {
      icon: User,
      label: "ALT. PROJECT MANAGER",
      value: projectData.altProjectManager,
    },
  ];

  const secondRowData = [
    { icon: Briefcase, label: "VENDOR NAME", value: projectData.vendor },
    {
      icon: User,
      label: "PROJECT MANAGER",
      value: projectData.altProjectManager,
    },
    {
      icon: Puzzle,
      label: "PROGRAM",
      value: projectData.program,
      isHighlighted: true,
    },
    {
      icon: Briefcase,
      label: "MAIN BUSINESS OWNER",
      value: projectData.mainBusinessOwner,
    },
    { icon: Calendar, label: "CREATION DATE", value: projectData.creationDate },
  ];

  const firstRowStats = [
    {
      icon: DollarSign,
      label: "Planned Budget",
      value: projectData.plannedBudget,
      className: "bg-gray-50",
    },
    {
      icon: FileText,
      label: "Planned invoices",
      value: projectData.plannedInvoices,
      subValue: projectData.plannedInvoicesPercentage,
      className: "bg-gray-50",
    },
    {
      icon: FileText,
      label: "Deliverables",
      value: projectData.deliverables,
      className: "bg-gray-50",
    },
    {
      icon: AlertTriangle,
      label: "Partially Delayed",
      value: projectData.partiallyDelayed,
      className: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      icon: CheckCircle,
      label: "On Plan",
      value: projectData.onPlan,
      className: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  const secondRowStats = [
    {
      icon: DollarSign,
      label: "Invoiced",
      value: projectData.invoiced,
      subValue: projectData.plannedInvoicesPercentage,
      className: "bg-gray-50",
    },
    {
      icon: FileText,
      label: "Delayed invoices",
      value: projectData.delayedInvoices,
      subValue: projectData.plannedInvoicesPercentage,
      className: "bg-gray-50",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: projectData.completed,
      className: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: XCircle,
      label: "Delayed",
      value: projectData.delayed,
      className: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      icon: Clock,
      label: "Not started",
      value: projectData.notStarted,
      className: "bg-gray-50",
    },
  ];

  return (
    <motion.div
      className="border rounded-lg shadow-sm bg-white p-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -2,
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </motion.div>

      {/* Top Info Grid - 5 columns */}
      <motion.div
        className="grid grid-cols-5 gap-6 mb-8"
        variants={cardVariants}
      >
        {topInfoData.map((item, index) => (
          <AnimatedInfoCard
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            isHighlighted={item.isHighlighted}
            delay={index * 0.05}
          />
        ))}
      </motion.div>

      {/* Second row */}
      <motion.div
        className="grid grid-cols-5 gap-6 mb-8"
        variants={cardVariants}
      >
        {secondRowData.map((item, index) => (
          <AnimatedInfoCard
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            isHighlighted={item.isHighlighted}
            delay={index * 0.05}
          />
        ))}
      </motion.div>

      {/* Collapse/Expand button */}
      <motion.div className="flex justify-center mb-6" variants={cardVariants}>
        <motion.button
          className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded border hover:bg-gray-200"
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{
            scale: 1.1,
            backgroundColor: "rgb(229 231 235)",
          }}
          whileTap={{ scale: 0.95 }}
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

      {/* Animated Stats Section */}
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
            {/* Stats Grid - First Row */}
            <motion.div
              className="grid grid-cols-5 gap-4 mb-4"
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
              {firstRowStats.map((item, index) => (
                <AnimatedStatCard
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  subValue={item.subValue}
                  className={item.className}
                  iconColor={item.iconColor}
                />
              ))}
            </motion.div>

            {/* Stats Grid - Second Row */}
            <motion.div
              className="grid grid-cols-5 gap-4 mb-6"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.2,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              {secondRowStats.map((item, index) => (
                <AnimatedStatCard
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                  subValue={item.subValue}
                  className={item.className}
                  iconColor={item.iconColor}
                />
              ))}
            </motion.div>

            {/* Performance Indices */}
            <motion.div
              className="flex justify-end space-x-4"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.3,
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
            >
              <PerformanceIndex
                label="Schedule Performance Index"
                value={projectData.schedulePerformanceIndex}
                bgColor="bg-red-600"
              />
              <PerformanceIndex
                label="Cost Performance Index"
                value={projectData.costPerformanceIndex}
                bgColor="bg-green-600"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const AnimatedInfoCard = ({
  icon: Icon,
  label,
  value,
  isHighlighted,
  delay,
}) => {
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
      whileHover={{
        y: -4,
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-5 h-5 text-gray-500" />
        </motion.div>
        <span className="text-xs text-gray-500 font-medium uppercase">
          {label}
        </span>
      </div>
      <motion.p
        className={`text-sm font-medium ${
          isHighlighted ? "text-orange-600" : "text-gray-900"
        }`}
        whileHover={isHighlighted ? { scale: 1.05 } : {}}
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
      whileHover={{
        y: -6,
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </motion.div>
        <span className="text-xs text-gray-600 font-medium">{label}</span>
      </div>
      <motion.p
        className="text-sm font-medium text-gray-900"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.p>
      {subValue && (
        <motion.p
          className="text-xs text-gray-500 mt-1"
          initial={{ opacity: 0.7 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {subValue}
        </motion.p>
      )}
    </motion.div>
  );
};

const PerformanceIndex = ({ label, value, bgColor }) => {
  return (
    <motion.div
      className="text-right"
      variants={{
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
      }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <motion.div
        className={`${bgColor} text-white px-3 py-1 rounded text-sm font-medium`}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {value}
      </motion.div>
    </motion.div>
  );
};

export default ProjectTiles;
