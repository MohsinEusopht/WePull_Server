const {validateAdminPermission} = require("../../permissions/admin_permission");
const {validateUserPermission} = require("../../permissions/user_permission");
const router = require("express").Router();
const {
    auth,
    callback,
    disconnect,
    viewAttachment
} = require("./quickbooks.controller");

router.get("/auth/:request_type", auth);

router.get("/quickbooks_callback", callback);

router.get('/disconnect/:user_id/:company_id', disconnect);

router.get('/view/attachment/:user_id/:company_id/:attachment_id', viewAttachment);


module.exports = router;