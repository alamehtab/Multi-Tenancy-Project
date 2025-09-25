const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * ✅ Get ALL users (Admins only)
 * GET /tenants/all-users
 */
router.get("/all-users", authenticate, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        tenant: { select: { name: true, slug: true, plan: true } },
      },
      orderBy: { email: "asc" },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Get tenant info (Admins only)
 * GET /tenants/:slug
 */
router.get("/:slug", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, plan: true },
    });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });
    res.json(tenant);
  } catch (err) {
    console.error("Error fetching tenant:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Toggle subscription plan (Admins only)
 * POST /tenants/:slug/toggle-plan
 */
router.post("/:slug/toggle-plan", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) return res.status(404).json({ error: "Tenant not found" });

    const newPlan = tenant.plan === "PRO" ? "FREE" : "PRO";
    const updatedTenant = await prisma.tenant.update({
      where: { slug },
      data: { plan: newPlan },
    });

    res.json(updatedTenant);
  } catch (err) {
    console.error("Error toggling plan:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:slug/users/:userId", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug, userId } = req.params;
  const { email, role } = req.body;

  if (req.user.tenantSlug !== slug) {
    return res.status(403).json({ error: "Forbidden: Tenant mismatch" });
  }

  if (!email?.trim()) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!["ADMIN", "MEMBER"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    // Check if user exists and belongs to the tenant
    const existingUser = await prisma.user.findFirst({
      where: { 
        id: parseInt(userId),
        tenant: { slug }
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found in this tenant" });
    }

    // Check if email is already taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email.trim(),
          tenant: { slug },
          id: { not: parseInt(userId) }
        }
      });

      if (emailExists) {
        return res.status(400).json({ error: "Email already exists in this tenant" });
      }
    }

    // Prevent demoting the last admin
    if (existingUser.role === "ADMIN" && role === "MEMBER") {
      const adminCount = await prisma.user.count({
        where: {
          tenant: { slug },
          role: "ADMIN"
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot demote the last admin" });
      }
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        email: email.trim(),
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenant: { select: { name: true, slug: true, plan: true } }
      }
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Invite user (Admins only, within tenant)
 * POST /tenants/:slug/invite
 */
router.post("/:slug/invite", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug } = req.params;
  const { email, role } = req.body;

  if (req.user.tenantSlug !== slug) {
    return res.status(403).json({ error: "Tenant mismatch" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

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
    console.error("Error inviting user:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

/**
 * ✅ List users of a tenant
 * GET /tenants/:slug/users
 * - Admins can view any tenant
 * - Non-admins can only view their own tenant
 */
router.get("/:slug/users", authenticate, async (req, res) => {
  const { slug } = req.params;

  if (req.user.role !== "ADMIN" && req.user.tenantSlug !== slug) {
    return res.status(403).json({ error: "Forbidden: You can only view your tenant’s users" });
  }

  try {
    const users = await prisma.user.findMany({
      where: { tenant: { slug } },
      select: {
        id: true,
        email: true,
        role: true,
        tenant: { select: { name: true, slug: true, plan: true } },
      },
      orderBy: { email: "asc" },
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching tenant users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * ✅ Delete user (Admins only within tenant)
 * DELETE /tenants/:slug/users/:userId
 */
router.delete("/:slug/users/:userId", authenticate, requireRole("ADMIN"), async (req, res) => {
  const { slug, userId } = req.params;

  if (req.user.tenantSlug !== slug) return res.status(403).json({ error: "Forbidden" });

  try {
    const member = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!member) return res.status(404).json({ error: "User not found" });
    if (member.role === "ADMIN") return res.status(403).json({ error: "Cannot delete admin" });

    await prisma.user.delete({ where: { id: parseInt(userId) } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
