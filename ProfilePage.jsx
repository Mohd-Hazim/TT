import React, { useEffect, useState } from "react";
import { getUserProfile, updateProfile, logout } from "../api";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");

  // Load profile on mount
  useEffect(() => {
    getUserProfile()
      .then((res) => {
        const user = res.user;
        setProfile(user);
        setNewName(user.name);
      })
      .catch(() => {
        logout();
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  // Save updated name
  const handleSave = () => {
    updateProfile({ name: newName })
      .then((res) => {
        setProfile(res.user);
        setEditMode(false);
        alert("Profile updated!");
      })
      .catch(() => alert("Failed to update profile"));
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile</h1>

      <p>
        <strong>Email:</strong> {profile.email}
      </p>

      {editMode ? (
        <div>
          <label>New Name:</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              display: "block",
              padding: "8px",
              marginTop: "5px",
              marginBottom: "10px",
              width: "250px",
            }}
          />
          <button onClick={handleSave} style={{ marginRight: 10 }}>
            Save
          </button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <p>
          <strong>Name:</strong> {profile.name}
          <button
            onClick={() => setEditMode(true)}
            style={{ marginLeft: "10px" }}
          >
            Edit
          </button>
        </p>
      )}

      <hr style={{ margin: "20px 0" }} />

      <button
        onClick={handleLogout}
        style={{
          background: "#e63946",
          padding: "10px 20px",
          border: "none",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}
