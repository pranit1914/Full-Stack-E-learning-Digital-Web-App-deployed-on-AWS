import { useEffect, useState } from "react";
import {
  MdAccessTime,
  MdCheckCircle,
  MdInsights,
  MdQuiz,
} from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import "./dashboard.css";

const formatTime = (seconds) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState({ courseId: "", topic: "", score: "" });
  const [saving, setSaving] = useState(false);

  const fetchAnalytics = async () => {
    const { data } = await axios.get(`${server}/api/user/analytics`, {
      headers: { token: localStorage.getItem("token") },
    });
    setAnalytics(data.analytics);
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        await fetchAnalytics();
      } catch {
        setAnalytics({
          courses: [],
          totalWatchedSeconds: 0,
          averageQuizScore: 0,
          weakTopics: [],
        });
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const submitQuiz = async (event) => {
    event.preventDefault();
    if (!quiz.courseId || !quiz.topic || quiz.score === "") return;
    setSaving(true);
    try {
      await axios.post(
        `${server}/api/user/analytics/events`,
        {
          courseId: quiz.courseId,
          quiz: { topic: quiz.topic, score: Number(quiz.score) },
        },
        { headers: { token: localStorage.getItem("token") } },
      );
      setQuiz({ courseId: "", topic: "", score: "" });
      await fetchAnalytics();
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  const totalCompleted = analytics.courses.reduce(
    (sum, item) => sum + item.completedLectures,
    0,
  );
  const totalLectures = analytics.courses.reduce(
    (sum, item) => sum + item.totalLectures,
    0,
  );

  return (
    <main className="learning-dashboard">
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">LEARNING PULSE</p>
          <h1>Keep your momentum, {user?.name?.split(" ")[0] || "learner"}.</h1>
          <p>
            One clear view of what you watched, practiced, and still need to
            revisit.
          </p>
        </div>
        <MdInsights className="intro-mark" aria-hidden="true" />
      </section>

      <section className="metric-grid" aria-label="Learning summary">
        <article>
          <MdAccessTime />
          <span>
            <strong>{formatTime(analytics.totalWatchedSeconds)}</strong>
            <small>Video time</small>
          </span>
        </article>
        <article>
          <MdCheckCircle />
          <span>
            <strong>
              {totalLectures
                ? Math.round((totalCompleted / totalLectures) * 100)
                : 0}
              %
            </strong>
            <small>Course completion</small>
          </span>
        </article>
        <article>
          <MdQuiz />
          <span>
            <strong>{analytics.averageQuizScore}%</strong>
            <small>Average quiz score</small>
          </span>
        </article>
      </section>

      <div className="dashboard-columns">
        <section className="dashboard-section course-progress">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR LIBRARY</p>
              <h2>Course progress</h2>
            </div>
            <span>{analytics.courses.length} enrolled</span>
          </div>
          {analytics.courses.length ? (
            analytics.courses.map((item) => {
              const progress = item.totalLectures
                ? Math.round(
                    (item.completedLectures / item.totalLectures) * 100,
                  )
                : 0;
              return (
                <article className="course-row" key={item.course._id}>
                  <div className="course-row-top">
                    <div>
                      <h3>{item.course.title}</h3>
                      <p>
                        {item.completedLectures} of {item.totalLectures} lessons
                        complete · {formatTime(item.watchedSeconds)} watched
                      </p>
                    </div>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate(`/course/study/${item.course._id}`)}
                  >
                    Continue learning <span aria-hidden="true">→</span>
                  </button>
                </article>
              );
            })
          ) : (
            <p className="empty-state">
              Purchase a course to start building your learning history.
            </p>
          )}
        </section>

        <aside className="dashboard-section weak-topics">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SMART REVIEW</p>
              <h2>Weak topics</h2>
            </div>
          </div>
          {analytics.weakTopics.length ? (
            analytics.weakTopics.map((topic) => (
              <div className="topic-row" key={topic.topic}>
                <div>
                  <strong>{topic.topic}</strong>
                  <span>Needs another pass</span>
                </div>
                <b>{topic.score}%</b>
              </div>
            ))
          ) : (
            <p className="empty-state">
              Add quiz results to see topics worth revisiting.
            </p>
          )}
        </aside>
      </div>

      <section className="dashboard-section quiz-entry">
        <div>
          <p className="eyebrow">QUIZ CHECK-IN</p>
          <h2>Log a quiz result</h2>
          <p>
            Keep your topic-level scores honest and make the review list useful.
          </p>
        </div>
        <form onSubmit={submitQuiz}>
          <select
            value={quiz.courseId}
            onChange={(event) =>
              setQuiz({ ...quiz, courseId: event.target.value })
            }
            required
          >
            <option value="">Choose a course</option>
            {analytics.courses.map((item) => (
              <option value={item.course._id} key={item.course._id}>
                {item.course.title}
              </option>
            ))}
          </select>
          <input
            value={quiz.topic}
            onChange={(event) =>
              setQuiz({ ...quiz, topic: event.target.value })
            }
            placeholder="Topic"
            required
          />
          <input
            type="number"
            min="0"
            max="100"
            value={quiz.score}
            onChange={(event) =>
              setQuiz({ ...quiz, score: event.target.value })
            }
            placeholder="Score %"
            required
          />
          <button className="common-btn" disabled={saving}>
            {saving ? "Saving..." : "Save result"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Dashboard;
