const permissionController = require("../../controllers/permissionController");

const router = require("express").Router();

router
  .route("/")
  .get(permissionController.getAllPermissions)
  .post(
    isAuth.authCheck,
    permissionsCreateRules,
    permissionController.createPermission
  );

router
  .route("/:id")
  .get(permissionController.getPermissionDetails)
  .put(
    isAuth.authCheck,
    permissionsCreateRules,
    permissionController.updatePermission
  )
  .delete(permissionController.deletePermission);

module.exports = router;
