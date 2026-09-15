import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./auth.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/user/reset-password/${token}`,
        { password },
      );
      toast.success(data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Choose a new password</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            minLength="6"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <label htmlFor="confirm-password">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            minLength="6"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          <button disabled={loading} type="submit" className="common-btn">
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>
        <p>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
