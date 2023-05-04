const db = require("../database/models/index");
const { validationResult } = require("express-validator");
const Admin = db.Admin;
const Role = db.Role;
const AdminRole = db.AdminRole;
const Permission = db.Permission;
const RolePermission = db.RolePermission;
const bcrypt = require("bcrypt");

const getAllAdmins = async (_req, res) => {
  try {
    const admins = await Admin.findAll({
      include: [
        {
          model: Role,
          through: {
            model: AdminRole,
            attributes: [],
          },
          include: [
            {
              model: Permission,
              through: {
                model: RolePermission,
                attributes: [],
              },
            },
          ],
        },
      ],
    });

    const data = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      createdAt: admin.createdAt,
      roles: admin.Roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.Permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      })),
    }));

    res.status(200).send({
      status: true,
      msg: "Admins lists are the following",
      data: data,
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const createAdminRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  const t = await db.sequelize.transaction();
  try {
    const { name, email, password, phone, roleIds } = req.body;

    const existingEmail = await Admin.findOne({
      where: { email: email },
    });
    if (existingEmail) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            param: "email",
            msg: "Email must be unique",
          },
        ],
      });
    }

    const admin = await Admin.create(
      {
        name,
        email,
        password: bcrypt.hashSync(password, 8),
        phone,
      },
      { transaction: t }
    );

    const adminRoles = roleIds.map((roleId) => ({
      adminId: admin.id,
      roleId,
    }));

    await AdminRole.bulkCreate(adminRoles, { transaction: t });
    await t.commit();
    const adminWithRoles = await Admin.findOne({
      where: { id: admin.id },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
            },
          ],
        },
      ],
    });

    // for activitylogs and response
    const responseData = {
      id: adminWithRoles.id,
      name: adminWithRoles.name,
      email: adminWithRoles.email,
      phone: adminWithRoles.phone,
      createdAt: adminWithRoles.createdAt,
      role: adminWithRoles.Roles.map((role) => ({
        adminId: adminWithRoles.id,
        roleId: role.id,
        role: {
          name: role.name,
          description: role.description,
          permissions: role.Permissions.map((permission) => ({
            id: permission.id,
            name: permission.name,
            description: permission.description,
          })),
        },
      })),
    };

    res.status(200).send({
      msg: "Admin Roles created successfully",
      data: responseData,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const getAdminDetails = async (req, res) => {
  const adminId = req.params.id;

  try {
    const admin = await Admin.findOne({
      where: { id: adminId },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
            },
          ],
        },
      ],
    });

    if (!admin) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Could not find Admin",
          },
        ],
      });
    }

    const responseData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      createdAt: admin.createdAt,
      roles: admin.Roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.Permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      })),
    };

    res.status(200).send({
      status: true,
      msg: "Admin details retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const updateAdmin = async (req, res) => {
  const id = req.params.id;

  if (id == 1) {
    return res.status(403).send({
      status: false,
      msg: "Update process of this Admin is not allowed",
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  const t = await db.sequelize.transaction();
  try {
    const { name, email, password, phone, roleIds } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({
      where: { id: id },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
            },
          ],
        },
      ],
    });

    if (!admin) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Could not find Admin",
          },
        ],
      });
    }

    // for activitylogs
    const originalData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      createdAt: admin.createdAt,
      roles: admin.Roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.Permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      })),
    };

    // Update admin details
    await Admin.update(
      {
        name,
        email,
        password: password ? bcrypt.hashSync(password, 8) : admin.password,
        phone,
      },
      { where: { id } },
      { transaction: t }
    );

    // Update admin roles
    const findAdminRole = await AdminRole.findAll({ where: { adminId: id } });
    if (findAdminRole) {
      await AdminRole.destroy({ where: { adminId: id } }, { transaction: t });
    }

    const adminRoles = roleIds.map((roleId) => ({
      adminId: id,
      roleId,
    }));

    await AdminRole.bulkCreate(adminRoles, { transaction: t });
    await t.commit();

    // Get updated admin with roles and permissions
    const adminWithRoles = await Admin.findOne({
      where: { id },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
              through: {
                attributes: [],
              },
            },
          ],
          through: {
            attributes: [],
          },
        },
      ],
    });

    // Build response data
    const responseData = {
      id: adminWithRoles.id,
      name: adminWithRoles.name,
      email: adminWithRoles.email,
      phone: adminWithRoles.phone,
      createdAt: adminWithRoles.createdAt,
      roles: adminWithRoles.Roles.map((role) => ({
        roleId: role.id,
        name: role.name,
        description: role.description,
        permissions: role.Permissions.map((permission) => ({
          permissionId: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      })),
    };

    res.status(200).send({
      status: true,
      msg: "Admin updated successfully",
      data: responseData,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const deleteAdmin = async (req, res) => {
  const id = req.params.id;

  if (id == 1) {
    return res.status(403).send({
      status: false,
      msg: "Deletion of this Admin is not allowed",
    });
  }
  const t = await db.sequelize.transaction();
  try {
    const admin = await Admin.findOne({
      where: { id: id },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permission,
            },
          ],
        },
      ],
    });

    if (!admin) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Could not find Admin",
          },
        ],
      });
    }

    // for activitylogs
    const responseData = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      createdAt: admin.createdAt,
      roles: admin.Roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.Permissions.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      })),
    };

    await AdminRole.destroy({ where: { adminId: id } }, { transaction: t });
    await admin.destroy({ transaction: t });
    await t.commit();

    res.status(200).send({
      status: true,
      msg: "Admin deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

module.exports = {
  getAllAdmins,
  createAdminRole,
  getAdminDetails,
  updateAdmin,
  deleteAdmin,
};
