const {validateAdminPermission} = require("../../permissions/admin_permission");
const {validateUserPermission} = require("../../permissions/user_permission");
const router = require("express").Router();
const {
    auth,
    callback,
    signUpCallBack,
    disconnect,
    viewAttachment
} = require("./xero.controller");

router.get("/auth/:request_type", auth);

router.get("/xero_callback", callback);
router.get("/xero_callback_sign_up", signUpCallBack);

router.get('/disconnect/:user_id/:company_id', disconnect);

router.get('/view/attachment/:user_id/:expense_id/:company_id/:attachment_id', viewAttachment);


module.exports = router;