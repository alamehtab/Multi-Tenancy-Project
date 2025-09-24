const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Get tenant info
router.get("/:slug", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug } = req.params;

  if (req.user.tenantSlug !== slug) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, plan: true },
    });

    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Upgrade plan
router.post("/:slug/upgrade", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug } = req.params;

  if (req.user.tenantSlug !== slug) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const tenantData = await prisma.tenant.findUnique({ where: { slug } });
    if (tenantData.plan === "PRO") {
      return res.status(400).json({ error: "Tenant already on Pro plan" });
    }

    const tenant = await prisma.tenant.update({
      where: { slug },
      data: { plan: "PRO" },
    });

    res.json(tenant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Invite user
router.post("/:slug/invite", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const { slug } = req.params;
    const { email, role } = req.body;

    if (req.user.tenantSlug !== slug) {
      return res.status(403).json({ error: "Tenant mismatch" });
    }

    // ❌ Check duplicate email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash("password", 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        tenant: { connect: { id: req.user.tenantId } },
      },
    });

    res.status(201).json({
      message: "User invited successfully",
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ List users
router.get("/:slug/users", authenticate, requireRole("ADMIN"), async (req, res) => {
  if (req.user.tenantSlug !== req.params.slug) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.user.tenantId },
      select: { id: true, email: true, role: true },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
