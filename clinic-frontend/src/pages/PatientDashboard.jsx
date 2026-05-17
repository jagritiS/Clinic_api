import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, useNavigate } from "react-router-dom";

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [success, setSuccess] = useState("");


  const navigate = useNavigate();

  // Fetch appointments
  useEffect(() => {
    API.get("clinic/appointments/")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.log(err));
  }, []);

  // Fetch profile
  useEffect(() => {
    API.get("clinic/patient/profile/")
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(() => setError("Could not load profile"))
      .finally(() => setLoadingProfile(false));
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.patch("clinic/patient/profile/", form);
      setProfile(res.data);
      setForm(res.data);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditMode(false);
  };

  //appoinment cancel update
  const patientStatus = {
    upcoming:  ["pending", "approved"],
    completed: ["completed"],
    cancelled: ["cancelled"],
  };
 const filtered = appointments.filter((a) => {
    if (activeTab === "all") return true;
    return patientStatus[activeTab].includes(a.status);
  });

  const countTab = (tab) => {
    if (tab === "all") return appointments.length;
    return appointments.filter((a) =>
      patientStatus[tab].includes(a.status)
    ).length;
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.patch(`clinic/appointments/${id}/`, { status: "cancelled" });
      const res = await API.get("clinic/appointments/");
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Patient Dashboard</h2>
          <p className="text-muted mb-0">
            Welcome back, {profile?.first_name || profile?.username}
          </p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Profile Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Profile</h5>
          {!editMode && !loadingProfile && (
            <button
              className="btn btn-light btn-sm"
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          )}
        </div>

        <div className="card-body">
          {loadingProfile ? (
            <p>Loading profile...</p>
          ) : !editMode ? (
            <>
              {/* Personal Information */}
              <h6 className="text-primary mb-3">Personal Information</h6>
              <div className="table-responsive mb-4">
                <table className="table table-bordered table-striped align-middle">
                  <tbody>
                    <tr>
                      <th width="30%">Username</th>
                      <td>{profile?.username || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>First Name</th>
                      <td>{profile?.first_name || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Last Name</th>
                      <td>{profile?.last_name || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{profile?.email || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Phone</th>
                      <td>{profile?.phone || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Age</th>
                      <td>{profile?.age || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Gender</th>
                      <td>{profile?.gender || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Address</th>
                      <td>{profile?.address || "Not set"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Health Information */}
              <h6 className="text-primary mb-3">Health Information</h6>
              <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                  <tbody>
                    <tr>
                      <th width="30%">Blood Group</th>
                      <td>{profile?.blood_group || "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Height</th>
                      <td>{profile?.height ? `${profile.height} cm` : "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Weight</th>
                      <td>{profile?.weight ? `${profile.weight} kg` : "Not set"}</td>
                    </tr>
                    <tr>
                      <th>Medical Conditions</th>
                      <td>{profile?.medical_conditions || "Not set"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={form.first_name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={form.last_name || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={form.email || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    name="age"
                    value={form.age || ""}
                    onChange={handleChange}
                  />
                </div>

                {/* FIX: values are lowercase to match model GENDER_CHOICES */}
                <div className="col-md-4 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-select"
                    name="blood_group"
                    value={form.blood_group || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="height"
                    value={form.height || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="weight"
                    value={form.weight || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Address</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    name="address"
                    value={form.address || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Medical Conditions</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="medical_conditions"
                    value={form.medical_conditions || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Appointments */}
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Your Appointments</h5>
          <Link to="/book-appointment" className="btn btn-light btn-sm">
            Book
          </Link>
        </div>

        <div className="card-body">
            <div className="d-flex gap-2 mb-3 flex-wrap">
            {[
              { label: "All",       value: "all"       },
              { label: "Upcoming",  value: "upcoming"  },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ].map((tab) => (
              <button
                key={tab.value}
                className={`btn btn-sm ${
                  activeTab === tab.value
                    ? "btn-primary"
                    : "btn-outline-primary"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
               {tab.label}{" "}
                <span className="badge bg-white text-primary ms-1">
                  {countTab(tab.value)}
                </span>
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted">No {activeTab} appointments yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>#</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, index) => (
                    <tr key={a.id}>
                      <td>{index + 1}</td>
                      <td>{a.doctor_name || a.doctor}</td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                       <td>
                        <span className={`badge ${
                          a.status === "completed" ? "bg-success" :
                          a.status === "cancelled" ? "bg-danger"  :
                          a.status === "approved"  ? "bg-primary" :
                          a.status === "rejected"  ? "bg-dark"    :
                          "bg-warning text-dark"
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td>
                        {["pending", "approved"].includes(a.status) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleCancel(a.id)}
                          >
                            Cancel
                          </button>
                        )}
                        {a.status === "completed" && (
                          <span className="text-success fw-semibold">✓ Done</span>
                        )}
                        {a.status === "cancelled" && (
                          <span className="text-danger fw-semibold">✗ Cancelled</span>
                        )}
                        {a.status === "rejected" && (
                          <span className="text-dark fw-semibold">✗ Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;