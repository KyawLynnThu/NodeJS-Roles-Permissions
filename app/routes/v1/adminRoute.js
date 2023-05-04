const adminroleController = require("../../controllers/adminroleController");

const router = require("express").Router();

router
  .route("/")
  .get(adminroleController.getAllAdmins)
  .post(adminrolesCreateRules, adminroleController.createAdminRole);

router
  .route("/:id")
  .get(adminroleController.getAdminDetails)
  .put(adminrolesUpdateRules, adminroleController.updateAdmin)
  .delete(adminroleController.deleteAdmin);

module.exports = router;
