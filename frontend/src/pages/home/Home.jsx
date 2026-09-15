import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="home">
        <div className="home-content">
          <p className="home-kicker">LEARN WITH MOMENTUM</p>
          <h1>Build skills that move you forward.</h1>
          <p className="home-copy">
            Focused courses, practical lessons, and an AI tutor for the moments
            when a concept refuses to click.
          </p>
          <div className="home-actions">
            <button onClick={() => navigate("/courses")} className="common-btn">
              Explore courses
            </button>
            <span className="home-note">
              Learn at your pace. Grow for real.
            </span>
          </div>
        </div>
        <div className="home-orbit" aria-hidden="true">
          <span>AI</span>
          <span>01</span>
          <span>GO</span>
        </div>
      </div>
      <Testimonials />
    </div>
  );
};

export default Home;
