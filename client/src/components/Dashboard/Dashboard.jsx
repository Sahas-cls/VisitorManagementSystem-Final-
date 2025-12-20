import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaCalendarDay,
  FaUserCheck,
  FaUserClock,
  FaBuilding,
  FaUsers,
  FaCar,
  FaChartBar,
  FaChartPie,
  FaCalendarAlt,
  FaSync,
  FaExclamationCircle,
  FaFilter,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUtensils,
} from "react-icons/fa";
import { IoSearch, IoFilter, IoClose, IoCalendar } from "react-icons/io5";
import {
  MdCheckCircle,
  MdPending,
  MdTrendingUp,
  MdPeople,
} from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { TbChartAreaLine } from "react-icons/tb";
import { GiMeal } from "react-icons/gi";
import axios from "axios";

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const Dashboard = ({
  userCategory,
  userDepartment,
  userDepartmentId,
  userFactoryId,
}) => {
  const [summaryData, setSummaryData] = useState({
    totalTodayVisits: 0,
    currentVisits: 0,
    yetToVisit: 0,
    completedVisits: 0,
  });

  const apiUrl = import.meta.env.VITE_API_URL;
  const [upcomingVisitors, setUpcomingVisitors] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    factories: [],
    departments: [],
  });

  console.log("factory list and dep set", filterOptions);

  const [statistics, setStatistics] = useState({
    factoryStats: [],
    categoryStats: [],
    mealPlanStats: [],
    hourlyData: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // New state for UI improvements
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list' for visitors
  const [expandedRows, setExpandedRows] = useState([]);

  // Get today's date in YYYY-MM-DD format for default
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const [filters, setFilters] = useState({
    factoryId: userFactoryId,
    departmentId:
      userCategory === "HR User"
        ? ""
        : userCategory === "Reception"
        ? ""
        : userDepartmentId,
    status: "",
  });
  const [activeTab, setActiveTab] = useState("visitors");
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced color palette
  const COLORS = [
    "#6366F1", // Indigo
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#EF4444", // Red
    "#8B5CF6", // Violet
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ];

  const GRADIENTS = {
    primary: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    warning: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
    danger: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
    info: "linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)",
  };

  // Enhanced card data with better gradients
  const isToday = selectedDate === getTodayDate();
  const fCardData = [
    {
      id: 0,
      icon: <FaCalendarDay size={32} />,
      data: summaryData.totalTodayVisits,
      title: isToday ? "Today's Total Visits" : "Total Scheduled Visits",
      gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
      iconColor: "text-white",
      pattern: "opacity-10",
      // trend: "+12%",
      subtitle: "From yesterday",
    },
    {
      id: 1,
      icon: <FaUserCheck size={32} />,
      data: summaryData.currentVisits,
      title: "Active Visits",
      gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
      iconColor: "text-white",
      pattern: "opacity-10",
      // trend: "+8%",
      subtitle: "Currently on site",
    },
    {
      id: 2,
      icon: <FaUserClock size={32} />,
      data: summaryData.yetToVisit,
      title: "Upcoming Visits",
      gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
      iconColor: "text-white",
      pattern: "opacity-10",
      // trend: "-5%",
      subtitle: "Scheduled for later",
    },
    {
      id: 3,
      icon: <MdCheckCircle size={32} />,
      data: summaryData.completedVisits,
      title: "Completed Visits",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
      iconColor: "text-white",
      pattern: "opacity-10",
      // trend: "+15%",
      subtitle: "Successfully completed",
    },
  ];

  // Generate sample hourly data for the chart
  const generateHourlyData = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    return hours.map((hour) => ({
      hour: `${hour}:00`,
      scheduled: Math.floor(Math.random() * 20) + 5,
      checkedIn: Math.floor(Math.random() * 15) + 3,
      completed: Math.floor(Math.random() * 10) + 1,
    }));
  };

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
    fetchFilterOptions();
    fetchStatistics();
  }, [filters, selectedDate]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing && activeTab === "visitors") {
        fetchDashboardData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [refreshing, activeTab]);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [summaryRes, upcomingRes] = await Promise.all([
        axios.get(`${apiUrl}/dashboard/summary`, {
          params: { date: selectedDate },
        }),
        axios.get(`${apiUrl}/dashboard/upcoming`, {
          params: { ...filters, date: selectedDate },
        }),
      ]);
      console.log("upcoming res: ", upcomingRes);
      if (summaryRes.data.success) {
        setSummaryData(summaryRes.data.data);
      }

      if (upcomingRes.data.success) {
        setUpcomingVisitors(upcomingRes.data.data.visits);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${apiUrl}/dashboard/filters`);
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
      console.log("filter options: ", response);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/dashboard/statistics`);
      if (response.data.success) {
        const data = response.data.data;

        const transformedFactoryStats = (data.factoryStats || []).map(
          (stat) => ({
            Factory_Name: stat.name || stat.Factory_Name || "Unknown Factory",
            visitCount: stat.value || stat.visitCount || 0,
          })
        );

        const transformedCategoryStats = (data.categoryStats || []).map(
          (stat) => ({
            categoryName: stat.name || stat.categoryName || "Unknown Category",
            visitCount: stat.value || stat.visitCount || 0,
          })
        );

        setStatistics({
          ...data,
          factoryStats: transformedFactoryStats,
          categoryStats: transformedCategoryStats,
          mealPlanStats: data.mealPlanStats || [],
          hourlyData: data.hourlyData || generateHourlyData(),
        });
      }
      console.log("static ans: ", response);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Failed to load statistics. Please try again.");
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      fetchDashboardData();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/dashboard/search`, {
        params: { q: searchTerm },
      });
      if (response.data.success) {
        setUpcomingVisitors(response.data.data);
      }
    } catch (error) {
      console.error("Error searching:", error);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, apiUrl]);

  const handleFilterChange = (key, value) => {
    // console.log("key: ", key, " ", "value: ", value);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStatusBadge = (visit) => {
    const status =
      visit.Status ||
      (visit.CheckIn_Time && visit.CheckOut_Time
        ? "Completed Visit"
        : visit.CheckIn_Time
        ? "Ongoing Visit"
        : "Upcoming Visit");

    const statusConfig = {
      "User Approval Pending": {
        bg: "bg-gradient-to-r from-amber-100 to-amber-50",
        text: "User Approval Pending",
        border: "border-amber-200",
        icon: "⏳",
      },
      "Department Head Approval Pending": {
        bg: "bg-gradient-to-r from-yellow-100 to-yellow-50",
        text: "Department Head Approval Pending",
        border: "border-yellow-200",
        icon: "👨‍💼",
      },
      "HR Approval Pending": {
        bg: "bg-gradient-to-r from-yellow-100 to-yellow-50",
        text: "HR Approval Pending",
        border: "border-yellow-200",
        icon: "🏢",
      },
      "Reference Number Pending": {
        bg: "bg-gradient-to-r from-purple-100 to-purple-50",
        text: "Reference Number Pending",
        border: "border-purple-200",
        icon: "🔢",
      },
      "Upcoming Visit": {
        bg: "bg-gradient-to-r from-blue-100 to-blue-50",
        text: "Upcoming Visit",
        border: "border-blue-200",
        icon: "📅",
      },
      "Ongoing Visit": {
        bg: "bg-gradient-to-r from-emerald-100 to-emerald-50",
        text: "Ongoing Visit",
        border: "border-emerald-200",
        icon: "👤",
      },
      "Completed Visit": {
        bg: "bg-gradient-to-r from-green-100 to-green-50",
        text: "Completed Visit",
        border: "border-green-200",
        icon: "✅",
      },
      "Unknown Status": {
        bg: "bg-gradient-to-r from-gray-100 to-gray-50",
        text: "Unknown Status",
        border: "border-gray-200",
        icon: "❓",
      },
    };

    const config = statusConfig[status] || statusConfig["Unknown Status"];

    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} text-gray-800 text-xs font-semibold shadow-sm`}
      >
        <span>{config.icon}</span>
        <span>{config.text.includes("Visit") ? status : config.text}</span>
      </div>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const visitCard = (item) => {
    return (
      <div
        className="relative p-3 rounded-2xl shadow-lg shadow-black/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer overflow-hidden"
        style={{ background: item.gradient }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm ${item.iconColor}`}
            >
              {item.icon}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/90 font-semibold text-sm mb-1">
                {item.title}
              </span>
              <span className="text-2xl font-bold text-white">{item.data}</span>
              {item.trend && (
                <span
                  className={`text-xs mt-1 px-2 py-0.5 rounded-full ${
                    parseFloat(item.trend) >= 0
                      ? "bg-green-500/20 text-green-100"
                      : "bg-red-500/20 text-red-100"
                  }`}
                >
                  {item.trend}
                </span>
              )}
            </div>
          </div>

          {item.subtitle && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
              <p className="text-white/70 text-xs">{item.subtitle}</p>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <FaArrowRight className="text-white/70 text-sm" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Chart 1: Visitors by Factory (Bar Chart)
  const FactoryBarChart = () => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 rounded-xl">
            <FaBuilding className="text-xl text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Visitors by Factory
            </h3>
            <p className="text-gray-500 text-sm">
              Distribution across facilities
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiDownload className="text-gray-500" />
        </button>
      </div>
      {statistics.factoryStats.length === 0 ? (
        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
          <div className="text-4xl mb-2">🏭</div>
          <p>No factory data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={statistics.factoryStats}>
            <defs>
              <linearGradient id="colorFactory" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="Factory_Name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "12px",
              }}
              cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
            />
            <Bar
              dataKey="visitCount"
              name="Visits"
              fill="url(#colorFactory)"
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  // Chart 2: Visitors by Category (Pie Chart)
  const CategoryPieChart = () => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <MdPeople className="text-xl text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Visitors by Category
            </h3>
            <p className="text-gray-500 text-sm">Visitor type breakdown</p>
          </div>
        </div>
      </div>
      {statistics.categoryStats.length === 0 ? (
        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p>No category data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statistics.categoryStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="visitCount"
                nameKey="categoryName"
                label={(entry) => entry.categoryName}
              >
                {statistics.categoryStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {statistics.categoryStats.slice(0, 4).map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {entry.categoryName}
                </span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {entry.visitCount}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Chart 3: Visit Status Distribution (Area Chart)
  const StatusAreaChart = () => {
    const statusData = [
      {
        name: "Upcoming",
        value: summaryData.yetToVisit,
        color: "#F59E0B",
        fill: "rgba(245, 158, 11, 0.1)",
      },
      {
        name: "Ongoing",
        value: summaryData.currentVisits,
        color: "#3B82F6",
        fill: "rgba(59, 130, 246, 0.1)",
      },
      {
        name: "Completed",
        value: summaryData.completedVisits,
        color: "#10B981",
        fill: "rgba(16, 185, 129, 0.1)",
      },
    ];

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FaChartBar className="text-xl text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Visit Status Distribution
              </h3>
              <p className="text-gray-500 text-sm">
                Current visit status breakdown
              </p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={statusData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "12px",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#F59E0B"
              fill="url(#colorStatus)"
              strokeWidth={2}
              name="Number of Visits"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-4 mt-6">
          {statusData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 bg-gray-50 rounded-xl min-w-[100px]"
            >
              <div
                className="w-4 h-4 rounded-full mb-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Chart 4: Meal Plan Summary (Pie Chart)
  const MealPlanChart = () => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-xl">
            <GiMeal className="text-xl text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Today's Meal Plan Summary
            </h3>
            <p className="text-gray-500 text-sm">
              Meal preferences distribution
            </p>
          </div>
        </div>
      </div>
      {statistics.mealPlanStats.length === 0 ? (
        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
          <div className="text-4xl mb-2">🍽️</div>
          <p>No meal plans for today</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statistics.mealPlanStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {statistics.mealPlanStats.map((entry, index) => (
                  <Cell
                    key={`cell-meal-${index}`}
                    fill={COLORS[(index + 2) % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  padding: "12px",
                }}
                formatter={(value) => [`${value} visitors`, "Count"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {statistics.mealPlanStats.slice(0, 4).map((entry, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: COLORS[(index + 2) % COLORS.length],
                  }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {entry.name}
                </span>
                <span className="ml-auto text-sm font-semibold text-gray-900">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // Chart 5: Hourly Visit Trend (Line Chart)
  const HourlyTrendChart = () => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FaCalendarAlt className="text-xl text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Today's Hourly Visit Trend
            </h3>
            <p className="text-gray-500 text-sm">
              Visit activity throughout the day
            </p>
          </div>
        </div>
      </div>
      {statistics.hourlyData.length === 0 ? (
        <div className="h-[250px] flex flex-col items-center justify-center text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No hourly data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={statistics.hourlyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f3f4f6"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "12px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="scheduled"
              stroke="#6366F1"
              name="Scheduled"
              strokeWidth={2}
              dot={{ fill: "#6366F1", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="checkedIn"
              stroke="#10B981"
              name="Checked In"
              strokeWidth={2}
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#8B5CF6"
              name="Completed"
              strokeWidth={2}
              dot={{ fill: "#8B5CF6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const handleRefresh = () => {
    fetchDashboardData(true);
    fetchStatistics();
  };

  const clearFilters = () => {
    setFilters({
      factoryId: userFactoryId || "",
      departmentId: userDepartmentId || "",
      status: "",
    });
    setSearchTerm("");
    setSelectedDate(getTodayDate());
    setShowFilters(false);
  };

  const hasActiveFilters =
    filters.factoryId ||
    filters.departmentId ||
    filters.status ||
    searchTerm ||
    selectedDate !== getTodayDate();

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "Today";
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);

    if (selected.getTime() === today.getTime()) {
      return "Today";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Export function
  const exportData = () => {
    alert("Export functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6 w-[100%]">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg border">
                <FaUsers className="text-2xl text-black/70" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Visitor Dashboard
                </h1>
                {/* {userFactoryId || "----------------------------"} */}

                <p className="text-gray-600 mt-1">
                  {/* Real-time monitoring and analytics •{" "} */}
                  {formatDateDisplay(selectedDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <FaSync
                className={`${refreshing ? "animate-spin" : ""} text-black`}
              />
              <span className="font-medium text-black">
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FaExclamationCircle className="text-red-600" />
            </div>
            <div>
              <p className="font-medium text-red-800">{error}</p>
              <p className="text-sm text-red-600">Please try again</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <IoClose className="text-red-500" />
          </button>
        </div>
      )}

      {/* Enhanced Tab Navigation */}
      <div className="mb-8">
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm border border-gray-200">
          <button
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
              activeTab === "visitors"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("visitors")}
          >
            <FaUsers className="text-lg text-blue-900" />
            <span className="font-semibold text-blue-900">Visitors</span>
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
              {summaryData.totalTodayVisits}
            </span>
          </button>
          <button
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
              activeTab === "analytics"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("analytics")}
          >
            <FaChartBar className="text-lg text-blue-900" />
            <span className="font-semibold text-blue-900">Analytics</span>
            {/* <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">
              Insights
            </span> */}
          </button>
        </div>
      </div>

      {/* Enhanced Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {fCardData.map((item) => (
          <div key={item.id}>{visitCard(item)}</div>
        ))}
      </div>

      {/* Visitors Tab Content */}
      {activeTab === "visitors" && (
        <>
          {/* Enhanced Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden border border-gray-200">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Enhanced Search */}
                <div className="flex-1">
                  <div className="relative">
                    <IoSearch
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      className="w-full pl-12 pr-40 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                      placeholder="Search visitors, contact persons, NIC or phone numbers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            handleSearch();
                          }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <IoClose size={18} className="text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                      showFilters || hasActiveFilters
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <IoFilter />
                    <span className="font-medium">Filters</span>
                    {hasActiveFilters && (
                      <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "list" : "grid")
                    }
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    {viewMode === "grid" ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Enhanced Filter Section */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <IoCalendar />
                        Date Selection
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          max={getTodayDate()}
                        />
                      </div>
                      {selectedDate !== getTodayDate() && (
                        <button
                          onClick={() => setSelectedDate(getTodayDate())}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Reset to Today
                        </button>
                      )}
                    </div>

                    {/* Factory Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Factory
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200 appearance-none"
                        value={filters.factoryId}
                        onChange={(e) =>
                          handleFilterChange("factoryId", e.target.value)
                        }
                      >
                        {filterOptions.factories.map((factory) => (
                          <option
                            key={factory.Factory_Id}
                            value={factory.Factory_Id}
                          >
                            {factory.Factory_Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={filters.departmentId}
                        onChange={(e) =>
                          handleFilterChange("departmentId", e.target.value)
                        }
                        disabled={!filters.factoryId}
                      >
                        <option value="">All Departments</option>
                        {filterOptions.departments
                          .filter(
                            (dept) =>
                              !filters.factoryId ||
                              dept.Factory_Id == filters.factoryId
                          )
                          .map((dept) => (
                            <option
                              key={dept.Department_Id}
                              value={dept.Department_Id}
                            >
                              {dept.Department_Name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full border-2 border-gray-200 rounded-xl p-3 bg-gray-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all duration-200"
                        value={filters.status}
                        onChange={(e) =>
                          handleFilterChange("status", e.target.value)
                        }
                      >
                        <option value="">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-red-600 hover:text-red-700 font-medium flex items-center gap-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <IoClose size={18} />
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Visitors Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FaUsers className="text-xl text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Visitor Management
                    </h2>
                    <p className="text-gray-600">
                      {formatDateDisplay(selectedDate)} •{" "}
                      {upcomingVisitors.length} visitors
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Auto-refreshes every 5 minutes
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Visitor Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Department & Factory
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Timing
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                          </div>
                          <div>
                            <p className="text-gray-700 font-medium">
                              Loading visitors...
                            </p>
                            <p className="text-gray-500 text-sm">
                              Fetching latest data
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : upcomingVisitors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="p-4 bg-gray-100 rounded-2xl">
                            <FaUsers className="text-4xl text-gray-300" />
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700 font-medium text-lg">
                              No visitors found
                            </p>
                            <p className="text-gray-500">
                              {hasActiveFilters
                                ? "Try adjusting your filters or search terms"
                                : `No visitors scheduled for ${formatDateDisplay(
                                    selectedDate
                                  )}`}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    upcomingVisitors.map((visit) => (
                      <React.Fragment key={visit.Visit_Id}>
                        <tr className="hover:bg-indigo-50/30 transition-colors duration-150 group">
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                  <FaUsers className="text-lg text-indigo-600" />
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {visit.ContactPerson?.ContactPerson_Name ||
                                    "Unnamed Contact"}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {visit.ContactPerson
                                    ?.ContactPerson_ContactNo || "No contact"}
                                </div>
                                <div className="mt-2">
                                  <div className="text-sm font-medium text-gray-700">
                                    {visit.Visitors?.length || 0} visitor(s)
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {visit.Visitors?.slice(0, 3).map(
                                      (visitor, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                                        >
                                          {visitor.Visitor_Name}
                                        </span>
                                      )
                                    )}
                                    {visit.Visitors?.length > 3 && (
                                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-lg font-medium">
                                        +{visit.Visitors.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {visit.Department?.Department_Name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {visit.Factory?.Factory_Name || "No factory"}
                              </div>
                              {visit.VisitingPurpose?.visiting_purpose && (
                                <div className="mt-2">
                                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                                    {visit.VisitingPurpose?.visiting_purpose}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div>
                                <div className="text-sm text-gray-500">
                                  Arrival
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatTime(visit.Checkin_Time) ||
                                    "Not scheduled"}
                                </div>
                              </div>
                              {visit.CheckIn_Time && (
                                <div className="pt-2 border-t border-gray-100">
                                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Checked In: {formatTime(visit.CheckIn_Time)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(visit)}
                            {visit.Vehicles?.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                <FaCar className="text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {visit.Vehicles[0]?.Vehicle_No}
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleRowExpansion(visit.Visit_Id)}
                              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              {expandedRows.includes(visit.Visit_Id)
                                ? "Show Less"
                                : "View Details"}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.includes(visit.Visit_Id) && (
                          <tr className="bg-indigo-50/20">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="bg-white rounded-xl p-4 border border-indigo-100">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Additional Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    {/* <div className="text-sm text-gray-500">
                                      Visitor Category
                                    </div>
                                    <div className="font-medium">
                                      {visit.VisitingPurpose?.visitor_category
                                        ?.visitor_category || "N/A"}
                                    </div> */}
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500">
                                      Reference
                                    </div>
                                    <div className="font-medium">
                                      {visit.Reference_Number || "Not provided"}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500">
                                      Meal Plan
                                    </div>
                                    <div className="font-medium">
                                      <div className="flex text-sm gap-x-4 ml-8">
                                        <label
                                          htmlFor="tea"
                                          className="font-medium"
                                        >
                                          Tea:{" "}
                                        </label>
                                        <input
                                          type="checkbox"
                                          checked={visit.Tea}
                                          disabled={true}
                                          name=""
                                          id="tea"
                                          className="accent-black disabled:accent-blue-400 cursor-not-allowed"
                                          // className="disabled:bg-black"
                                        />
                                      </div>
                                    </div>

                                    {/* breakfast */}
                                    <div className="font-medium">
                                      <div className="flex text-sm gap-x-4 ml-8">
                                        <label
                                          htmlFor="breakfast"
                                          className="font-medium"
                                        >
                                          Breakfast:{" "}
                                        </label>
                                        <input
                                          type="checkbox"
                                          checked={visit.Breakfast}
                                          name=""
                                          id="breakfast"
                                          disabled={true}
                                          className="cursor-not-allowed"
                                        />
                                      </div>
                                    </div>

                                    {/* lunch */}
                                    <div className="font-medium">
                                      <div className="flex text-sm gap-x-4 ml-8">
                                        <label
                                          htmlFor="lunch"
                                          className="font-medium cursor-pointer"
                                        >
                                          Lunch:{" "}
                                        </label>
                                        <input
                                          type="checkbox"
                                          checked={visit.Lunch}
                                          className="cursor-not-allowed"
                                          name="lunch"
                                          id="lunch"
                                          disabled={true}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            {upcomingVisitors.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    <span className="font-semibold text-indigo-600">
                      {upcomingVisitors.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold">
                      {summaryData.totalTodayVisits}
                    </span>{" "}
                    total visitors
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      ← Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((page) => (
                        <button
                          key={page}
                          className={`w-10 h-10 rounded-lg text-sm font-medium ${
                            page === 1
                              ? "bg-indigo-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <span className="px-2">...</span>
                      <button className="w-10 h-10 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
                        5
                      </button>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Analytics Tab Content */}
      {activeTab === "analytics" && (
        <div className="space-y-8">
          {/* First Row - Factory and Category Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FactoryBarChart />
            <CategoryPieChart />
          </div>

          {/* Second Row - Status Distribution and Meal Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StatusAreaChart />
            <MealPlanChart />
          </div>

          {/* Third Row - Hourly Trend (Full Width) */}
          {/* <HourlyTrendChart /> */}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Top Factory</h3>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <MdTrendingUp className="text-indigo-600" />
                </div>
              </div>
              {statistics.factoryStats.length > 0 ? (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {statistics.factoryStats.reduce(
                      (max, stat) =>
                        stat.visitCount > max.visitCount ? stat : max,
                      statistics.factoryStats[0]
                    )?.Factory_Name || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-semibold">
                      {statistics.factoryStats.reduce(
                        (max, stat) =>
                          stat.visitCount > max.visitCount ? stat : max,
                        statistics.factoryStats[0]
                      )?.visitCount || 0}
                    </span>
                    <span className="text-gray-500">visits this month</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No data available</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">
                  Popular Category
                </h3>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <MdPeople className="text-emerald-600" />
                </div>
              </div>
              {statistics.categoryStats.length > 0 ? (
                <>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {statistics.categoryStats.reduce(
                      (max, stat) =>
                        stat.visitCount > max.visitCount ? stat : max,
                      statistics.categoryStats[0]
                    )?.categoryName || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-emerald-600 font-semibold">
                      {statistics.categoryStats.reduce(
                        (max, stat) =>
                          stat.visitCount > max.visitCount ? stat : max,
                        statistics.categoryStats[0]
                      )?.visitCount || 0}
                    </span>
                    <span className="text-gray-500">visitors this month</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400">No data available</div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Completion Rate</h3>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TbChartAreaLine className="text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {summaryData.totalTodayVisits > 0
                  ? Math.round(
                      (summaryData.completedVisits /
                        summaryData.totalTodayVisits) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      summaryData.totalTodayVisits > 0
                        ? Math.round(
                            (summaryData.completedVisits /
                              summaryData.totalTodayVisits) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>{summaryData.completedVisits} completed</span>
                <span>{summaryData.totalTodayVisits} total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>
          Visitor Management Dashboard v2.0 • Data updates automatically every 5
          minutes
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
