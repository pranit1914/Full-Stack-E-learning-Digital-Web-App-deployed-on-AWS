import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./aitutor.css";

const AiTutor = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async (event) => {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/ai/ask`,
        { question },
        { headers: { token: localStorage.getItem("token") } },
      );
      setAnswer(data.answer);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to reach the AI tutor",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ai-tutor-page">
      <section className="ai-tutor-panel">
        <p className="ai-tutor-label">LEARNING ASSISTANT</p>
        <h1>Ask your AI tutor</h1>
        <p className="ai-tutor-intro">
          Bring a concept, exercise, or confusing lesson. Get a clear
          explanation and a useful next step.
        </p>
        <form onSubmit={askQuestion}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What are you stuck on?"
            maxLength={2000}
            rows={5}
          />
          <button
            className="common-btn"
            type="submit"
            disabled={loading || !question.trim()}
          >
            {loading ? "Thinking..." : "Explain this"}
          </button>
        </form>
        {answer && (
          <div className="ai-answer">
            <h2>Tutor response</h2>
            <p>{answer}</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default AiTutor;
