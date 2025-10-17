import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLogById, deleteLog } from "../api/api";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "../context/ThemeContext";

// CodeBlock component
const CodeBlock = ({ code, theme }) => (
  <pre
    className={`p-4 rounded-lg overflow-x-auto shadow-inner border ${
      theme === "dark"
        ? "bg-gray-900 text-green-400 border-gray-700"
        : "bg-gray-100 text-green-800 border-gray-300"
    }`}
    style={{
      fontFamily: "monospace",
      fontSize: "14px",
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }}
  >
    <code>{code}</code>
  </pre>
);

const LogDetails = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? "dark" : "light";
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await getLogById(id);
        setLog(res.data);
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message || "Log not found or unauthorized."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteLog(id);
      navigate("/logs");
    } catch (err) {
      setErrorMessage("Failed to delete log.");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <p
          className={
            theme === "dark" ? "text-blue-400 text-lg" : "text-blue-600 text-lg"
          }
        >
          Loading Log Details...
        </p>
      </div>
    );

  if (errorMessage)
    return (
      <div
        className={`min-h-screen p-4 pt-20 flex justify-center ${
          theme === "dark"
            ? "bg-gray-900 text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <div
          className={`p-6 rounded-xl w-full max-w-xl text-center border ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h1
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-red-500" : "text-red-600"
            }`}
          >
            Error
          </h1>
          <p
            className={theme === "dark" ? "text-gray-400" : "text-gray-600"}
          >
            {errorMessage}
          </p>
          <button
            onClick={() => navigate("/logs")}
            className={`mt-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
              theme === "dark"
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            Go to Logs List
          </button>
        </div>
      </div>
    );

  if (!log) return null;

  const allImages = log.attachments || [];
  const visibleImages = allImages.slice(0, 4);
  const extraImages = allImages.length - 4;

  return (
    <div
      className={`${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      } min-h-screen p-4 pt-20`}
    >
      <div
        className={`max-w-3xl mx-auto p-8 rounded-xl shadow-2xl border space-y-10 ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* HEADER */}
        <header
          className={`pb-5 flex justify-between items-start border-b ${
            theme === "dark" ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <div>
            <h1
              className={`text-3xl font-bold mb-1 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {log.title}
            </h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Created on {format(new Date(log.createdAt), "PPP")}
            </p>
          </div>
          <div className="flex gap-4 mt-1">
            <Edit2
              className={`cursor-pointer ${
                theme === "dark"
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-500"
              }`}
              size={22}
              onClick={() => navigate(`/logs/update/${log.id}`)}
              title="Edit Log"
            />
            <Trash2
              className="cursor-pointer text-red-500 hover:text-red-400"
              size={22}
              onClick={() => setShowConfirm(true)}
              title="Delete Log"
            />
          </div>
        </header>

        {/* PROBLEM */}
        <section>
          <h2
            className={`text-xl font-semibold mb-2 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Problem
          </h2>
          <p
            className={`leading-relaxed whitespace-pre-line ${
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            }`}
          >
            {log.problem}
          </p>
        </section>

        {/* SOLUTION */}
        <section>
          <h2
            className={`text-xl font-semibold mb-2 ${
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Solution
          </h2>
          <p
            className={`leading-relaxed whitespace-pre-line ${
              theme === "dark" ? "text-gray-300" : "text-gray-800"
            }`}
          >
            {log.solution}
          </p>
        </section>

        {/* CODE SNIPPET */}
        {log.codeSnippet && (
          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Code Snippet
            </h2>
            <CodeBlock code={log.codeSnippet} theme={theme} />
          </section>
        )}

        {/* TAGS */}
        {log.tags?.length > 0 && (
          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {log.tags.map((tag, i) => (
                <span
                  key={i}
                  className={`rounded-full px-3 py-1 text-sm font-medium shadow-md ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-200 text-blue-800"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* REFERENCES */}
        {log.referenceLinks?.length > 0 && (
          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              References
            </h2>
            <ul
              className={`space-y-1 list-disc list-inside ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {log.referenceLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className={`break-all ${
                      theme === "dark"
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-blue-600 hover:text-blue-500"
                    }`}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ATTACHMENTS */}
        {allImages.length > 0 && (
          <section>
            <h2
              className={`text-xl font-semibold mb-3 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Attachments
            </h2>
            <PhotoProvider>
              <div className="flex flex-col sm:flex-row gap-3">
                {visibleImages.map((img, i) => (
                  <div key={i} className="relative w-32 h-32 flex-shrink-0">
                    <PhotoView src={img}>
                      <img
                        src={img}
                        alt={`attachment-${i}`}
                        className={`w-full h-full object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 ${
                          theme === "dark"
                            ? "border border-gray-600"
                            : "border border-gray-300"
                        }`}
                      />
                    </PhotoView>

                    {i === 3 && extraImages > 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg pointer-events-none">
                        <span className="text-white text-lg font-bold">
                          +{extraImages}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {allImages.slice(4).map((img, i) => (
                  <PhotoView key={`hidden-${i}`} src={img} />
                ))}
              </div>
            </PhotoProvider>
          </section>
        )}
      </div>

      {/* DELETE CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-70">
          <div
            className={`p-8 rounded-xl text-center shadow-2xl max-w-sm border ${
              theme === "dark"
                ? "bg-gray-700 border-gray-600"
                : "bg-white border-gray-200"
            }`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-red-400" : "text-red-600"
              }`}
            >
              Confirm Deletion
            </h3>
            <p
              className={
                theme === "dark"
                  ? "text-gray-300 mb-6"
                  : "text-gray-700 mb-6"
              }
            >
              Are you sure you want to permanently delete this log entry?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  theme === "dark"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  theme === "dark"
                    ? "bg-gray-500 text-white hover:bg-gray-400"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogDetails;
