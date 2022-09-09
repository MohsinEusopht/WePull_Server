const {
    TokenSet
} = require("openid-client");
const {
    hashSync,
    genSaltSync,
    compareSync
} = require("bcrypt");
const crypto = require('crypto');
const request = require('request');
const strToTime = require('strtotime');
const nodeMailer = require("nodemailer");
const moment = require('moment-timezone');
const {
    updateRefreshToken
} = require("./xero.service");

const {
    updateLoginToken,
    createUserAccount,
    storeActivity,
    getUserByEmail,
    updateAccountEmail,
    checkUserEmail,
    checkCompanyExist,
    disableAllCompany,
    activateCompany,
    getCompanyByTenant,
    getCompanyById,
    getUserById,
    checkUserCompanyByTenant,
    createCompany,
    updateAllCompanies,
    createUserRole,
    checkCategory,
    addCategory,
    updateCategory,
    checkAccount,
    createAccount,
    updateAccount,
    checkSupplier,
    addSupplier,
    updateSupplier,
    getSupplierBySupplierID,
    getAccountByAccountID,
    getCategoryByCategoryIDAndParentName,
    checkExpense,
    addExpense,
    updateExpense,
    getExpenseAttachments,
    updateExpenseAttachments,
    // checkAttachable,
    // addAttachable,
    // updateAttachable,
    getCompanyByID,
    getCompanyByUserID,
    updateUserStatus,
    setForeignKeyEnable,
    setForeignKeyDisable,
    removeAccounts,
    removeActivities,
    removeExpenses,
    removeAttachables,
    removeCategories,
    removeUserRelations,
    removeSuppliers,
    removeUsersOfCompany,
    removeCompany,
} = require("../users/user.service");

const {
    XeroClient
} = require("xero-node");
const jwt = require('jsonwebtoken');
const {subject, template} = require('../assets/mailConfig');

let xero_access_token = null;
let xero_refresh_token = null;
let xero_id_token = null;
let xero_expire_at = null;


let tokenSet = null;
let TS = null;

let scope = 'openid profile email';
const xeroLogin = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_SECRET_ID,
    redirectUris: [process.env.XERO_REDIRECT_URI],
    scopes: 'openid profile email'.split(" "),
    state: 'returnPage=login', // custom params (optional)
    httpTimeout: 100000 // ms (optional)
});

const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_SECRET_ID,
    redirectUris: [process.env.XERO_REDIRECT_SIGNUP_URI],
    scopes: 'openid profile email accounting.transactions offline_access accounting.settings accounting.attachments accounting.contacts'.split(" "),
    state: 'returnPage=signUp', // custom params (optional)
    httpTimeout: 100000 // ms (optional)
});

async function xero_get_tenant(access_token) {
    let bearer = 'Bearer ' + access_token;
    console.log(bearer);
    let options = {
        'method': 'GET',
        'url': 'https://api.xero.com/connections',
        'headers': {
            'Authorization': bearer,
            'Cookie': '_abck=A3EA3F813C4B0FE84B57724133558714~-1~YAAQBGswF9QJod5+AQAAlxRaBwfmz1DVCmuZ4A6y1QjxRITSajH7n8Rsy8zkUSWPnCmGRnuG5t0jm5IrFS07DKVCAPDuzP3vgZRlXREUxGkRdW1sdKq5EixBRtXdQBcb3vN8Kd4O04mAc+GS9Svuzh4VaAjWhBqgqdELaGLqPBVuiuR9F9jU0kUbCs8yguEf3d6DwGKan6KMcOCjnjjDcveea3C9qbXOM+fbuXW8vo8+LPILT11uvABeB0YXryvq3Lnv3rDyeI37u/wj5syqZOMd67M3WgKOytWvPLInEOavlpPAxso6S5S/6enkW286/xfrPRMKUnn6wMcasyauZY2Hi2c7kpAp++J0Jqiws+x1PIKwLuKXFr3Oe+46hReqMrhDxeQ=~-1~-1~-1; ak_bmsc=5767EEF35D9998B1CEE1538075B0B0BD~000000000000000000000000000000~YAAQBGswF9UJod5+AQAAlxRaBw7kQBo2Lsk7bu5f5MVp0E7aCME6bXfLfGFHuLGD/WxBqoRLIpKI7pBEmUl5nxuz1ZGiDJZAI7VPSZS8R1B+WvP9M4bWivbnzec9uliIQxwwrekuOc17HvjYsz6sN4djNrGlfZVcI7oLZobO82ywlDSTuF1G2zfdJ7w7GF0bo4Wyahk9psBbJa+jl9qHxXUgZCvNXw5uBmurhjCdq4urFKgIMe33HA/um5agV/FXA8CyWxCxcuyEgMsWoh9xDGIpdkJghyQw+AB/NIqtV6iMqxYKVpslRGNw11H0cI++Lfn//V0ZrVV2uNsbkF5u3vd26RFasCLznNjrEmcx8XhtZ2RUhXPYid919g==; bm_sv=BA6EE1536FFE5162901ED703261238D0~N9d3GimHdz48LeSQ6weNOPKA5SoSmm61fnFdPu6r+raXVSyUCIV4sr3jWol9ItHVHrR8JJcETlm7EVDgC13MsX4bFzsXDWuKOMI33+Jys4u7VEcV4NGhR4WoBiY5TbtsWwfkVT0vWM6Cou2lAJpIZA==; bm_sz=8E8439F32D362EA97CFBD0F5CD05E449~YAAQBGswF9MJod5+AQAAlhRaBw42gmhbH5f13iqoAqkBuReIVeKGHYc8r8ZnNh4eAkc2cVTxm66bvzY3By3UoUrfYsfmHXSpBwk3s4b+s0KNBZmtNqRdOHm26nR6tCYGNkPdcL1dJR1u4WIWede5FPEEc1wANmDDyKhWVA+42/qRQq932ahp90yhCcNnBA=='
        }
    };
    let array = [];

    return new Promise(function(resolve, reject) {
        request(options, function(error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else {
                console.log("rr",error)
                reject(error);
            }
        });
    });
}

async function xero_remove_connection(access_token, tenant_id) {
    try {
        let bearer = "Bearer " + access_token;
        console.log(bearer);
        // return "working";
        let options = {
            'method': 'DELETE',
            'url': `https://api.xero.com/connections/${tenant_id}`,
            'headers': {
                'Authorization': bearer
            }
        };

        let ress = null;

        new Promise(function(resolve, reject) {
            request(options, function(error, res, body) {
                if (error) {
                    ress = false;
                }
                ress = true;
            });
        });

        return ress;
    } catch (e) {
        console.log("error while disconnecting xero company", e);
    }
}

async function refreshToken(user_id) {
    const user = await getUserById(user_id);
    console.log("user refresh token",user);

    let expire_at = user[0].xero_expire_at;
    let ts = Number(expire_at); // cast it to a Number
    const unixTimestamp = ts;
    const milliseconds = unixTimestamp * 1000 // 1575909015000
    const expire = new Date(milliseconds).toLocaleString();
    let current_date = new Date().toLocaleString();

    console.log("expire date", expire);
    console.log("current_date", current_date);

    if (current_date > expire) {
        console.log("Expired");
        const validTokenSet = await xero.refreshWithRefreshToken(process.env.XERO_CLIENT_ID, process.env.XERO_SECRET_ID, user[0].xero_refresh_token);
        let array = JSON.parse(JSON.stringify(validTokenSet));
        xero_access_token = array.access_token;
        xero_refresh_token = array.refresh_token;
        xero_id_token = array.id_token;
        xero_expire_at = array.expires_at;

        const updateRefreshTokenResult = await updateRefreshToken(user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at);
        console.log("Refreshed Token Set UPDATED");
        console.log(validTokenSet);
        TS = new TokenSet({
            id_token: xero_id_token,
            access_token: xero_access_token,
            refresh_token: xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        await xero.setTokenSet(TS);

        console.log("Token set data after refresh: ", xero.readTokenSet());
        tokenSet = validTokenSet;
        let res = {
            'message':'Expired',
            'validTokenSet': validTokenSet,
            'TS': TS
        };

        return res;
    } else {
        console.log("Not Expired");
        const TS = new TokenSet({
            id_token: user[0].xero_id_token,
            access_token: user[0].xero_access_token,
            refresh_token: user[0].xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        let res = {
            'message': 'Not Expired',
            'TS': TS
        };

        return res;
    }
}

async function syncCategories(user_id, company_id, tenant) {
    try {
        const user = await getUserById(user_id);
        console.log("syncCategories user", user);

        const TS = new TokenSet({
            id_token: user[0].xero_id_token,
            access_token: user[0].xero_access_token,
            refresh_token: user[0].xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        console.log("syncCategories token set:", TS);

        await xero.setTokenSet(TS);

        const xeroTenantId = tenant;
        console.log("syncCategories xeroTenantId",xeroTenantId);
        // const where = 'Status=="ACTIVE"';
        const order = 'Name ASC';
        const includeArchived = true;
        const response = await xero.accountingApi.getTrackingCategories(xeroTenantId, null, order, includeArchived);
        let res = response.body.trackingCategories;
        if (res.length > 0) {
            for (let i = 0; i < res.length; i++) {
                console.log("syncCategories categories", i, ":::", response.body.trackingCategories[i])
                for (const Category of response.body.trackingCategories[i].options) {
                    const checkCategoryResult = await checkCategory(Category.trackingOptionID, company_id);
                    let category_type = "";
                    if(res[i].name === "Departments" || res[i].name === "departments"|| res[i].name === "Department" || res[i].name === "department") {
                        category_type = "Departments";
                    }
                    else if (res[i].name === "Locations" || res[i].name === "locations" || res[i].name === "Location" || res[i].name === "location") {
                        category_type = "Locations";
                    }
                    else if(i === 0) {
                        category_type = "Departments";
                    }
                    else if(i === 1) {
                        category_type = "Locations";
                    }
                    else {
                        category_type = "";
                    }

                    if (checkCategoryResult[0].category_count === 0) {
                        console.log("category id", Category.trackingOptionID);
                        console.log("category name", Category.name);
                        console.log("category status", Category.status);
                        console.log("category parent", res[i].name);
                        console.log("")
                        const addCategoryResult = addCategory(Category.name, Category.trackingOptionID, null, Category.status.toString() === "ACTIVE" ? 1 : 0,res[i].trackingCategoryID, res[i].name, category_type, user_id, company_id);
                    } else {
                        console.log("category found...");
                        console.log("founded category id", Category.trackingOptionID);
                        console.log("founded category name", Category.name);
                        console.log("founded category status", Category.status);
                        console.log("founded category parent", res[i].name);
                        console.log("")
                        const updateCategoryResult = updateCategory(Category.name, Category.trackingOptionID, null, Category.status.toString() === "ACTIVE" ? 1 : 0,res[i].trackingCategoryID, res[i].name, category_type, company_id);
                    }
                }
            }
        }
        await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
        return {
            status: 200,
            message: "Categories synced successfully!"
        }
    } catch (err) {
        return {
            status: 500,
            message: err
        };
    }
}

async function syncAccounts(user_id, company_id, tenant) {
    try {
        const user = await getUserById(user_id);
        console.log("syncAccounts user", user);

        const TS = new TokenSet({
            id_token: user[0].xero_id_token,
            access_token: user[0].xero_access_token,
            refresh_token: user[0].xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        console.log("syncAccounts token set:", TS);
        // await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
        const xeroTenantId = tenant;
        await xero.setTokenSet(TS);
        const order = 'Name ASC';
        //getting all account by tenant id
        const response = await xero.accountingApi.getAccounts(xeroTenantId, null, null, order);
        // console.log(typeof response.body.accounts);
        let res = response.body.accounts;

        if (res.length > 0) {
            for (const Account of res) {
                //Check if tenant account already exist
                const checkAccountResult = await checkAccount(Account.code, company_id);
                console.log("syncAccounts count:", checkAccountResult[0].account_count);
                if (checkAccountResult[0].account_count === 0) {
                    const createTenantAccountResult = await createAccount(Account.name, Account.code, "xero", Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.status === "ACTIVE" ? 1 : 0, company_id, user_id);
                    console.log("account created", Account.name, Account.code);
                } else {
                    console.log("account found", Account.name, Account.code);
                    const updateAccountResult = await updateAccount(Account.name, Account.code, Account.description, Account.currencyCode == undefined ? null : Account.currencyCode, Account.status === "ACTIVE" ? 1 : 0, company_id);
                }
            }
        }
        await storeActivity("Accounts Synced", "-", "Account", company_id, user_id);
        return {
            status: 200,
            message: "Accounts synced successfully!"
        }
    } catch (err) {
        return {
            status: 500,
            message: err
        };
    }
}

async function syncSuppliers(user_id, company_id, tenant) {
    try {
        const user = await getUserById(user_id);
        // console.log("syncSuppliers user", user);
        console.log("syncSuppliers tenant id", tenant);

        const TS = new TokenSet({
            id_token: user[0].xero_id_token,
            access_token: user[0].xero_access_token,
            refresh_token: user[0].xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        // console.log("syncSuppliers token set:", TS);

        // await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
        await xero.setTokenSet(TS);

        const xeroTenantId = tenant;
        const ifModifiedSince = null;
        const where = null;
        const order = null;
        const iDs = null;
        const page = 1;
        const includeArchived = true;
        const summaryOnly = false;
        const searchTerm = null;

        const response = await xero.accountingApi.getContacts(xeroTenantId, ifModifiedSince, where, order, iDs, page, includeArchived, summaryOnly, searchTerm);
        let res = response.body.contacts;

        // console.log("result",res);
        let i = 1;

        for (const Contact of res) {
            let supplier_id = Contact.contactID;
            let name = Contact.name;
            let status = Contact.contactStatus === 'ACTIVE' ? 1 : 0;
            let email = Contact.emailAddress !== undefined ? Contact.emailAddress: null;
            let address1 = Contact.addresses[0].addressLine1 !== undefined ? Contact.addresses[0].addressLine1 : "";
            let address2 = Contact.addresses[0].addressLine2 !== undefined ? Contact.addresses[0].addressLine2 : "";
            let address3 = Contact.addresses[0].addressLine3 !== undefined ? Contact.addresses[0].addressLine3 : "";
            let address4 = Contact.addresses[0].addressLine4 !== undefined ? Contact.addresses[0].addressLine4 : "";
            let address = address1 + address2 + address3 + address4;
            let city = Contact.addresses[0].city !== undefined ? Contact.addresses[0].city : null;
            let postalCode = Contact.addresses[0].postalCode !== undefined ? Contact.addresses[0].postalCode : null;
            let region = Contact.addresses[0].region !== undefined ? Contact.addresses[0].region : null;
            let country = Contact.addresses[0].country !== undefined ? Contact.addresses[0].country : null;
            let contact = Contact.phones[1].phoneCountryCode !== undefined ? Contact.phones[1].phoneCountryCode + Contact.phones[1].phoneAreaCode + Contact.phones[1].phoneNumber : null;
            let mobile = Contact.phones[3].phoneCountryCode !== undefined ? Contact.phones[3].phoneCountryCode + Contact.phones[3].phoneAreaCode + Contact.phones[3].phoneNumber : null;
            let website = Contact.website !== undefined ? Contact.website : null;
            let create_date = Contact.updatedDateUTC;
            console.log("Contact",i,":")
            console.log("supplier_id",supplier_id);
            console.log("name",name);
            console.log("status",status);
            console.log("email",email?email:"not provided");
            console.log("address",address?address:"not provided");
            console.log("city",city?city:"not provided");
            console.log("region",region?region:"not provided");
            console.log("country",country?country:"not provided");
            console.log("contact",contact?contact:"not provided");
            console.log("mobile",mobile?mobile:"not provided");
            console.log("website",website?website:"not provided");
            console.log("create_date",create_date?create_date:"not provided");
            console.log("-----------");
            const checkVendorResult = await checkSupplier(supplier_id, company_id);
            if (checkVendorResult[0].supplier_count === 0) {
                const addSupplierResult = await addSupplier(name?name:null, supplier_id, contact?contact:null, mobile?mobile:null, email?email:null, website?website:null, address?address:null, city?city:null, region?region:null, country?country:null, postalCode?postalCode:null, status, 'xero', company_id, user_id, create_date);
            }
            else {
                const updateSupplierResult = await updateSupplier(name?name:null, supplier_id, contact?contact:null, mobile?mobile:null, email?email:null, website?website:null, address?address:null, city?city:null, region?region:null, country?country:null, postalCode?postalCode:null, status, company_id, create_date);
            }
        }
        await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
        return {
            status: 200,
            message: "Suppliers synced successfully!"
        }
    } catch (err) {
        return {
            status: 500,
            message: err
        };
    }
}

async function syncExpenses(user_id, company_id, tenant, duration) {
    try {
        const user = await getUserById(user_id);
        // console.log("syncSuppliers user", user);

        const TS = new TokenSet({
            id_token: user[0].xero_id_token,
            access_token: user[0].xero_access_token,
            refresh_token: user[0].xero_refresh_token,
            token_type: "Bearer",
            scope: scope
        });

        console.log("syncExpenses token set:", TS);
        // await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
        await xero.setTokenSet(TS);
        let ifModifiedSince = null;
        if(duration === "all") {
            ifModifiedSince = null;
        }
        else if (duration === "week") {
            console.log("week expenses are syncing");
            ifModifiedSince = new Date(moment(new Date()).subtract(7, 'days').toISOString());
        }
        else {
            ifModifiedSince = null;
        }

        const page = 1;
        const includeArchived = true;
        const createdByMyApp = false;
        const unitdp = 4;
        const summaryOnly = false;
        const response = await xero.accountingApi.getInvoices(tenant, ifModifiedSince, null, null, null, null, null, null, page, includeArchived, createdByMyApp, unitdp, summaryOnly);
        const res = response.body.invoices;
        // console.log("expense response",res);
        if(res.length > 0) {
            for (const Expense of res) {
                if (Expense.type.toString() === "ACCPAY") {
                        for (let i = 0; i < Expense.lineItems.length; i++) {
                            //Get supplier of expense by supplier id
                            let getSupplierOfExpense = await getSupplierBySupplierID(Expense.contact.contactID, company_id);
                            let supplier_id = getSupplierOfExpense?getSupplierOfExpense[0].id:null;
                            let supplier_name = getSupplierOfExpense?getSupplierOfExpense[0].name:null;

                            //Get account of expense by account id
                            let getAccountOfExpense = await getAccountByAccountID(Expense.lineItems[i].accountCode, company_id);
                            let account_id = getAccountOfExpense?getAccountOfExpense[0].id:null;

                            //Store category 1 and category 2 of line item
                            let category1 = null;
                            let category2 = null;
                            if (Expense.lineItems[i].tracking.length > 0) {
                                //If line item has more than one category
                                for (let x = 0; x < Expense.lineItems[i].tracking.length; x++) {
                                    const getCategory = await getCategoryByCategoryIDAndParentName(Expense.lineItems[i].tracking[x].option, Expense.lineItems[i].tracking[x].trackingCategoryID, company_id);
                                    console.log("getCategoryByCategoryIDAndParentName",getCategory);
                                    if(getCategory.length > 0) {
                                        if(getCategory[0].category_type === "Departments") {
                                            category1 = getCategory[0].id;
                                        }
                                        else if(getCategory[0].category_type === "Locations") {
                                            category2 = getCategory[0].id;
                                        }
                                    }
                                }
                            }

                            //Store payment details
                            let is_paid = "false";
                            let payment_ref_number = null;
                            let paid_amount = null;
                            let payment_date = null;
                            if (Expense.payments.length > 0) {
                                is_paid = "true";
                                payment_ref_number = Expense.payments[0].reference;
                                paid_amount = Expense.payments[0].amount;
                                payment_date = Expense.payments[0].date;
                            }
                            const checkExpenseResult = await checkExpense(Expense.invoiceID, i, company_id);
                            if (checkExpenseResult[0].expense_count === 0) {
                                await addExpense(
                                    Expense.invoiceID,
                                    i,
                                    Expense.lineItems[i].description?Expense.lineItems[i].description:null,
                                    Expense.date?Expense.date:null,
                                    Expense.updatedDateUTC?Expense.updatedDateUTC:null,
                                    Expense.currencyCode?Expense.currencyCode:null,
                                    Expense.type?Expense.type:null,
                                    account_id?account_id:null,
                                    supplier_id?supplier_id:null,
                                    supplier_name?supplier_name:null,
                                    category1?category1:null,
                                    category2?category2:null,
                                    Expense.lineItems[i].lineAmount?Expense.lineItems[i].lineAmount:0,
                                    Expense.lineItems[i].taxAmount?Expense.lineItems[i].taxAmount:null,
                                    is_paid?is_paid:null,
                                    payment_ref_number?payment_ref_number:null,
                                    paid_amount?paid_amount:null,
                                    payment_date?payment_date:null,
                                    company_id,
                                    'xero',
                                    user_id
                                );
                            }
                            else {
                                await updateExpense(
                                    Expense.invoiceID,
                                    i,
                                    Expense.lineItems[i].description?Expense.lineItems[i].description:null,
                                    Expense.date?Expense.date:null,
                                    Expense.updatedDateUTC?Expense.updatedDateUTC:null,
                                    Expense.currencyCode?Expense.currencyCode:null,
                                    Expense.type?Expense.type:null,
                                    account_id?account_id:null,
                                    supplier_id?supplier_id:null,
                                    supplier_name?supplier_name:null,
                                    category1?category1:null,
                                    category2?category2:null,
                                    Expense.lineItems[i].lineAmount?Expense.lineItems[i].lineAmount:0,
                                    Expense.lineItems[i].taxAmount?Expense.lineItems[i].taxAmount:null,
                                    is_paid?is_paid:null,
                                    payment_ref_number?payment_ref_number:null,
                                    paid_amount?paid_amount:null,
                                    payment_date?payment_date:null,
                                    company_id,
                                    'xero',
                                );
                            }
                            // const addExpenseResult = await addExpense(Expense.invoiceID, 1, Expense.date, Expense.updatedDateUTC, null, vn[0].vendor_id !== undefined ? vn[0].vendor_id : null, vn[0].name !== undefined ? vn[0].name : null, Expense.currencyCode, Expense.type, Expense.lineItems[0].accountCode, null, Expense.lineItems[0].description, category !== null ? (category !== undefined ? category[0].depart_id:null) : null, location !== null ? location[0].depart_id : null, Expense.lineItems[0].lineAmount , Expense.lineItems[0].taxAmount, is_paid, payment_ref_number, paid_amount, payment_date, company_id, user_id)
                            console.log("xero expense added", Expense.invoiceID);
                        }
                    }

                    //Store expense Attachments
                    if (Expense.hasAttachments === true) {
                        let attachments = [];
                        // const getExpenseAttachmentsResult = await getExpenseAttachments(Expense.invoiceID,company_id);
                        // console.log("getExpenseAttachmentsResult",getExpenseAttachmentsResult);
                        // if(getExpenseAttachmentsResult[0].attachments!==null) {
                        //     attachments = JSON.parse(getExpenseAttachmentsResult[0].attachments);
                        // }
                        // else {
                        //     attachments = [];
                        // }
                        console.log("attachments",attachments);

                        const response = await xero.accountingApi.getInvoiceAttachments(tenant, Expense.invoiceID);
                        const res = response.body.attachments;
                        for (let i = 0; i < res.length; i++) {
                            // let checkAttachableResult = await checkAttachable(res[i].attachmentID, Expense.invoiceID);
                            // if (checkAttachableResult[0].attachable_count === 0) {
                                attachments.push({"attachable_id":res[i].attachmentID,"file_name":res[i].fileName,"url":res[i].url});
                                // const addAttachableResult = await addAttachable(Expense.invoiceID, company_id, res[i].fileName, res[i].url, res[i].contentLength, res[i].attachmentID);
                                console.log("attachable added for expense",Expense.invoiceID," ",res[i].fileName)
                            // }
                            // else {
                            //     let indexOfAttachment = attachments.findIndex(el => el.attachable_id === res[i].attachmentID);
                            //     attachments[indexOfAttachment].file_name = res[i].fileName;
                            //     attachments[indexOfAttachment].url = res[i].url;
                            //     // const updateAttachableResult = await updateAttachable(Expense.invoiceID, company_id, res[i].fileName, res[i].url, res[i].contentLength, res[i].attachmentID);
                            //     console.log("attachable updated for expense",Expense.invoiceID," ",res[i].fileName)
                            // }
                        }

                        await updateExpenseAttachments(Expense.invoiceID, JSON.stringify(attachments),company_id);
                        console.log("attachments of expense ",Expense.invoiceID,",",JSON.stringify(attachments));
                    }
                }
        }

        await storeActivity("Expenses Synced", "-", "Expense", company_id, user_id);
        return {
            status: 200,
            message: "Expenses synced successfully!"
        }
    } catch (err) {
        console.log("error", err);
        return {
            status: 500,
            message: err
        };
    }
}

async function sendEmail(email, first_name) {
    try {
        console.log("sending email to", email);
        let transporter = nodeMailer.createTransport({
            host: "smtp.mail.yahoo.com",
            port: 465,
            auth: {
                user: "mohsinjaved414@yahoo.com",
                pass: "exvnhtussrqkmqcr"
            },
            debug: true, // show debug output
            logger: true
        });
        let href = process.env.APP_URL + "login";
        let html = template("admin_sign_up", first_name, href);
        let mailOptions = {
            from: 'mohsinjaved414@yahoo.com',
            to: email,
            subject: subject.admin_sign_up,
            html: html
        };
        await transporter.sendMail(mailOptions);

        return {
            status: 200,
            message: "Email sent successfully"
        };
    }
    catch (err) {
        return {
            status: 500,
            message: err
        };
    }
}

let request_type = null;
module.exports = {
    auth: async (req, res) => {
        try {
            request_type = req.params.request_type;
            console.log("request_type",request_type);
            if(request_type === "login") {
                let consentUrl = await xeroLogin.buildConsentUrl();
                return res.redirect(consentUrl);
            }
            else if(request_type === "sign-up" || request_type === "connect") {
                let consentUrl = await xero.buildConsentUrl();
                return res.redirect(consentUrl);
            }
        }
        catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    callback: async (req, res) => {
        try {
            tokenSet = await xeroLogin.apiCallback(req.url);
            console.log("tokenSet", tokenSet)

            const token = crypto.randomBytes(48).toString('hex');


            let array = JSON.parse(JSON.stringify(tokenSet));
            xero_access_token = array.access_token;
            xero_refresh_token = array.refresh_token;
            xero_id_token = array.id_token;
            xero_expire_at = array.expires_at;

            TS = new TokenSet({
                id_token: xero_id_token,
                access_token: xero_access_token,
                refresh_token: xero_refresh_token,
                token_type: "Bearer",
                scope: scope,
            });

            await xeroLogin.setTokenSet(TS);
            const jwtTokenDecode = jwt.decode(xero_id_token);

            let tenant = await xero_get_tenant(xero_access_token);
            // console.log("tenant",tenant);
            let tenantArray = JSON.parse(tenant);

            let email = jwtTokenDecode.email;
            let xero_user_id = jwtTokenDecode.xero_userid;
            let first_name = jwtTokenDecode.given_name;
            let last_name = jwtTokenDecode.family_name;
            let name = jwtTokenDecode.name;



            console.log("email",email);
            // let user = await getUserByEmail(email);
            // console.log("user",user);


            if (request_type === "login") {
                if (tenantArray.length > 0) {
                    console.log("tenantArray",tenantArray);
                    console.log("tenantArray",tenantArray[0].tenantId);
                    const checkCompanyExistResult = await checkCompanyExist(tenantArray[0].tenantId);
                    const getCompanyByTenantIdResult = await getCompanyByTenant(tenantArray[0].tenantId);
                    console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult)
                    console.log("checkCompanyExistResult",checkCompanyExistResult)
                    let getUserData;
                    if(checkCompanyExistResult[0].company_count === 1) {
                        getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);
                    }
                    else {
                        getUserData = null;
                    }
                    console.log("getUserData",getUserData);
                    console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult);
                    if(checkCompanyExistResult[0].company_count === 0) {
                        return res.redirect(`${process.env.APP_URL}login/error/404`);
                    }
                    else {
                        if(getUserData[0].role_id === 1 && getUserData[0].user_type === "xero" && getUserData[0].status === 1) {
                            console.log("user exist and status is 1");
                            for (const tenant of tenantArray) {
                                console.log("tenant data while login", tenant);
                                const currencyResponse = await xeroLogin.accountingApi.getCurrencies(tenant.tenantId, null, null);
                                console.log("currencyResponse",currencyResponse);
                                const updateAllCompaniesResult = await updateAllCompanies(tenant.tenantId, tenant.tenantName, currencyResponse.body.currencies[0].code);
                            }
                            const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                            let user_id = getUserData[0].id;
                            // Disable all companies in xero and then enable current selected one.
                            const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
                            const disableAllCompanyResult = await disableAllCompany(user_id);
                            const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                            console.log("user already exist");
                            console.log("redirecting to",`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token)
                            return res.redirect(`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token);
                        }
                        else if (getUserData[0].role_id === 1 && getUserData[0].user_type === "xero" && getUserData[0].status === 0) {
                            console.log("user do not exist and status is 0");
                            return res.redirect(`${process.env.APP_URL}login/error/1003`);
                            //Check if user exist as a xero user but status is 0
                        }
                    }
                }
                else {
                    console.log("checkUserEmailResult",email)
                    const checkUserEmailResult = await checkUserEmail(email);
                    const getUserData = await getUserByEmail(email);
                    console.log("checkUserEmailResult",checkUserEmailResult)
                    console.log("getUserData",getUserData)
                    if(checkUserEmailResult[0].user_count === 1 && getUserData.role_id === 1 && getUserData.status === 0) {
                        return res.redirect(`${process.env.APP_URL}login/error/1003`);
                    }
                    else if(checkUserEmailResult[0].user_count === 0) {
                        return res.redirect(`${process.env.APP_URL}login/error/404`);
                    }

                }
            }
            else {
                return res.redirect(`${process.env.APP_URL}login/error/500`);
            }
        }
        catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    signUpCallBack: async (req, res) => {
        try {
            // if (checkUserEmailResult[0].count_user === 0) {
            //Sign up Execution
            tokenSet = await xero.apiCallback(req.url);
            const token = crypto.randomBytes(48).toString('hex');

            console.log("tokenSet", tokenSet)

            let array = JSON.parse(JSON.stringify(tokenSet));
            xero_access_token = array.access_token;
            xero_refresh_token = array.refresh_token;
            xero_id_token = array.id_token;
            xero_expire_at = array.expires_at;

            TS = new TokenSet({
                id_token: xero_id_token,
                access_token: xero_access_token,
                refresh_token: xero_refresh_token,
                token_type: "Bearer",
                scope: scope
            });

            await xero.setTokenSet(TS);

            // console.log("Token set data: ", xero.readTokenSet());
            const jwtTokenDecode = jwt.decode(xero_id_token);
            const activeTenant = await xero_get_tenant(xero_access_token);

            // await xero_get_tenant(xero_access_token);

            let email = jwtTokenDecode.email;
            let xero_user_id = jwtTokenDecode.xero_userid;
            let first_name = jwtTokenDecode.given_name;
            let last_name = jwtTokenDecode.family_name;
            // let name = jwtTokenDecode.name;

            let tenantArray = JSON.parse(activeTenant);

            // const checkUserEmailForQuickbooksResult = await checkUserEmailForQuickbooks(email);


            console.log("total tenants",tenantArray.length);


            if(tenantArray.length > 0) {
                if (request_type === "sign-up") {
                    const checkUserEmailResult = await checkUserEmail(email);
                    const getUserData = await getUserByEmail(email);
                    if(checkUserEmailResult[0].user_count === 1 && getUserData.role_id === 2) {
                        //Check if user is not a normal user
                        return res.redirect(`${process.env.APP_URL}login/error/1002`);
                    }
                    else{
                        if(checkUserEmailResult[0].user_count === 1 && getUserData.role_id === 1 && getUserData.user_type === "quickbooks") {
                            //check if user is not a qb user
                            return res.redirect(`${process.env.APP_URL}login/error/1001`);
                        }
                        else {
                            let isCompanyFound = false;
                            let user_id;
                            let company_id;
                            for (let i = 0; i < tenantArray.length; i++) {
                                //Loop all companies
                                const checkCompanyExistResult = await checkCompanyExist(tenantArray[i].tenantId);
                                if(checkCompanyExistResult[0].company_count === 0) {
                                    //company do not exist so we get user by its email
                                    const getUserData = await getUserByEmail(email);
                                    const checkUserByEmailResult = await checkUserEmail(email);
                                    if (checkUserByEmailResult[0].user_count === 0) {
                                        //if email fo not found then we create an user account
                                        const createUsersResult = await createUserAccount(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, "xero");
                                        user_id = createUsersResult.insertId;
                                    }
                                    else{
                                        //if email found then we get user by his email
                                        user_id = getUserData.id;
                                    }
                                    //get currency of company
                                    const currencyResponse = await xero.accountingApi.getCurrencies(tenantArray[i].tenantId, null, null);
                                    const createCompanyResult = await createCompany(tenantArray[i].tenantName, tenantArray[i].id, tenantArray[i].tenantId, null, null, "xero", currencyResponse.body.currencies?currencyResponse.body.currencies[0].code:null,  user_id, tenantArray[i].createdDateUtc);
                                    console.log("company created",tenantArray[i].tenantName)
                                    const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
                                    console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
                                    company_id = createCompanyResult.insertId;

                                    const updateXeroAccountEmailResult = await updateAccountEmail(user_id, email);
                                    //Here we put the fetching function to fetch all data from user's xero account.
                                    await syncCategories(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                        await syncSuppliers(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                            await syncAccounts(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                                await syncExpenses(user_id, company_id, tenantArray[i].tenantId, "all").then(() => {
                                                    storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
                                                });
                                            })
                                        })
                                    });
                                }
                                else {
                                    //if company exist then we just refresh its token
                                    isCompanyFound = true;
                                    const getCompanyByTenantIdResult = await getCompanyByTenant(tenantArray[i].tenantId);
                                    let getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);
                                    const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
                                    const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                                    const currencyResponse = await xero.accountingApi.getCurrencies(tenantArray[i].tenantId, null, null);
                                    const updateAllCompaniesResult = await updateAllCompanies(tenantArray[i].tenantId, tenantArray[i].tenantName, currencyResponse.body.currencies[0].code);
                                }
                            }
                            //update login token to login or connect and then activate first tenant of user
                            const updateLoginTokenResult = await updateLoginToken(user_id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                            const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
                            const disableAllCompanyResult = await disableAllCompany(user_id);
                            const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);

                            if(isCompanyFound) {
                                // redirect as login if user's any company found
                                console.log(`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token);
                                return res.redirect(`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token);
                            }
                            else {
                                // redirect as sign up if user is a fresh user
                                console.log("redirecting to ",`${process.env.APP_URL}auth/sign-up/xero/` + encodeURIComponent(email) + `/` + token);
                                return res.redirect(`${process.env.APP_URL}auth/sign-up/xero/` + encodeURIComponent(email) + `/` + token);
                            }
                        }
                    }
                }
                else if (request_type === "connect") {
                    let user_id;
                    let company_id;
                    for (let i = 0; i < tenantArray.length; i++) {
                        const checkCompanyExistResult = await checkCompanyExist(tenantArray[i].tenantId);
                        if(checkCompanyExistResult[0].company_count === 0) {
                            const getUserData = await getUserByEmail(email);
                            console.log("getUserData while connecting",getUserData);
                            const checkUserByEmailResult = await checkUserEmail(email);
                            if (checkUserByEmailResult[0].user_count === 0) {
                                const createUsersResult = await createUserAccount(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, "xero");
                                user_id = createUsersResult.insertId;
                            }
                            else{
                                user_id = getUserData[0].id;
                            }
                            const currencyResponse = await xero.accountingApi.getCurrencies(tenantArray[i].tenantId, null, null);
                            const createCompanyResult = await createCompany(tenantArray[i].tenantName, tenantArray[i].id, tenantArray[i].tenantId, null, null, "xero", currencyResponse.body.currencies?currencyResponse.body.currencies[0].code:null,  user_id, tenantArray[i].createdDateUtc);
                            console.log("company created",tenantArray[i].tenantName)
                            const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
                            console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
                            company_id = createCompanyResult.insertId;

                            //Here we put the fetching function to fetch all data from user's xero account.
                            await syncCategories(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                await syncSuppliers(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                    await syncAccounts(user_id, company_id, tenantArray[i].tenantId).then(async () => {
                                        await syncExpenses(user_id, company_id, tenantArray[i].tenantId, "all").then(() => {
                                            storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
                                        });
                                    })
                                })
                            });
                        }
                        else {
                            const getCompanyByTenantIdResult = await getCompanyByTenant(tenantArray[i].tenantId);
                            let getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);

                            const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
                            const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
                            const currencyResponse = await xero.accountingApi.getCurrencies(tenantArray[i].tenantId, null, null);
                            const updateAllCompaniesResult = await updateAllCompanies(tenantArray[i].tenantId, tenantArray[i].tenantName, currencyResponse.body.currencies[0].code);
                        }
                    }

                    return res.redirect(`${process.env.APP_URL}companies`);
                }
            }
            else {
                return res.redirect(`${process.env.APP_URL}login/error/1000`);
            }

            //Check if any tenant exist in xero account
            // if (tenantArray.length > 0) {
            //     // const checkUserEmailResult = await checkUserEmail(email);
            //     // const getUserData = await getUserByEmail(email);
            //     // console.log("getUserData",getUserData);
            //     const checkCompanyExistResult = await checkCompanyExist(tenantArray[0].tenantId);
            //     const getCompanyByTenantIdResult = await getCompanyByTenant(tenantArray[0].tenantId);
            //     console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult)
            //     console.log("checkCompanyExistResult",checkCompanyExistResult)
            //     let getUserData;
            //     if(checkCompanyExistResult[0].company_count === 1) {
            //         getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);
            //     }
            //     else {
            //         getUserData = null;
            //     }
            //     console.log("tenantArray",tenantArray);
            //     console.log("getUserData",getUserData);
            //     console.log("checkCompanyExistResult",checkCompanyExistResult);
            //     if(checkCompanyExistResult[0].company_count === 1) {
            //         console.log("checkUserEmailResult",checkCompanyExistResult);
            //         if(request_type === "sign-up" || request_type === "connect" && getUserData[0].role_id !== 2) {
            //             console.log("user is admin", getUserData[0].role_id);
            //             if(request_type === "sign-up" || request_type === "connect" && getUserData[0].role_id === 1 && getUserData[0].user_type !== "quickbooks") {
            //                 console.log("user is not an qb user");
            //                 if(request_type === "sign-up" && getUserData[0].role_id === 1 && getUserData[0].user_type === "xero" && getUserData[0].status === 1) {
            //                     const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
            //                     console.log("user exist and status is 1");
            //                     for (const tenant of tenantArray) {
            //                         const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId, null, null);
            //                         const updateAllCompaniesResult = await updateAllCompanies(tenant.tenantId, tenant.tenantName, currencyResponse.body.currencies[0].code);
            //                     }
            //                     const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
            //                     let user_id = getUserData[0].id;
            //                     // Disable all companies in xero and then enable current selected one.
            //                     const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
            //                     const disableAllCompanyResult = await disableAllCompany(user_id);
            //                     const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
            //                     console.log("user already exist");
            //                     console.log("redirecting to",`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token)
            //                     return res.redirect(`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token);
            //                 }
            //                 else if (request_type === "sign-up" && getUserData[0].role_id === 1 && getUserData[0].user_type === "xero" && getUserData[0].status === 0) {
            //                     console.log("user do not exist and status is 0");
            //                     return res.redirect(`${process.env.APP_URL}login/error/1003`);
            //                     //Check if user exist as a xero user but status is 0
            //                 }
            //                 else if (request_type === "connect" && getUserData[0].role_id === 1 && getUserData[0].user_type === "xero") {
            //                     const checkCompanyExistResult = await checkCompanyExist(tenantArray[0].tenantId);
            //                     if (checkCompanyExistResult[0].company_count === 1) {
            //                         console.log("user is connecting a company but it is already exist in out db")
            //                         return res.redirect(`${process.env.APP_URL}companies`);
            //                     }
            //                     else if (checkCompanyExistResult[0].company_count === 0) {
            //                         console.log("user is connecting a company but its not exist in out db so we are creating new company")
            //                         // const createUsersResult = await createUserAccount(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, "xero");
            //                         // let user_id = createUsersResult.insertId;
            //                         let company_id = null;
            //                         let user_id = getUserData[0].id;
            //                         const currencyResponse = await xero.accountingApi.getCurrencies(tenantArray[0].tenantId, null, null);
            //                         // console.log("currency...",checkUserCompanyResult.body?checkUserCompanyResult.body.currencies[0].code:"undefined");
            //                         const createCompanyResult = await createCompany(tenantArray[0].tenantName, tenantArray[0].id, tenantArray[0].tenantId, null, null, "xero", currencyResponse.body.currencies?currencyResponse.body.currencies[0].code:null,  user_id, tenantArray[0].createdDateUtc);
            //                         console.log("company created",tenantArray[0].tenantName)
            //                         const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
            //                         console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
            //                         company_id = createCompanyResult.insertId;
            //
            //                         //Here we put the fetching function to fetch all data from user's xero account.
            //                         await syncCategories(user_id, company_id, tenant.tenantId).then(async () => {
            //                             await syncSuppliers(user_id, company_id, tenant.tenantId).then(async () => {
            //                                 await syncAccounts(user_id, company_id, tenant.tenantId).then(async () => {
            //                                     await syncExpenses(user_id, company_id, tenant.tenantId, "all").then(() => {
            //                                         storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
            //                                     });
            //                                 })
            //                             })
            //                         });
            //
            //                         return res.redirect(`${process.env.APP_URL}companies`);
            //                         // return res.redirect(`${process.env.APP_URL}auth/login/xero/` + encodeURIComponent(email) + `/` + token);
            //                     }
            //                 }
            //             }
            //             else {
            //                 //Check if user exist as a quickbook user
            //                 return res.redirect(`${process.env.APP_URL}login/error/1001`);
            //             }
            //         }
            //         else {
            //             //Check if user exist as an user
            //             return res.redirect(`${process.env.APP_URL}login/error/1002`);
            //         }
            //     }
            //     else if (checkCompanyExistResult[0].company_count === 0) {
            //         //Check if user exist in our db, 0 = not exist . then create new xero user
            //         console.log("user_count",0)
            //         console.log("creating xero account...");
            //         let user_id;
            //         let checkUserByEmail = await checkUserEmail(email);
            //         if(checkUserByEmail[0].user_count === 0) {
            //             const createUsersResult = await createUserAccount(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, "xero");
            //             user_id = createUsersResult.insertId;
            //         }
            //         else {
            //             let getUserByEmailResult = await getUserByEmail(email);
            //             console.log("getUserByEmailResult",getUserByEmailResult);
            //             user_id = getUserByEmailResult.id;
            //             console.log("updateLoginToken");
            //             const updateLoginTokenResult = await updateLoginToken(getUserByEmailResult.id, token, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, 1);
            //         }
            //
            //         console.log("tenants...",tenantArray);
            //         for (const tenant of tenantArray) {
            //             const checkUserCompanyResult = await checkUserCompanyByTenant(tenant.tenantId);
            //             let company_id= null;
            //             if (checkUserCompanyResult[0].company_count === 0) {
            //                 console.log("company count",0)
            //                 const currencyResponse = await xero.accountingApi.getCurrencies(tenant.tenantId, null, null);
            //                 console.log("currency...",checkUserCompanyResult.body?checkUserCompanyResult.body.currencies[0].code:"undefined");
            //                 const createCompanyResult = await createCompany(tenant.tenantName, tenant.id, tenant.tenantId, null, null, "xero", currencyResponse.body.currencies?currencyResponse.body.currencies[0].code:null,  user_id, tenant.createdDateUtc);
            //                 console.log("company created",tenant.tenantName)
            //                 const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
            //                 console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
            //                 company_id = createCompanyResult.insertId;
            //             }
            //
            //             //Here we put the fetching function to fetch all data from user's xero account.
            //             await syncCategories(user_id, company_id, tenant.tenantId).then(async () => {
            //                 await syncSuppliers(user_id, company_id, tenant.tenantId).then(async () => {
            //                     await syncAccounts(user_id, company_id, tenant.tenantId).then(async () => {
            //                         await syncExpenses(user_id, company_id, tenant.tenantId, "all").then(() => {
            //                             storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
            //                         });
            //                     })
            //                 })
            //             });
            //         }
            //
            //         // Disable all companies in xero and then enable current selected one.
            //         const getCompanyByTenantResult = await getCompanyByTenant(tenantArray[0].tenantId);
            //         const disableAllCompanyResult = await disableAllCompany(user_id);
            //         const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
            //
            //         console.log("sending email....");
            //         // const sendEmailResult = await sendEmail(email, first_name);
            //         // console.log("sendEmailResult",sendEmailResult);
            //         console.log("redirecting to ",`${process.env.APP_URL}auth/sign-up/xero/` + encodeURIComponent(email) + `/` + token);
            //         return res.redirect(`${process.env.APP_URL}auth/sign-up/xero/` + encodeURIComponent(email) + `/` + token);
            //     }
            // }
            // else {
            //     return res.redirect(`${process.env.APP_URL}login/error/1000`);
            // }
        } catch (err) {
            console.log("ERROR IN XERO SIGN UP")
            console.log(err);
            return res.redirect(`${process.env.APP_URL}sign-up`);
        }
    },
    disconnect: async (req, res) => {
        try{
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;

            const token = await refreshToken(user_id);

            console.log("token", token);

            const company = await getCompanyByID(company_id);
            const user = await getUserById(user_id);



            let uc_length = null;
            let uc_active_company = null;

            await xero_remove_connection(user[0].xero_access_token, company[0].connection_id).then(async (res) => {
                console.log('Tokens revoked : ' + res);
                const setForeignKeyResult1 = await setForeignKeyDisable('companies');
                const setForeignKeyResult2 = await setForeignKeyDisable('expenses');
                const setForeignKeyResult4 = await setForeignKeyDisable('users');
                const setForeignKeyResult5 = await setForeignKeyDisable('accounts');
                const setForeignKeyResult6 = await setForeignKeyDisable('categories');
                const setForeignKeyResult7 = await setForeignKeyDisable('suppliers');
                const setForeignKeyResult8 = await setForeignKeyDisable('attachables');
                const setForeignKeyResult9 = await setForeignKeyDisable('user_relations');
                await removeExpenses(company_id).then(async () => {
                    await removeUserRelations(company_id).then(async () => {
                        await removeActivities(company_id).then(async () => {
                            await removeSuppliers(company_id).then(async () => {
                                await removeAccounts(company_id).then(async () => {
                                    await removeAttachables(company_id).then(async () => {
                                        await removeCategories(company_id).then(async () => {
                                            await removeUsersOfCompany(company_id).then(async () => {
                                                await removeCompany(company_id).then(async () => {
                                                    const setForeignKeyResult1 = await setForeignKeyEnable('companies');
                                                    const setForeignKeyResult2 = await setForeignKeyEnable('expenses');
                                                    const setForeignKeyResult3 = await setForeignKeyEnable('users');
                                                    const setForeignKeyResult5 = await setForeignKeyEnable('accounts');
                                                    const setForeignKeyResult6 = await setForeignKeyEnable('categories');
                                                    const setForeignKeyResult7 = await setForeignKeyEnable('suppliers');
                                                    const setForeignKeyResult8 = await setForeignKeyEnable('attachables');
                                                    const setForeignKeyResult9 = await setForeignKeyEnable('user_relations');
                                                    const user_companies_after_deletion = await getCompanyByUserID(user_id);
                                                    uc_length = user_companies_after_deletion.length;
                                                    uc_active_company = user_companies_after_deletion[0].id;
                                                    if (user_companies_after_deletion.length > 1) {
                                                        console.log("user_companies", user_companies_after_deletion);
                                                        const disableAllCompanyResult = await disableAllCompany(user_id);
                                                        const activateCompanyResult = await activateCompany(user_companies_after_deletion[0].id);
                                                    } else {
                                                        console.log("change user status to 0");
                                                        const updateUserStatusResult = await updateUserStatus(user_id, 0);
                                                        console.log("updateUserStatus");
                                                    }
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                });
            }).catch((e) => {
                console.log(e);
                // console.log(e.authResponse.response.Url);
                // console.log(e.authResponse.response.rawHeaders);
            });
            let message;
            if(uc_length === 0) {
                message = "You have disconnect all of your companies from WePull. Please sign up again."
            }
            else {
                message =  company[0].company_name + " has been disconnected from WePull."
            }



            return res.json({
                status: 200,
                message: message,
                connection_id: company[0].connection_id,
                companies: uc_length,
                active_company: uc_active_company
            });

        }
        catch (e) {
            return res.json({
                status: 500,
                message: e
            })
        }
    },
    syncAll: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;

            console.log("syncAll user_id", user_id)
            console.log("syncAll company_id", company_id)

            const token = await refreshToken(user_id);

            const company = await getCompanyByID(company_id);
            const user = await getUserById(user_id);

            console.log("syncAll user", user)
            console.log("syncAll company", company)

            console.log("token", token);

            let access_token = user[0].xero_access_token;
            let tenant_id = company[0].tenant_id;

            console.log("access_token", access_token);
            console.log("tenant_id", tenant_id);

            await syncCategories(user_id, company_id, tenant_id).then(async () => {
                await syncSuppliers(user_id, company_id, tenant_id).then(async () => {
                    await syncAccounts(user_id, company_id, tenant_id).then(async () => {
                        await syncExpenses(user_id, company_id, tenant_id, "week").then(() => {
                            storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
                        });
                    })
                })
            });

            return res.json({
                status: 200,
                message: "All data synced successfully"
            });
        }
        catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    },
    viewAttachment: async(req, res) => {
        try {
            const user_id = req.params.user_id;
            const expense_id = req.params.expense_id;
            const company_id = req.params.company_id;
            const attachment_id = req.params.attachment_id;

            console.log("user_id", user_id);
            console.log("expense_id", expense_id);
            console.log("company_id", company_id);
            console.log("attachment_id", attachment_id);

            const company = await getCompanyById(company_id);
            console.log("company",company);

            const user = await getUserById(user_id);
            console.log("user", user)

            //Check if token expired , if expire then we refresh the token and return tokenSet
            const refreshTokenResult = await refreshToken(user_id);
            console.log("refreshTokenResult",refreshTokenResult);
            await xero.setTokenSet(refreshTokenResult.TS);
            console.log("xero token expire?",xero.readTokenSet().expired());

            const contentType = 'image/jpg';
            console.log(company[0].tenant_id, expense_id, attachment_id, contentType);
            const response = await xero.accountingApi.getInvoiceAttachmentById(company[0].tenant_id, expense_id, attachment_id, contentType);
            console.log("statusCode",response.response.statusCode);
            console.log("image", response.body);
            return res.json({
                status: 200,
                data: response.body
            });
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log(err);
            return res.json({
                status: 500,
                message: "Loading attachment failed"
            })
        }
    }
};