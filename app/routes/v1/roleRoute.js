const roleController = require("../../controllers/roleController");

const router = require("express").Router();

router
  .route("/")
  .get(roleController.getAllRoles)
  .post(roleController.createRole);

router
  .route("/:id")
  .get(roleController.getRoleDetails)
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;
