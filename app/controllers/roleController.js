const db = require("../database/models");
const { Op } = require("sequelize");
const Role = db.Role;
const RolePermission = db.RolePermission;
const Permission = db.Permission;

const getAllRoles = async (_req, res) => {
  try {
    const roles = await Role.findAll({
      where: { id: { [Op.not]: 1 } },
      include: {
        model: Permission,
        through: {
          attributes: [],
        },
      },
    });

    const data = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      permissions: role.Permissions,
    }));

    res.status(200).send({
      status: true,
      msg: "Roles Lists are the following",
      data: data,
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const createRole = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { name, description, permissionIds } = req.body;
    const role = await Role.create(
      {
        name,
        description,
      },
      { transaction: t }
    );

    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId: role.id,
      permissionId,
    }));

    await RolePermission.bulkCreate(rolePermissions, { transaction: t });
    await t.commit();
    const roleWithPermissions = await Role.findOne({
      where: { id: role.id },
      include: [
        {
          model: Permission,
        },
      ],
    });

    const responseData = {
      id: roleWithPermissions.id,
      name: roleWithPermissions.name,
      description: roleWithPermissions.description,
      createdAt: roleWithPermissions.createdAt,
      permission: roleWithPermissions.Permissions.map((permission) => ({
        roleId: roleWithPermissions.id,
        permissionId: permission.id,
        permission: {
          id: permission.id,
          name: permission.name,
          description: permission.description,
        },
      })),
    };
    res.status(200).send({
      msg: "Role created successfully",
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    await t.rollback();
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const getRoleDetails = async (req, res) => {
  let roleId = req.params.id;

  try {
    const role = await Role.findOne({
      where: { id: roleId },
      include: [
        {
          model: Permission,
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!role) {
      return res.status(400).send({
        status: false,
        msg: "Role not found",
      });
    }

    const permissions = role.Permissions.map((permission) => ({
      roleId: role.id,
      permissionId: permission.id,
      permission: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
      },
    }));

    res.status(200).send({
      status: true,
      msg: "Success",
      data: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: false,
      msg: error,
    });
  }
};

const updateRole = async (req, res) => {
  const roleId = req.params.id;
  const t = await db.sequelize.transaction();
  try {
    const { name, description, permissionIds } = req.body;

    const role = await Role.findOne({
      where: { id: roleId },
      include: [
        {
          model: Permission,
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!role) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Could not find Role",
          },
        ],
      });
    }

    await role.update(
      {
        name,
        description,
      },
      { transaction: t }
    );

    await RolePermission.destroy({ where: { roleId } });

    const rolePermissions = permissionIds.map((permissionId) => ({
      roleId,
      permissionId,
    }));

    await RolePermission.bulkCreate(rolePermissions, { transaction: t });
    await t.commit();
    const roleWithPermissions = await Role.findOne({
      where: { id: role.id },
      include: [
        {
          model: Permission,
        },
      ],
    });

    // for activitylogs and response
    const responseData = {
      id: roleWithPermissions.id,
      name: roleWithPermissions.name,
      description: roleWithPermissions.description,
      permission: roleWithPermissions.Permissions.map((permission) => ({
        roleId: roleWithPermissions.id,
        permissionId: permission.id,
        permission: {
          id: permission.id,
          name: permission.name,
          description: permission.description,
        },
      })),
    };

    res.status(200).send({
      status: true,
      msg: "Role updated successfully",
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

const deleteRole = async (req, res) => {
  const roleId = req.params.id;
  const t = await db.sequelize.transaction();
  try {
    const role = await Role.findOne({
      where: { id: roleId },
      include: [
        {
          model: Permission,
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (!role) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Could not find Role",
          },
        ],
      });
    }

    await RolePermission.destroy({ where: { roleId } }, { transaction: t });
    await role.destroy({ transaction: t });
    await t.commit();

    res.status(200).send({
      status: true,
      msg: "Role deleted successfully",
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
  getAllRoles,
  createRole,
  getRoleDetails,
  updateRole,
  deleteRole,
};
