const roleController = require("../../controllers/roleController");

const router = require("express").Router();

router
  .route("/")
  .get(roleController.getAllRoles)
  .post(rolesCreateRules, roleController.createRole);

router
  .route("/:id")
  .get(roleController.getRoleDetails)
  .put(rolesCreateRules, roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
