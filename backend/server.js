const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
app.use(express.json());

// --------------------------------------------------
// Application Information
// --------------------------------------------------

const applicationInfo = {
  application: "LG Electronics Canada Inc. IT Service Portal",
  service: "IT Ticket Management API",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development"
};

// --------------------------------------------------
// In-Memory Ticket Data
// --------------------------------------------------

let tickets = [
  {
    id: "LGCA-1001",
    employeeName: "John Smith",
    employeeId: "LGC-1024",
    department: "Finance",
    category: "VPN",
    priority: "High",
    subject: "Unable to connect to corporate VPN",
    description:
      "VPN connection fails when working remotely.",
    status: "In Progress",
    createdAt: "2026-09-10T09:30:00Z",
    updatedAt: "2026-09-10T11:15:00Z"
  },
  {
    id: "LGCA-1002",
    employeeName: "Sarah Wilson",
    employeeId: "LGC-1087",
    department: "Marketing",
    category: "Software",
    priority: "Medium",
    subject: "Adobe application installation request",
    description:
      "Requesting installation of approved Adobe software.",
    status: "Open",
    createdAt: "2026-09-11T10:00:00Z",
    updatedAt: "2026-09-11T10:00:00Z"
  }
];

// --------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "LGCA IT Ticket Management API",
    timestamp: new Date().toISOString()
  });
});

// --------------------------------------------------
// Application Information Endpoint
// --------------------------------------------------

app.get("/api", (req, res) => {
  res.status(200).json(applicationInfo);
});

// --------------------------------------------------
// Get All Tickets
// --------------------------------------------------

app.get("/api/tickets", (req, res) => {
  res.status(200).json({
    count: tickets.length,
    tickets
  });
});

// --------------------------------------------------
// Get Ticket by ID
// --------------------------------------------------

app.get("/api/tickets/:id", (req, res) => {
  const ticket = tickets.find(
    (item) => item.id === req.params.id
  );

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found",
      ticketId: req.params.id
    });
  }

  res.status(200).json(ticket);
});

// --------------------------------------------------
// Create New Ticket
// --------------------------------------------------

app.post("/api/tickets", (req, res) => {
  const {
    employeeName,
    employeeId,
    department,
    category,
    priority,
    subject,
    description
  } = req.body;

  if (
    !employeeName ||
    !employeeId ||
    !department ||
    !category ||
    !priority ||
    !subject ||
    !description
  ) {
    return res.status(400).json({
      message: "All ticket fields are required"
    });
  }

  const newTicket = {
    id: `LGCA-${1001 + tickets.length}`,
    employeeName,
    employeeId,
    department,
    category,
    priority,
    subject,
    description,
    status: "Open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  tickets.push(newTicket);

  res.status(201).json({
    message: "IT service request created successfully",
    ticket: newTicket
  });
});

// --------------------------------------------------
// Update Ticket Status
// --------------------------------------------------

app.put("/api/tickets/:id/status", (req, res) => {
  const { status } = req.body;

  const validStatuses = [
    "Open",
    "In Progress",
    "Resolved",
    "Closed"
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid ticket status",
      validStatuses
    });
  }

  const ticket = tickets.find(
    (item) => item.id === req.params.id
  );

  if (!ticket) {
    return res.status(404).json({
      message: "Ticket not found",
      ticketId: req.params.id
    });
  }

  ticket.status = status;
  ticket.updatedAt = new Date().toISOString();

  res.status(200).json({
    message: "Ticket status updated successfully",
    ticket
  });
});

// --------------------------------------------------
// 404 Handler
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.originalUrl
  });
});

// --------------------------------------------------
// Start Server
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `LGCA IT Ticket Management API running on port ${PORT}`
  );
});