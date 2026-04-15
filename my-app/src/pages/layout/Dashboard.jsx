import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>
      <p>Welcome to your document versioning system.</p>

      <div className="stats">
        <div className="card">
          <h3>Documents</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Versions</h3>
          <p>34</p>
        </div>

        <div className="card">
          <h3>Users</h3>
          <p>5</p>
        </div>
      </div>

      <div className="actions">
        <button className="btn">Upload</button>
        <button className="btn secondary">Create</button>
      </div>

      <div className="panel">
        <h3>Recent Activity</h3>
        <ul>
          <li>Project_Spec_v3.pdf updated</li>
          <li>Report_Final.docx created</li>
          <li>Admin added new user</li>
        </ul>
      </div>
    </div>
  );
}