import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const initialTicket = {
  employeeName: "",
  employeeId: "",
  department: "",
  category: "Laptop/Desktop",
  priority: "Medium",
  subject: "",
  description: ""
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [tickets, setTickets] = useState([]);
  const [ticketForm, setTicketForm] = useState(initialTicket);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/tickets`);

      if (!response.ok) {
        throw new Error("Unable to retrieve tickets.");
      }

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "Unable to retrieve tickets.");
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      loadTickets();
    }
  }, [loggedIn]);

  const handleLogin = (event) => {
    event.preventDefault();
    setLoggedIn(true);
    setActivePage("dashboard");
    setMessage("");
    setError("");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setActivePage("dashboard");
    setMessage("");
    setError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setTicketForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ticketForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create ticket.");
      }

      setMessage(
        `Ticket ${data.ticket.id} created successfully.`
      );

      setTicketForm(initialTicket);
      await loadTickets();
      setActivePage("tickets");
    } catch (err) {
      setError(err.message || "Unable to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-mark">LG</div>

          <div className="login-heading">
            <h1>LGCA IT Service Portal</h1>
            <p>LG Electronics Canada Inc.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label>
              Corporate Email
              <input
                type="email"
                placeholder="employee@lge.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter password"
                required
              />
            </label>

            <button type="submit" className="primary-button">
              Sign In
            </button>
          </form>

          <div className="login-note">
            Internal IT Service Request Portal
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="mini-brand">LG</div>
          <div>
            <strong>LGCA IT Service Portal</strong>
            <span>LG Electronics Canada Inc.</span>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <div className="portal-layout">
        <aside className="sidebar">
          <div className="user-box">
            <div className="avatar">JD</div>
            <div>
              <strong>John Doe</strong>
              <span>Employee</span>
            </div>
          </div>

          <nav>
            <button
              className={activePage === "dashboard" ? "nav-active" : ""}
              onClick={() => setActivePage("dashboard")}
            >
              Dashboard
            </button>

            <button
              className={activePage === "create" ? "nav-active" : ""}
              onClick={() => setActivePage("create")}
            >
              Create Ticket
            </button>

            <button
              className={activePage === "tickets" ? "nav-active" : ""}
              onClick={() => setActivePage("tickets")}
            >
              My Tickets
            </button>
          </nav>
        </aside>

        <main className="content">
          {message && <div className="success-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          {activePage === "dashboard" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">INTERNAL IT SUPPORT</p>
                  <h2>IT Service Dashboard</h2>
                  <p>
                    Manage IT service requests and track support activity.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setMessage("");
                    setError("");
                    setActivePage("create");
                  }}
                >
                  + Create Ticket
                </button>
              </div>

              <section className="stats-grid">
                <div className="stat-card">
                  <span>Total Tickets</span>
                  <strong>{tickets.length}</strong>
                </div>

                <div className="stat-card">
                  <span>Open</span>
                  <strong>
                    {tickets.filter((ticket) => ticket.status === "Open").length}
                  </strong>
                </div>

                <div className="stat-card">
                  <span>In Progress</span>
                  <strong>
                    {
                      tickets.filter(
                        (ticket) => ticket.status === "In Progress"
                      ).length
                    }
                  </strong>
                </div>

                <div className="stat-card">
                  <span>Resolved / Closed</span>
                  <strong>
                    {
                      tickets.filter(
                        (ticket) =>
                          ticket.status === "Resolved" ||
                          ticket.status === "Closed"
                      ).length
                    }
                  </strong>
                </div>
              </section>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Recent IT Service Requests</h3>
                    <p>Latest requests returned from the backend API.</p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={loadTickets}
                  >
                    Refresh
                  </button>
                </div>

                {loadingTickets ? (
                  <div className="empty-state">Loading tickets...</div>
                ) : tickets.length === 0 ? (
                  <div className="empty-state">
                    No service requests available.
                  </div>
                ) : (
                  <div className="ticket-table-wrapper">
                    <table className="ticket-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Subject</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.slice(0, 5).map((ticket) => (
                          <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.subject}</td>
                            <td>{ticket.category}</td>
                            <td>{ticket.priority}</td>
                            <td>
                              <span
                                className={`status-badge ${getStatusClass(
                                  ticket.status
                                )}`}
                              >
                                {ticket.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}

          {activePage === "create" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">SERVICE REQUEST</p>
                  <h2>Create IT Ticket</h2>
                  <p>
                    Submit a request to the LGCA IT support team.
                  </p>
                </div>
              </div>

              <section className="panel">
                <form
                  className="ticket-form"
                  onSubmit={handleCreateTicket}
                >
                  <div className="form-grid">
                    <label>
                      Employee Name
                      <input
                        name="employeeName"
                        value={ticketForm.employeeName}
                        onChange={handleFormChange}
                        placeholder="e.g. Michael Brown"
                        required
                      />
                    </label>

                    <label>
                      Employee ID
                      <input
                        name="employeeId"
                        value={ticketForm.employeeId}
                        onChange={handleFormChange}
                        placeholder="e.g. LGC-1156"
                        required
                      />
                    </label>

                    <label>
                      Department
                      <input
                        name="department"
                        value={ticketForm.department}
                        onChange={handleFormChange}
                        placeholder="e.g. Information Technology"
                        required
                      />
                    </label>

                    <label>
                      Category
                      <select
                        name="category"
                        value={ticketForm.category}
                        onChange={handleFormChange}
                      >
                        <option>Laptop/Desktop</option>
                        <option>Software</option>
                        <option>Network</option>
                        <option>VPN</option>
                        <option>Cloud PC</option>
                        <option>Account/Access</option>
                        <option>Printer</option>
                        <option>Email/Microsoft 365</option>
                        <option>Other IT Support</option>
                      </select>
                    </label>

                    <label>
                      Priority
                      <select
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleFormChange}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </label>

                    <label className="full-width">
                      Subject
                      <input
                        name="subject"
                        value={ticketForm.subject}
                        onChange={handleFormChange}
                        placeholder="Briefly describe the issue"
                        required
                      />
                    </label>

                    <label className="full-width">
                      Description
                      <textarea
                        name="description"
                        value={ticketForm.description}
                        onChange={handleFormChange}
                        rows="6"
                        placeholder="Provide details about the IT issue or request"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setActivePage("dashboard")}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-button"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit Ticket"}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}

          {activePage === "tickets" && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">TICKET MANAGEMENT</p>
                  <h2>IT Service Requests</h2>
                  <p>
                    View service requests returned by the backend API.
                  </p>
                </div>

                <button
                  className="secondary-button"
                  onClick={loadTickets}
                >
                  Refresh
                </button>
              </div>

              <section className="panel">
                {loadingTickets ? (
                  <div className="empty-state">Loading tickets...</div>
                ) : (
                  <div className="tickets-list">
                    {tickets.map((ticket) => (
                      <article className="ticket-card" key={ticket.id}>
                        <div className="ticket-card-header">
                          <div>
                            <span className="ticket-id">
                              {ticket.id}
                            </span>
                            <h3>{ticket.subject}</h3>
                          </div>

                          <span
                            className={`status-badge ${getStatusClass(
                              ticket.status
                            )}`}
                          >
                            {ticket.status}
                          </span>
                        </div>

                        <p>{ticket.description}</p>

                        <div className="ticket-meta">
                          <span>
                            <strong>Employee:</strong>{" "}
                            {ticket.employeeName}
                          </span>

                          <span>
                            <strong>Category:</strong>{" "}
                            {ticket.category}
                          </span>

                          <span>
                            <strong>Priority:</strong>{" "}
                            {ticket.priority}
                          </span>

                          <span>
                            <strong>Department:</strong>{" "}
                            {ticket.department}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;