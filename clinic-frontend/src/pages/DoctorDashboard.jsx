import { useEffect, useState } from "react";
import API, { getAppointmentStats } from "../services/api";
import AppointmentTable from "../components/appointments/AppointmentTable";
import AvailabilityManager from "../components/availability/AvailabilityManager";
import { useAuth } from "../components/AuthManager";
import { Link } from "react-router-dom";

function StatCard({ label, value, color, icon }) {
  const colors = {
    blue: { bg: "#e8f4fd", border: "#3498db", text: "#2980b9" },
    green: { bg: "#e8f8f0", border: "#2ecc71", text: "#27ae60" },
    orange: { bg: "#fef5e7", border: "#f39c12", text: "#e67e22" },
    red: { bg: "#fdf0ef", border: "#e74c3c", text: "#c0392b" },
    purple: { bg: "#f4f0fb", border: "#9b59b6", text: "#8e44ad" },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="col-6 col-md-4 col-lg-2">
      <div className="card border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${c.border}`, background: c.bg }}>
        <div className="card-body text-center py-3 px-2">
          <div style={{ fontSize: "1.4rem" }}>{icon}</div>
          <div className="fw-bold" style={{ fontSize: "1.6rem", color: c.text }}>{value ?? "—"}</div>
          <div className="text-muted small">{label}</div>
        </div>
      </div>
    </div>
  );
}

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("appointments");
  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchAppointments();
    fetchStats();
  }, []);

  const fetchProfile = () => {
    API.get("profile/")
      .then((res) => setProfile(res.data))
      .catch((err) => console.log(err));
  };

  const fetchAppointments = () => {
    API.get("clinic/appointment/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.log(err));
  };

  const fetchStats = () => {
    getAppointmentStats()
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Failed to fetch stats", err));
  };

  const handleUpdateStatus = (id, status) => {
    API.patch(`clinic/appointment/${id}/`, { status })
      .then(() => {
        fetchAppointments();
        fetchStats();
      })
      .catch(err => console.error("Update status failed", err));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="mb-0">Doctor Dashboard</h2>
          {profile && <p className="text-muted mb-0">Dr. {profile.username}, welcome to your workspace.</p>}
        </div>
        <button onClick={logout} className="btn btn-outline-danger">Logout</button>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body py-3">
              <h5 className="card-title"><i className="bi bi-person-badge me-2"></i>Professional Profile</h5>
              <Link to="/profile" className="text-decoration-none">Edit Profile &rarr;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="row g-3 mb-4">
          <StatCard label="Total" value={stats.total} color="blue" icon="📋" />
          <StatCard label="Today" value={stats.today} color="purple" icon="📅" />
          <StatCard label="Pending" value={stats.pending} color="orange" icon="⏳" />
          <StatCard label="Approved" value={stats.approved} color="green" icon="✅" />
          <StatCard label="Completed" value={stats.completed} color="blue" icon="🏁" />
          <StatCard label="Cancelled" value={stats.cancelled} color="red" icon="❌" />
        </div>
      )}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "appointments" ? "active fw-semibold" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            📋 Appointments
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "availability" ? "active fw-semibold" : ""}`}
            onClick={() => setActiveTab("availability")}
          >
            🗓️ My Availability
          </button>
        </li>
      </ul>

      {activeTab === "appointments" && (
        <>
          <h4 className="mb-3">Assigned Appointments</h4>
          <AppointmentTable
            appointments={appointments}
            onUpdateStatus={handleUpdateStatus}
            role="doctor"
          />
        </>
      )}

      {activeTab === "availability" && <AvailabilityManager />}
    </div>
  );
}

export default DoctorDashboard;