const adminroleController = require("../../controllers/adminroleController");

const router = require("express").Router();

router
  .route("/")
  .get(adminroleController.getAllAdmins)
  .post(adminroleController.createAdminRole);

router
  .route("/:id")
  .get(adminroleController.getAdminDetails)
  .put(adminroleController.updateAdmin)
  .delete(adminroleController.deleteAdmin);

module.exports = router;
