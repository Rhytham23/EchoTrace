import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { filterLogs } from "../api/api";
import { useTheme } from "../context/ThemeContext"; // ✅ import theme context

function LogsList() {
  const { isDarkMode } = useTheme(); // ✅ use global dark mode
  const theme = isDarkMode ? "dark" : "light"; // ✅ local variable for compatibility

  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    number: 0,
    totalPages: 0,
    size: 10,
    sort: "createdAt,desc",
    totalElements: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchingByTag, setIsSearchingByTag] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    betweenStart: "",
    betweenEnd: "",
    beforeDate: "",
    afterDate: "",
  });

  // Debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch logs
  const fetchLogs = async (page = pageInfo.number, size = pageInfo.size, sort = pageInfo.sort) => {
    setLoading(true);
    setErrorMessage("");

    const params = { page, size, sort };
    if (searchTerm.trim()) {
      params[isSearchingByTag ? "tag" : "keyword"] = searchTerm.trim();
    }
    if (dateFilter.beforeDate) params.beforeDate = new Date(dateFilter.beforeDate).toISOString();
    if (dateFilter.afterDate) params.afterDate = new Date(dateFilter.afterDate).toISOString();
    if (dateFilter.betweenStart) params.betweenStart = new Date(dateFilter.betweenStart).toISOString();
    if (dateFilter.betweenEnd) params.betweenEnd = new Date(dateFilter.betweenEnd).toISOString();

    try {
      const res = await filterLogs(params);
      setLogs(res.data.content || []);
      setPageInfo({
        number: res.data.number,
        totalPages: res.data.totalPages,
        size: res.data.size,
        sort,
        totalElements: res.data.totalElements,
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load logs. Try logging in again.";
      setErrorMessage(message);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchLogs = useCallback(
    debounce((page = 0) => fetchLogs(page), 500),
    [searchTerm, isSearchingByTag, dateFilter, pageInfo.size, pageInfo.sort]
  );

  // Fetch logs on mount and on filter/search change
  useEffect(() => {
    setPageInfo((prev) => ({ ...prev, number: 0 }));
    debouncedFetchLogs(0);
  }, [searchTerm, isSearchingByTag, dateFilter, debouncedFetchLogs]);

  // ---------------- Log Card ----------------
  const LogCard = ({ log }) => (
    <li
      className={`p-5 rounded-xl shadow-lg border mb-4 transition-all duration-300 transform hover:-translate-y-0.5 ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-100"
          : "bg-white border-gray-200 hover:border-blue-600 text-gray-900"
      }`}
    >
      <Link to={`/logs/${log.id}`} className="block no-underline">
        <div className="flex justify-between items-start">
          <h3
            className={`text-xl font-bold mb-2 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {log.title}
          </h3>
        </div>

        {log.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {log.tags.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-200 text-blue-800"
                }`}
              >
                {tag}
              </span>
            ))}
            {log.tags.length > 4 && (
              <span
                className={
                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                }
              >
                +{log.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          {log.problem}
        </p>

        <div
          className={`text-xs border-t pt-2 flex justify-between items-center ${
            theme === "dark"
              ? "text-gray-500 border-gray-700"
              : "text-gray-600 border-gray-300"
          }`}
        >
          <span>Created on: {new Date(log.createdAt).toLocaleDateString()}</span>
          {log.updatedAt && log.updatedAt !== log.createdAt && (
            <span className="text-yellow-500">Updated</span>
          )}
        </div>
      </Link>
    </li>
  );

  // ---------------- Date Filter Modal ----------------
  const DateFilterModal = ({ dateFilter, setDateFilter, fetchLogs, close }) => {
    const handleChange = (e) => {
      const { name, value } = e.target;
      setDateFilter((prev) => ({ ...prev, [name]: value }));
    };

    const inputClasses = `${
        theme === "dark"
            ? "bg-gray-700 text-gray-100 border-gray-600"
            : "bg-gray-100 text-gray-900 border-gray-300"
    }`;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div
          className={`p-6 rounded-xl w-full max-w-md shadow-2xl border ${
            theme === "dark"
              ? "bg-gray-800 border-blue-500 text-gray-100"
              : "bg-white border-blue-600 text-gray-900"
          }`}
        >
          <h3
            className={`text-xl font-bold mb-4 border-b pb-2 ${
              theme === "dark"
                ? "text-blue-400 border-gray-700"
                : "text-blue-600 border-gray-300"
            }`}
          >
            Advanced Date Filtering
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label
                  className={`text-sm mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Date Between (Start):
                </label>
                <input
                  type="date"
                  name="betweenStart"
                  value={dateFilter.betweenStart}
                  onChange={handleChange}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
              <div className="flex flex-col">
                <label
                  className={`text-sm mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Date Between (End):
                </label>
                <input
                  type="date"
                  name="betweenEnd"
                  value={dateFilter.betweenEnd}
                  onChange={handleChange}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
            <div className={`flex gap-4 border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
              <div className="flex flex-col w-1/2">
                <label
                  className={`text-sm mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Before Date:
                </label>
                <input
                  type="date"
                  name="beforeDate"
                  value={dateFilter.beforeDate}
                  onChange={handleChange}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
              <div className="flex flex-col w-1/2">
                <label
                  className={`text-sm mb-1 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  After Date:
                </label>
                <input
                  type="date"
                  name="afterDate"
                  value={dateFilter.afterDate}
                  onChange={handleChange}
                  className={`px-3 py-2 rounded-lg border ${inputClasses}`}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setDateFilter({ betweenStart: "", betweenEnd: "", beforeDate: "", afterDate: "" });
                close();
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                theme === "dark"
                  ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Clear Filters
            </button>
            <button
              onClick={() => {
                fetchLogs(0);
                close();
              }}
              className={`px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500`}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------- Pagination Button ----------------
  const PaginationButton = ({ children, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-md mx-1 font-medium transition-colors ${
        disabled
          ? theme === "dark"
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-500"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div
      className={`min-h-screen p-4 pt-20 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-4xl font-extrabold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Your Logs
        </h1>
        <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
          Total Entries: {pageInfo.totalElements}
        </p>

        {errorMessage && (
          <div
            className={`p-3 rounded-lg mb-4 text-center text-sm font-medium border ${
              theme === "dark"
                ? "bg-red-900 text-red-300 border-red-700"
                : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            {errorMessage}
          </div>
        )}

        {/* Search & Filter Panel */}
        <div
          className={`p-4 rounded-xl shadow-lg mb-8 border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input (Keyword/Tag) */}
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder={`Search by ${isSearchingByTag ? "Tag" : "Keyword"}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors border pr-32 ${
                  theme === "dark"
                    ? "bg-gray-700 text-gray-100 border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSearchingByTag(!isSearchingByTag)}
                className={`absolute right-16 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold rounded transition-colors ${
                  isSearchingByTag
                    ? "bg-blue-600 text-white"
                    : theme === "dark" ? "bg-gray-600 text-blue-400" : "bg-gray-300 text-blue-700"
                }`}
              >
                {isSearchingByTag ? "TAG" : "KEY"}
              </button>
              <button
                onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-blue-400 hover:bg-gray-700 transition-colors"
                title="Advanced Filters"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V16a1 1 0 01-1.447.894l-2-1A1 1 0 018 16v-4.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
              </button>
            </div>

            {/* Sort Controls */}
            <select
              value={pageInfo.sort}
              onChange={(e) => fetchLogs(0, pageInfo.size, e.target.value)}
              className={`px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors border ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-100 border-gray-600 appearance-none"
                  : "bg-white text-gray-900 border-gray-300 appearance-none"
              }`}
            >
              <option value="createdAt,desc">Sort: Newest First</option>
              <option value="createdAt,asc">Sort: Oldest First</option>
              <option value="title,asc">Sort: Title A-Z</option>
            </select>

            {/* Page Size Controls */}
            <select
              value={pageInfo.size}
              onChange={(e) => fetchLogs(0, Number(e.target.value), pageInfo.sort)}
              className={`px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition-colors border ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-100 border-gray-600 appearance-none"
                  : "bg-white text-gray-900 border-gray-300 appearance-none"
              }`}
            >
              <option value={5}>Show 5 per page</option>
              <option value={10}>Show 10 per page</option>
              <option value={20}>Show 20 per page</option>
            </select>
          </div>
        </div>

        {/* Date Filter Modal */}
        {isFilterModalOpen && (
          <DateFilterModal
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            fetchLogs={fetchLogs}
            close={() => setIsFilterModalOpen(false)}
          />
        )}

        {/* Logs List & Pagination */}
        {loading ? (
          <p className="text-blue-400 text-center text-lg mt-10">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
            No logs found matching your criteria. Try creating one! 🚀
          </p>
        ) : (
          <>
            <ul className="list-none p-0">
              {logs.map((log) => (
                <LogCard key={log.id} log={log} />
              ))}
            </ul>

            {pageInfo.totalPages > 1 && (
              <div
                className={`flex justify-between items-center mt-6 p-4 rounded-xl shadow-lg border ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-center items-center mx-auto">
                  <PaginationButton
                    disabled={pageInfo.number === 0}
                    onClick={() => fetchLogs(pageInfo.number - 1)}
                  >
                    &larr; Prev
                  </PaginationButton>

                  <div className="flex mx-2 space-x-1">
                    {Array.from({ length: pageInfo.totalPages }, (_, i) => i)
                      .filter(
                        (i) => i >= pageInfo.number - 1 && i <= pageInfo.number + 1 && i < pageInfo.totalPages
                      )
                      .map((i) => (
                        <PaginationButton key={i} onClick={() => fetchLogs(i)} disabled={i === pageInfo.number}>
                          {i + 1}
                        </PaginationButton>
                      ))}
                  </div>

                  <PaginationButton
                    disabled={pageInfo.number + 1 >= pageInfo.totalPages}
                    onClick={() => fetchLogs(pageInfo.number + 1)}
                  >
                    Next &rarr;
                  </PaginationButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default LogsList;