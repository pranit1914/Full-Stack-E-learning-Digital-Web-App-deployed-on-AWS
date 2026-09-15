import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { mediaUrl, server } from "../../main";
import Loading from "../../components/loading/Loading";
import "./study.css";

const Study = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [selected, setSelected] = useState(null);
  const lastReported = useRef(0);

  useEffect(() => {
    const load = async () => {
      const headers = { token: localStorage.getItem("token") };
      const [courseResponse, lectureResponse] = await Promise.all([
        axios.get(`${server}/api/course/${id}`),
        axios.get(`${server}/api/course/${id}/lectures`, { headers }),
      ]);
      setCourse(courseResponse.data.course);
      setLectures(lectureResponse.data.lectures);
      setSelected(lectureResponse.data.lectures[0] || null);
    };
    load();
  }, [id]);

  const report = async (payload) => {
    await axios.post(
      `${server}/api/user/analytics/events`,
      { courseId: id, ...payload },
      {
        headers: { token: localStorage.getItem("token") },
      },
    );
  };

  const trackTime = (event) => {
    const seconds = Math.floor(event.currentTarget.currentTime);
    if (seconds - lastReported.current >= 10) {
      lastReported.current = seconds;
      report({ lectureId: selected._id, watchedSeconds: 10 }).catch(() => {});
    }
  };

  const completeLecture = () => {
    report({ courseId: id, lectureId: selected._id, completed: true }).catch(
      () => {},
    );
  };

  if (!course) return <Loading />;

  return (
    <main className="study-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        ← Back to dashboard
      </button>
      <div className="study-heading">
        <p className="eyebrow">NOW LEARNING</p>
        <h1>{course.title}</h1>
        <p>
          {lectures.length} lessons · Your video progress is saved
          automatically.
        </p>
      </div>
      <div className="study-layout">
        <section className="video-panel">
          {selected ? (
            <>
              <video
                key={selected._id}
                controls
                onTimeUpdate={trackTime}
                onEnded={completeLecture}
                src={mediaUrl(selected.video)}
              />
              <p className="eyebrow">LESSON {lectures.indexOf(selected) + 1}</p>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
            </>
          ) : (
            <p className="empty-state">
              No lessons have been added to this course yet.
            </p>
          )}
        </section>
        <aside className="lesson-list">
          <p className="eyebrow">COURSE OUTLINE</p>
          {lectures.map((lecture, index) => (
            <button
              className={selected?._id === lecture._id ? "active" : ""}
              key={lecture._id}
              onClick={() => {
                setSelected(lecture);
                lastReported.current = 0;
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {lecture.title}
            </button>
          ))}
        </aside>
      </div>
    </main>
  );
};

export default Study;
