import React, { useState } from "react";
import {
  BarChart3,
  Users,
  FolderOpen,
  GitBranch,
  Briefcase,
  Code,
  Building,
  User,
  DollarSign,
  Star,
  Menu,
} from "lucide-react";

// Mock data for filter categories and their options
const filterCategories = [
  {
    id: "favorite",
    title: "Favorite One",
    icon: Star,
    options: ["Most Liked", "Recently Favorited", "Top Rated"],
  },
  {
    id: "managers",
    title: "Project Managers",
    icon: Users,
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
    icon: FolderOpen,
    options: ["Strategic", "External", "Internal", "PoC", "Research"],
  },
  {
    id: "phase",
    title: "Project Phase",
    icon: GitBranch,
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
    icon: Briefcase,
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
    icon: Code,
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
    icon: Building,
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
    icon: User,
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
    icon: DollarSign,
    options: ["Under Budget", "On Budget", "Over Budget", "Budget Pending"],
  },
];

export default function ProjectMeetingSidebar({
  selectedCategory,
  onCategorySelect,
  selectedOption,
  onOptionSelect,
  isSidebarOpen,
  toggleSidebar,
}) {
  const [activeCategory, setActiveCategory] = useState(
    selectedCategory || "managers"
  );

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    onCategorySelect?.(categoryId);

    // Set first option as default when category changes
    const category = filterCategories.find((cat) => cat.id === categoryId);
    if (category && category.options.length > 0) {
      onOptionSelect?.(category.options[0]);
    }
  };

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
      }`}
    >
      <div className="p-4">
        <div className="text-sm font-medium text-gray-500 px-2 py-2 mb-4">
          Weekly Meeting No 45
        </div>
        <nav className="space-y-1">
          {filterCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span>{category.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
