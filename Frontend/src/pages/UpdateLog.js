import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLogById, updateLog } from "../api/api";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { ToastContainer } from "react-toastify";
import { useTheme } from "../context/ThemeContext"; // <-- global theme

const UpdateLog = () => {
  const { isDarkMode } = useTheme(); // <-- use global theme
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [referenceLinks, setReferenceLinks] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tags, setTags] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [files, setFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const FormLabel = ({ htmlFor, label }) => (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1"
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

  useEffect(() => {
    const fetchLog = async () => {
      setLoading(true);
      try {
        const res = await getLogById(id);
        const log = res.data;

        setTitle(log.title || "");
        setProblem(log.problem || "");
        setSolution(log.solution || "");
        setReferenceLinks(log.referenceLinks?.join("\n") || "");
        setCodeSnippet(log.codeSnippet || "");
        setTags(log.tags || []);
        setExistingFiles(log.attachments || []);
      } catch (err) {
        console.error(err);
        setErrorMessage("Failed to fetch log details.");
        navigate("/logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id, navigate]);

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

  const removeNewFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    const url = existingFiles[index];
    const filename = url.substring(url.lastIndexOf("/") + 1);
    setFilesToDelete((prev) => [...prev, filename]);
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
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
        ? referenceLinks
            .split(/\n|,/)
            .map((link) => link.trim())
            .filter((link) => link.length > 0)
        : [],
      codeSnippet,
      tags,
      filesToDelete,
    };

    try {
      await updateLog(id, log, files);
      setSuccessMessage("Log updated successfully! Redirecting...");
      setLoading(false);
      setTimeout(() => navigate(`/logs/${id}`), 1500);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to update log.";
      setErrorMessage(message);
      setLoading(false);
    }
  };

  if (loading && !title)
    return (
      <div
        className={`min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900`}
      >
        <p className="text-blue-600 dark:text-blue-400 text-lg">
          Loading Log Data...
        </p>
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-20 transition-colors duration-300`}
    >
      <ToastContainer />
      <div
        className={`max-w-6xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-300 dark:border-gray-700 transition-colors duration-300`}
      >
        <h2
          className={`text-3xl font-bold mb-6 text-blue-600 dark:text-blue-400 border-b border-gray-300 dark:border-gray-700 pb-3`}
        >
          Update Log Entry
        </h2>

        {successMessage && (
          <div
            className={`bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border border-green-400 dark:border-green-600 p-3 rounded-lg mb-4 text-center font-medium`}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            className={`bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 border border-red-400 dark:border-red-600 p-3 rounded-lg mb-4 text-center font-medium`}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <FormLabel htmlFor="title" label="Title" />
            <input
              type="text"
              id="title"
              className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0">
            {/* Left column */}
            <div className="lg:w-7/12 space-y-6">
              {/* Problem */}
              <div>
                <FormLabel htmlFor="problem" label="Problem Description" />
                <textarea
                  id="problem"
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-sans"
                  rows="6"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
              </div>

              {/* Solution */}
              <div>
                <FormLabel htmlFor="solution" label="Solution/Resolution" />
                <textarea
                  id="solution"
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-sans"
                  rows="6"
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  required
                />
              </div>

              {/* Code Snippet */}
              <div>
                <FormLabel htmlFor="codeSnippet" label="Code Snippet (Optional)" />
                <textarea
                  id="codeSnippet"
                  className="w-full bg-gray-100 dark:bg-gray-900 text-green-700 dark:text-green-400 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm shadow-inner"
                  rows="8"
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="lg:w-5/12 space-y-6">
              {/* Tags */}
              <div>
                <FormLabel htmlFor="tags-input" label="Tags (Enter to add)" />
                <input
                  type="text"
                  id="tags-input"
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                  onKeyDown={handleTagInput}
                  placeholder="e.g., spring-boot, mongodb, bugfix"
                />
                <div className="mt-3 flex flex-wrap gap-2 min-h-[36px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-blue-500 dark:bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md"
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

              {/* Reference Links */}
              <div>
                <FormLabel
                  htmlFor="referenceLinks"
                  label="Reference Links (One per line or comma-separated)"
                />
                <textarea
                  id="referenceLinks"
                  className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors"
                  rows="3"
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder="One URL per line or separated by commas"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-4">
                <FormLabel htmlFor="fileInput" label="Manage Attachments" />

                {existingFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Existing attachments:
                    </p>
                    <PhotoProvider>
                      <div className="grid grid-cols-4 gap-2">
                        {existingFiles.slice(0, 4).map((file, i) => {
                          const showOverlay = i === 3 && existingFiles.length > 4;
                          return (
                            <div key={i} className="relative w-full h-20">
                              <PhotoView src={file}>
                                <img
                                  src={file}
                                  alt={`existing-${i}`}
                                  className="w-full h-full object-cover rounded-lg cursor-pointer opacity-80 hover:opacity-100 transition-opacity border border-gray-300 dark:border-gray-600"
                                />
                              </PhotoView>
                              {showOverlay && (
                                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg pointer-events-none">
                                  <span className="text-white text-lg font-bold">
                                    +{existingFiles.length - 4}
                                  </span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeExistingFile(i)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity"
                              >
                                &times;
                              </button>
                              {existingFiles.slice(4).map((file, i) => (
                                <PhotoView key={`hidden-existing-${i}`} src={file} />
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </PhotoProvider>
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full text-gray-600 dark:text-gray-400"
                />

                {files.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      New files to upload:
                    </p>
                    <PhotoProvider>
                      <div className="grid grid-cols-4 gap-2">
                        {files.slice(0, 4).map((file, i) => {
                          const previewUrl = URL.createObjectURL(file);
                          return (
                            <div key={i} className="relative w-full h-20">
                              <PhotoView src={previewUrl}>
                                <img
                                  src={previewUrl}
                                  alt={`preview-${i}`}
                                  className="w-full h-full object-cover rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
                                />
                              </PhotoView>
                              <button
                                type="button"
                                onClick={() => removeNewFile(i)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity"
                              >
                                &times;
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </PhotoProvider>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Log"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateLog;
