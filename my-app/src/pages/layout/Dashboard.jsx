import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    draftDocuments: 0,
    pendingDocuments: 0,
    recentDocuments: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username") || "admin";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `http://localhost:8080/api/dashboard?requesterUsername=${encodeURIComponent(username)}`
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Неуспешно зареждане на dashboard данните");
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message || "Грешка при зареждане");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [username]);

  if (loading) return <div className="dashboard-page">Loading dashboard...</div>;
  if (error) return <div className="dashboard-page" style={{ color: "red" }}>{error}</div>;

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="stat-card">
          <h3>Documents</h3>
          <p>{stats.totalDocuments}</p>
        </div>

        <div className="stat-card">
          <h3>Approved</h3>
          <p>{stats.approvedDocuments}</p>
        </div>

        <div className="stat-card">
          <h3>Rejected</h3>
          <p>{stats.rejectedDocuments}</p>
        </div>

        <div className="stat-card">
          <h3>Draft</h3>
          <p>{stats.draftDocuments}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Review</h3>
          <p>{stats.pendingDocuments}</p>
        </div>
      </div>

      <div className="recent-docs">
        <h3>Recent Documents</h3>

        {stats.recentDocuments.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentDocuments.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.status}</td>
                  <td>{doc.author}</td>
                  <td>{doc.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}