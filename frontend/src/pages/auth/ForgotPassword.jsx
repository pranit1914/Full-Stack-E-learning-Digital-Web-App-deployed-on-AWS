import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${server}/api/user/forgot-password`, {
        email,
      });
      setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Forgot password?</h2>
        {sent ? (
          <>
            <p>Check your inbox for a reset link. It expires in 15 minutes.</p>
            <Link to="/login">Return to login</Link>
          </>
        ) : (
          <>
            <p>
              Enter your account email and we will send you a secure reset link.
            </p>
            <form onSubmit={submitHandler}>
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <button disabled={loading} type="submit" className="common-btn">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <p>
              <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
