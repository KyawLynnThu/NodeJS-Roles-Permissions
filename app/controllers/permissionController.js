const db = require("../database/models");
const Permission = db.Permission;

const getAllPermissions = async (_req, res) => {
  let permissions = await Permission.findAll({});
  res.status(200).send({
    msg: "Permission Lists are the following",
    data: permissions,
  });
};

const createPermission = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const existingPermission = await Permission.findOne({
      where: { name: req.body.name },
    });
    if (existingPermission) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Permission name must be unique",
          },
        ],
      });
    }

    let permissionData = {
      name: req.body.name,
      description: req.body.description ? req.body.description : null,
    };
    const result = await Permission.create(permissionData, { transaction: t });

    await t.commit();
    res.json({
      success: true,
      msg: "Permission created successfully",
      data: result,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({
      success: false,
      msg: error,
    });
  }
};

const getPermissionDetails = async (req, res) => {
  let id = req.params.id;
  let permission = await Permission.findOne({ where: { id: id } });
  if (!permission) {
    return res.status(404).send({
      errors: [
        {
          success: false,
          msg: "Permission not found",
        },
      ],
    });
  }
  res.status(200).send({
    msg: "Success",
    data: permission,
  });
};

const updatePermission = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const updatedPermission = await Permission.findByPk(req.params.id);
    if (!updatedPermission) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Permission not found",
          },
        ],
      });
    }

    const permission = await Permission.findOne({
      where: { name: req.body.name },
    });
    if (permission && permission.id !== parseInt(req.params.id)) {
      return res.status(404).send({
        errors: [
          {
            success: false,
            msg: "Permission name must be unique",
          },
        ],
      });
    }

    const updatedPermissionData = {
      name: req.body.name,
      description: req.body.description || null,
    };
    const result = await updatedPermission.update(updatedPermissionData, {
      transaction: t,
    });

    await t.commit();
    res.json({
      success: true,
      msg: "Permission updated successfully",
      data: result,
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send({
      success: false,
      msg: error,
    });
  }
};

const deletePermission = async (req, res) => {
  let id = req.params.id;
  let findPermission = await Permission.findOne({ where: { id: id } });

  if (!findPermission) {
    return res.status(404).send({
      errors: [
        {
          success: false,
          msg: "Could not find Permission",
        },
      ],
    });
  }

  const t = await db.sequelize.transaction();
  try {
    await Permission.destroy({ where: { id: id } }, { transaction: t });
    await t.commit();
    res.json({
      status: true,
      msg: "Permission deleted successfully",
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
  getAllPermissions,
  createPermission,
  getPermissionDetails,
  updatePermission,
  deletePermission,
};
