const router = require("express").Router();
const { validateUserPermission } = require("../../permissions/user_permission");
const { validateAdminPermission } = require("../../permissions/admin_permission");
const {
    defaultFun,
    login,
    auth_login,
    getRoles,
    getLoginToken,
    getUserCategories,
    getExpenses,
    getAttachables,
    getCompanies,
    getCategories,
    getCategoriesForDashboard,
    getCategoriesForUserCreation,
    getSuppliers,
    getUsers,
    activateCompany,
    getLastSyncedActivity
} = require("./user.controller");

router.get("/", defaultFun);

//Login
router.post("/login", login);

//Xero , QB login
router.post("/auth_login", auth_login);

//Get user login token
router.get("/getLoginToken/:email", getLoginToken);

//Get all roles from database
router.get("/getRoles", validateAdminPermission, getRoles);

router.get("/getUserCategories/:id", validateUserPermission, getUserCategories);

//Get company for companies page
router.get("/getCompanies/:user_id", validateAdminPermission, getCompanies);

//Get categories for category page
router.get("/getCategories/:company_id", validateAdminPermission, getCategories);
router.get("/getCategoriesForDashboard/:company_id", validateAdminPermission, getCategoriesForDashboard);
router.get("/getCategoriesForUserCreation/:company_id", validateAdminPermission, getCategoriesForUserCreation);

//Get suppliers for supplier page
router.get("/getSuppliers/:company_id", validateAdminPermission, getSuppliers);

//Get users for user page
router.get("/getUsers/:company_id", validateAdminPermission, getUsers);

//Get expenses for expense page
router.get('/getExpenses/:company_type/:company_id', getExpenses)
router.get('/getAttachables/:company_id', getAttachables);

//activate company
router.get('/company/activate/:company_id/:user_id', validateAdminPermission, activateCompany);

//getLastSyncedActivity
router.get('/getLastSyncedActivity/:company_id/:type', getLastSyncedActivity);

module.exports = router;