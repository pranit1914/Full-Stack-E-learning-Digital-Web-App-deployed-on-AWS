import React from "react";
import { MdDashboard } from "react-icons/md";
import "./account.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import axios from "axios";
import { mediaUrl, server } from "../../main";

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const [about, setAbout] = React.useState(user?.about || "");
  const [experience, setExperience] = React.useState(user?.experience || "");
  const [profilePic, setProfilePic] = React.useState(null);
  const [certificate, setCertificate] = React.useState(null);
  const [certificateName, setCertificateName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  const updateProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("about", about);
    formData.append("experience", experience);
    formData.append("certificateName", certificateName);
    if (profilePic) formData.append("profilePic", profilePic);
    if (certificate) formData.append("certificate", certificate);
    try {
      const { data } = await axios.put(`${server}/api/user/profile`, formData, {
        headers: { token: localStorage.getItem("token") },
      });
      setUser(data.user);
      toast.success(data.message);
      setCertificate(null);
      setCertificateName("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {user && (
        <div className="profile">
          <h2>My Profile</h2>
          {user.profilePic && (
            <img
              className="profile-picture"
              src={mediaUrl(user.profilePic)}
              alt={`${user.name}'s profile`}
            />
          )}
          <div className="profile-info">
            <p>
              <strong>Name - {user.name}</strong>
            </p>

            <p>
              <strong>Email - {user.email}</strong>
            </p>

            <button
              onClick={() => navigate(`/${user._id}/dashboard`)}
              className="common-btn"
            >
              <MdDashboard />
              Dashboard
            </button>

            <button
              onClick={() => navigate("/ai-tutor")}
              className="common-btn"
            >
              Ask AI Tutor
            </button>

            <br />

            {user.role === "admin" && (
              <button
                onClick={() => navigate(`/admin/dashboard`)}
                className="common-btn"
              >
                <MdDashboard />
                Admin Dashboard
              </button>
            )}

            <br />

            <button
              onClick={logoutHandler}
              className="common-btn"
              style={{ background: "red" }}
            >
              <IoMdLogOut />
              Logout
            </button>

            <form className="profile-editor" onSubmit={updateProfile}>
              <h3>Personal details</h3>
              <label htmlFor="about">About me</label>
              <textarea
                id="about"
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                maxLength={1000}
                placeholder="Tell learners a little about yourself"
              />
              <label htmlFor="experience">Experience</label>
              <textarea
                id="experience"
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                maxLength={1000}
                placeholder="Share your skills and experience"
              />
              <label htmlFor="profile-pic">Profile picture</label>
              <input
                id="profile-pic"
                type="file"
                accept="image/*"
                onChange={(event) => setProfilePic(event.target.files[0])}
              />
              <label htmlFor="certificate-name">Certificate name</label>
              <input
                id="certificate-name"
                value={certificateName}
                onChange={(event) => setCertificateName(event.target.value)}
                placeholder="e.g. JavaScript Fundamentals"
              />
              <label htmlFor="certificate">Upload certificate</label>
              <input
                id="certificate"
                type="file"
                accept=".pdf,image/*"
                onChange={(event) => setCertificate(event.target.files[0])}
              />
              <button className="common-btn" disabled={saving}>
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>

            {user.certificates?.length > 0 && (
              <div className="certificates">
                <h3>Certificates</h3>
                {user.certificates.map((item) => (
                  <a
                    key={item.file}
                    href={mediaUrl(item.file)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
