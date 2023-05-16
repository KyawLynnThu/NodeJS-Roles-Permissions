const permissionController = require("../../controllers/permissionController");

const router = require("express").Router();

router
  .route("/")
  .get(permissionController.getAllPermissions)
  .post(permissionController.createPermission);

router
  .route("/:id")
  .get(permissionController.getPermissionDetails)
  .put(permissionController.updatePermission)
  .delete(permissionController.deletePermission);

module.exports = router;
