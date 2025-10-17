import React, { useState, useCallback } from "react";
import { createLog } from "../api/api";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // ✅ Added this

const CreateLog = () => {
  const { isDarkMode } = useTheme(); // ✅ Hook for theme awareness
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const FormLabel = ({ htmlFor, label }) => (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium mb-1 ${
        isDarkMode ? "text-gray-300" : "text-gray-700"
      }`}
    >
      {label}
    </label>
  );

  const handleTagInput = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        const newTag = e.target.value.trim().toLowerCase().replace(/,/g, "");
        if (newTag && !tags.includes(newTag)) {
          setTags((prev) => [...prev, newTag]);
        }
        e.target.value = "";
      }
    },
    [tags]
  );

  const removeTag = useCallback((tagToRemove) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const combined = [...prevFiles, ...newFiles];
      const uniqueFiles = combined.filter(
        (file, index, self) =>
          index === self.findIndex((f) => f.name === file.name)
      );
      return uniqueFiles;
    });
    e.target.value = "";
  };

  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const log = {
      title,
      problem,
      solution,
      referenceLinks: referenceLinks
        ? referenceLinks.split(",").map((link) => link.trim())
        : [],
      codeSnippet,
      tags,
    };

    try {
      const res = await createLog(log, files);
      setSuccessMessage("Log created successfully! Redirecting...");
      setLoading(false);
      setTimeout(() => navigate(`/logs/${res.data.id}`), 1500);

      setTitle("");
      setProblem("");
      setSolution("");
      setReferenceLinks("");
      setCodeSnippet("");
      setTags([]);
      setFiles([]);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to create log.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-4 pt-20 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto p-6 md:p-8 rounded-xl shadow-2xl border transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2
          className={`text-3xl font-bold mb-6 border-b pb-3 ${
            isDarkMode
              ? "text-blue-400 border-gray-700"
              : "text-blue-600 border-gray-200"
          }`}
        >
          Create New Log Entry
        </h2>

        {successMessage && (
          <div
            className={`border p-3 rounded-lg mb-4 text-center font-medium ${
              isDarkMode
                ? "bg-green-800 text-green-200 border-green-600"
                : "bg-green-100 text-green-700 border-green-400"
            }`}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            className={`border p-3 rounded-lg mb-4 text-center font-medium ${
              isDarkMode
                ? "bg-red-800 text-red-300 border-red-600"
                : "bg-red-100 text-red-700 border-red-400"
            }`}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE */}
          <div>
            <FormLabel htmlFor="title" label="Title" />
            <input
              type="text"
              id="title"
              className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              }`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
            {/* LEFT COLUMN */}
            <div className="lg:w-7/12 space-y-6">
              <div>
                <FormLabel htmlFor="problem" label="Problem Description" />
                <textarea
                  id="problem"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-sans ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  }`}
                  rows="6"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
              </div>

              <div>
                <FormLabel htmlFor="solution" label="Solution/Resolution" />
                <textarea
                  id="solution"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-sans ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  }`}
                  rows="6"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  required
                />
              </div>

              <div>
                <FormLabel htmlFor="codeSnippet" label="Code Snippet (Optional)" />
                <textarea
                  id="codeSnippet"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm shadow-inner ${
                    isDarkMode
                      ? "bg-gray-900 text-green-400 border-gray-700"
                      : "bg-gray-100 text-gray-800 border-gray-300"
                  }`}
                  rows="8"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:w-5/12 space-y-6">
              <div>
                <FormLabel htmlFor="tags-input" label="Tags (Enter to add)" />
                <input
                  type="text"
                  id="tags-input"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  }`}
                  onKeyDown={handleTagInput}
                  placeholder="e.g., spring-boot, mongodb, bugfix"
                />
                <div className="mt-3 flex flex-wrap gap-2 min-h-[36px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-white hover:text-gray-200 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <FormLabel
                  htmlFor="referenceLinks"
                  label="Reference Links (One per line or comma-separated)"
                />
                <textarea
                  id="referenceLinks"
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100 border-gray-600"
                      : "bg-gray-100 text-gray-900 border-gray-300"
                  }`}
                  rows="3"
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder="One URL per line or separated by commas"
                />
              </div>

              <div>
                <FormLabel
                  htmlFor="fileInput"
                  label="Attach Files (Screenshots, Diagrams)"
                />
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className={`w-full ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                  style={{ paddingLeft: 0 }}
                />

                {files.length > 0 && (
                  <div className="mt-4">
                    <p
                      className={`text-sm mb-2 ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {files.length} {files.length === 1 ? "file" : "files"} ready to
                      upload.
                    </p>
                    <PhotoProvider
                      overlayRender={({ index }) => (
                        <div className="text-white text-center">
                          {index + 1} / {files.length}
                        </div>
                      )}
                    >
                      <div className="grid grid-cols-4 gap-2" style={{ maxWidth: "300px" }}>
                        {files.slice(0, 4).map((file, i) => {
                          const previewUrl = URL.createObjectURL(file);
                          const showOverlay = i === 3 && files.length > 4;

                          return (
                            <div key={i} className="relative w-full h-20">
                              <PhotoView src={previewUrl}>
                                <img
                                  src={previewUrl}
                                  alt={`preview-${i}`}
                                  className="w-full h-full object-cover rounded-lg cursor-pointer transition-transform hover:scale-105 border border-gray-300 dark:border-gray-600"
                                />
                              </PhotoView>

                              {showOverlay && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg pointer-events-none">
                                  <span className="text-white text-lg font-bold">
                                    +{files.length - 4}
                                  </span>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity"
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                        {files.slice(4).map((file, i) => (
                          <PhotoView
                            key={`hidden-${i}`}
                            src={URL.createObjectURL(file)}
                          />
                        ))}
                      </div>
                    </PhotoProvider>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating Log..." : "Create Log"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateLog;
