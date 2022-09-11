const {validateAdminPermission} = require("../../permissions/admin_permission");
const {validateUserPermission} = require("../../permissions/user_permission");
const router = require("express").Router();
const {
    auth,
    callback,
    disconnect,
    syncAll,
    viewAttachment,
    syncEmail
} = require("./quickbooks.controller");

router.get("/auth/:request_type", auth);

router.get("/quickbooks_callback", callback);

router.get('/disconnect/:user_id/:company_id', disconnect);

router.get('/sync/all/:user_id/:company_id', syncAll);

router.get('/view/attachment/:user_id/:company_id/:attachment_id', viewAttachment);

router.get('/sync/email/:user_id/:company_id', syncEmail);


module.exports = router;