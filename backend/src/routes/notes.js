const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Create Note
router.post("/", authenticate, async (req, res) => {
  try {
    const { title, content } = req.body;
    const user = req.user;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
    });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    // Free plan limit for tenant (tenant-wide)
    if (tenant.plan === "FREE" && user.role !== "ADMIN") {
      const tenantNotesCount = await prisma.note.count({
        where: { tenantId: user.tenantId },
      });
      if (tenantNotesCount >= 3) {
        return res
          .status(403)
          .json({ error: "Free plan limit reached. Upgrade to Pro." });
      }
    }

    const note = await prisma.note.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        tenantId: user.tenantId,
        userId: user.id,
      },
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ List Notes
router.get("/", authenticate, async (req, res) => {
  try {
    let notes;
    if (req.user.role === "ADMIN") {
      notes = await prisma.note.findMany({
        where: { tenantId: req.user.tenantId },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true } } },
      });
    } else {
      notes = await prisma.note.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true } } },
      });
    }

    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Retrieve Note
router.get("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const note = await prisma.note.findFirst({
    where: {
      id,
      tenantId: req.user.tenantId,
      ...(req.user.role !== "ADMIN" ? { userId: req.user.id } : {}),
    },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!note) return res.status(404).json({ error: "Note not found" });
  res.json(note);
});

// ✅ Update Note
router.put("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const { title, content } = req.body;
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "Title and content required" });
  }

  const note = await prisma.note.findFirst({
    where: {
      id,
      tenantId: req.user.tenantId,
      ...(req.user.role !== "ADMIN" ? { userId: req.user.id } : {}),
    },
  });
  if (!note) return res.status(404).json({ error: "Note not found" });

  const updated = await prisma.note.update({
    where: { id: note.id },
    data: { title: title.trim(), content: content.trim() },
  });

  res.json(updated);
});

// ✅ Delete Note
router.delete("/:id", authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const note = await prisma.note.findFirst({
    where: {
      id,
      tenantId: req.user.tenantId,
      ...(req.user.role !== "ADMIN" ? { userId: req.user.id } : {}),
    },
  });
  if (!note) return res.status(404).json({ error: "Note not found" });

  await prisma.note.delete({ where: { id: note.id } });
  res.json({ success: true });
});

module.exports = router;
