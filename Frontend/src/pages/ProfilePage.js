import React, { useState, useEffect } from "react";
import { getMyProfile, updateMyProfile, getAllLogs } from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaCheck, FaUserCircle } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext"; // ✅ use global theme

function ProfilePage() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); // get current theme
  const theme = isDarkMode ? "dark" : "light";

  const [profile, setProfile] = useState({});
  const [logCount, setLogCount] = useState(0);
  const [isEditing, setIsEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const RoleOptions = [
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Project Manager",
    "Other",
  ];

  const FormLabel = ({ htmlFor, label }) => (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium mb-1 ${
        theme === "dark" ? "text-gray-400" : "text-gray-600"
      }`}
    >
      {label}
    </label>
  );

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      const profileRes = await getMyProfile();
      const data = profileRes.data;
      setProfile(data);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        role: data.role || RoleOptions[0],
      });

      const statsRes = await getAllLogs(0, 1);
      setLogCount(statsRes.data.totalElements || 0);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to load profile.";
      setErrorMessage(message);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSave = async (fieldName) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const res = await updateMyProfile(formData);
      setProfile(res.data);
      setIsEditing({ ...isEditing, [fieldName]: false });
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update profile.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        className={`min-h-screen flex justify-center items-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <p className={theme === "dark" ? "text-blue-400" : "text-blue-600 text-lg"}>
          Loading Profile...
        </p>
      </div>
    );

  return (
    <div
      className={`min-h-screen p-4 pt-20 ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div
        className={`max-w-3xl mx-auto p-8 rounded-xl shadow-lg border ${
          theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center mb-6 space-x-4">
          <FaUserCircle
            className={theme === "dark" ? "text-blue-400 w-14 h-14" : "text-blue-600 w-14 h-14"}
          />
          <div>
            <p className={theme === "dark" ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
              Username
            </p>
            <p
              className={
                theme === "dark"
                  ? "text-white font-bold text-xl"
                  : "text-gray-900 font-bold text-xl"
              }
            >
              {profile.username}
            </p>
          </div>
        </div>

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
        {successMessage && (
          <div
            className={`p-3 rounded-lg mb-4 text-center text-sm font-medium border ${
              theme === "dark"
                ? "bg-green-900 text-green-300 border-green-700"
                : "bg-green-100 text-green-700 border-green-200"
            }`}
          >
            {successMessage}
          </div>
        )}

        {/* Editable Fields */}
        <EditableField
          label="Name"
          name="name"
          value={formData.name}
          isEditing={isEditing.name}
          onEditClick={() => setIsEditing({ ...isEditing, name: true })}
          onSaveClick={() => handleSave("name")}
          onChange={handleEditChange}
          FormLabel={FormLabel}
          theme={theme}
        />

        <EditableField
          label="Email"
          name="email"
          value={formData.email}
          isEditing={isEditing.email}
          onEditClick={() => setIsEditing({ ...isEditing, email: true })}
          onSaveClick={() => handleSave("email")}
          onChange={handleEditChange}
          FormLabel={FormLabel}
          theme={theme}
        />

        <EditableField
          label="Role"
          name="role"
          value={formData.role}
          isEditing={isEditing.role}
          onEditClick={() => setIsEditing({ ...isEditing, role: true })}
          onSaveClick={() => handleSave("role")}
          onChange={handleEditChange}
          FormLabel={FormLabel}
          isSelect
          options={RoleOptions}
          theme={theme}
        />

        {/* Total Logs */}
        <div className="mt-4">
          <FormLabel label="Total Logs" />
          <input
            value={logCount}
            disabled
            className={`w-full px-3 py-2 rounded border ${
              theme === "dark"
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

const EditableField = ({
  label,
  name,
  value,
  isEditing,
  onEditClick,
  onSaveClick,
  onChange,
  FormLabel,
  isSelect,
  options,
  theme,
}) => (
  <div className="mb-4 relative">
    {FormLabel && <FormLabel htmlFor={name} label={label} />}
    <div className="relative">
      {isEditing ? (
        <>
          {isSelect ? (
            <select
              id={name}
              name={name}
              value={value || options[0]}
              onChange={onChange}
              className={`w-full px-3 py-2 pr-10 rounded border focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              }`}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              name={name}
              value={value || ""}
              onChange={onChange}
              className={`w-full px-3 py-2 pr-10 rounded border focus:outline-none ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-100 border-gray-600"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              }`}
            />
          )}
          <button
            onClick={onSaveClick}
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${
              theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-500"
            }`}
            title="Save"
          >
            <FaCheck />
          </button>
        </>
      ) : (
        <>
          <input
            value={value || ""}
            disabled
            className={`w-full px-3 py-2 pr-10 rounded border ${
              theme === "dark"
                ? "bg-gray-700 text-gray-100 border-gray-600"
                : "bg-gray-100 text-gray-900 border-gray-300"
            }`}
          />
          {onEditClick && (
            <button
              onClick={onEditClick}
              className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm flex items-center ${
                theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
              }`}
              title="Edit"
            >
              <FaEdit />
            </button>
          )}
        </>
      )}
    </div>
  </div>
);

export default ProfilePage;
