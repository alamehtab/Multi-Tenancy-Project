const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const tenantRoutes = require("./routes/tenants");
const healthRoutes = require("./routes/health");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.use("/tenants", tenantRoutes);
app.use("/health", healthRoutes);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
