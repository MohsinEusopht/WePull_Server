const {hashSync,genSaltSync,compareSync} = require("bcrypt");
const crypto = require('crypto');
const timeout = require('request-timeout');
const{

} = require("./quickbooks.service");


const jwt = require('jsonwebtoken');
const convert = require('xml-js');
const request = require('request');
const moment = require('moment-timezone');
const {sign} = require("jsonwebtoken");
const OAuthClient = require('intuit-oauth');
const parseString = require('xml2js').parseString;
const nodeMailer = require("nodemailer");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const {subject, template} = require('../assets/mailConfig');

const {
    updateLoginToken,
    storeActivity,
    createUserAccount,
    checkUserEmail,
    checkCompanyExist,
    getUserById,
    getUserByEmail,
    updateAccountEmail,
    checkUserCompanyByTenant,
    createCompany,
    createUserRole,
    updateQuickbooksCompanyToken,
    checkAccount,
    createAccount,
    updateAccount,
    checkCategory,
    addCategory,
    updateCategory,
    checkSupplier,
    addSupplier,
    updateSupplier,
    checkExpense,
    addExpense,
    updateExpense,
    getExpenseAttachments,
    checkAttachable,
    updateExpenseAttachments,
    getSupplierBySupplierID,
    getAccountByAccountID,
    getCategoryByCategoryID,
    disableAllCompany,
    activateCompany,
    getCompanyByTenant,
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
    getActivateCompany,
    updateCompanyToken,
    getCompanyById,
    getCompanyUsers,
    getSubscription,
    deleteUserSubscription
} = require("../users/user.service");


let oauth2_token_json = null;

let qb_access_token = null;
let qb_refresh_token = null;
let qb_id_token = null;
let qb_expire_at = null;

let oauthClient = new OAuthClient({
    clientId: process.env.QUICKBOOK_CLIENT_ID,            // enter the apps `clientId`
    clientSecret: process.env.QUICKBOOK_SECRET_ID,    // enter the apps `clientSecret`
    environment: 'sandbox',     // enter either `sandbox` or `production`
    redirectUri: process.env.QUICKBOOK_REDIRECT_URI,    // enter the redirectUri
    // logging: true                               // by default the value is `false`
});


function isEmptyObject(obj) {
    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}

//Fetching functions
async function getUser(access_token){
    let bearer = 'Bearer ' + access_token;
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'url': "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo",
        'headers': {
            'Authorization': bearer,
        }
    };

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                // console.log("response:", res);
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}
async function getCompany(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}v3/company/${companyID}/companyinfo/${companyID}`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                //console.log(result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

}
async function revoke_token(access_token) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    // let query = 'select * from Account where Active = true';
    // console.log(bearer);
    let options = {
        'method': 'POST',
        'url': `https://developer.api.intuit.com/v2/oauth2/tokens/revoke`,
        'body': {
            access_token : access_token
        },
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    // let array = [];
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            console.log("revoke result" ,res);
            if (!error) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

}
async function getAccounts(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from Account where Active = true';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    // let array = [];
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("account result" ,result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });

}
async function getPurchases(access_token, companyID, condition) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let date = moment(new Date()).subtract(1, 'week').toISOString();
    let bearer = 'Bearer ' + access_token;
    let query;
    if(condition === "week") {
        query = `select * from Purchase where MetaData.LastUpdatedTime >= '${date}'`;
    }
    else if (condition === "all") {
        query = 'select * from Purchase';
    }

    // console.log("query of purchase", query);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("result",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getBills(access_token, companyID, condition) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let date = moment(new Date()).subtract(1, 'week').toISOString();
    let bearer = 'Bearer ' + access_token;
    let query;
    if(condition === "week") {
        query = `select * from bill where MetaData.LastUpdatedTime >= '${date}'`;
    }
    else if (condition === "all") {
        query = 'select * from bill';
    }
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];

    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("account result" ,result);
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}
async function getCategories(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from Department WHERE Active IN (true,false)';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                console.log("Departments",result)
                resolve(result);
            } else {
                console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getClasses(access_token, companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select  * from Class WHERE Active IN (true,false)';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("Departments",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getSuppliers(access_token, companyID, condition) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;

    let query;
    if(condition === "today") {
        query = `select * from vendor WHERE Active IN (true,false) and MetaData.LastUpdatedTime >= '${new Date().toISOString()}'`;
    }
    else if (condition === "all") {
        query = 'select * from vendor WHERE Active IN (true,false)';
    }

    // let query = 'select * from vendor WHERE Active IN (true,false)';
    console.log("query", query);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                // console.log("Departments",result)
                resolve(result);
            } else {
                // console.log("result",error)
                reject(error);
            }
        });
    });
}
async function getAttachables(access_token, companyID, expense_id) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = `select * from attachable where AttachableRef.EntityRef.value = '${expense_id}'`;
    console.log(query);
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    // console.log("attachable option:",options);
    let array = [];
    // console.log("result","fafa");
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                resolve(result);
            } else {
                reject(error);
                console.log("Error While fetching attachments",error)
            }
        });
    });
}
async function getAllAttachables(access_token,companyID) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = 'select * from attachable';
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                resolve(result);
            } else {
                reject(error);
            }
        });
    });
}
async function getAllAttachableImage(access_token,companyID,attachment_id) {
    const url =
        oauthClient.environment == 'sandbox'
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

    let bearer = 'Bearer ' + access_token;
    let query = `select TempDownloadUri from attachable where Id = '${attachment_id}'`;
    // console.log(bearer);
    let options = {
        'method': 'GET',
        'Accept': 'application/json',
        'url': `${url}/v3/company/${companyID}/query?query=${query}&minorversion=63`,
        'headers': {
            'Authorization': bearer,
        }
    };
    return new Promise(function (resolve, reject) {
        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                let result = convert.xml2json(body, {compact: true, spaces: 4});
                resolve(result);
            } else {
                console.log("error in request", error)
                reject(error);
            }
        });
    });
}

//Syncing functions
async function syncAccounts(user_id, company_id, accounts) {
    try {
        if(isEmptyObject(accounts) && accounts !== undefined && accounts.length > 0) {
            console.log("accounts is null");
        }
        else {
            for (const Account of accounts) {
                const checkAccountResult = await checkAccount(Account.Id._text, company_id);
                if (checkAccountResult[0].account_count === 0) {
                    // console.log(null, Account.Id._text, Account.Name._text, Account.Classification._text, Account.Active._text=="true"?1:0, null, Account.CurrencyRef._text, Account.MetaData.CreateTime._text, getCompanyByTenantResult[0].id, getUserByUserEmailResult.id,"quickbooks");
                    const createAccountResult = await createAccount(Account.Name._text, Account.Id._text, "quickbooks", Account.Classification._text, Account.CurrencyRef._text, Account.Active._text == "true" ? 1 : 0, company_id, user_id);
                    console.log("account created", Account.Name._text, Account.Id._text);
                } else {
                    const updateAccountResult = await updateAccount(Account.Name._text, Account.Id._text, Account.Classification._text, Account.CurrencyRef._text, Account.Active._text == "true" ? 1 : 0, company_id);
                    console.log("account updated", Account.Name._text, Account.Id._text);
                }
            }
        }

        await storeActivity("Accounts Synced", "-", "Account", company_id, user_id);
        return {
            status: 200,
            message: "Accounts synced successfully!"
        }
    } catch (e) {
        console.log("account error", e);
        return e;
    }
}

async function syncCategories(user_id, company_id, categories) {
    try {
        // console.log("syncCategories",categories[1])
        if(isEmptyObject(categories) && categories !== undefined && categories.length > 0) {
            console.log("categories is null");
        }
        else {
            if(categories.length > 1) {
                for (const Category of categories) {
                    const checkCategoryResult = await checkCategory(Category.Id._text, company_id);
                    console.log("check category id",Category.Id._text,"result",checkCategoryResult[0].category_count);
                    if (checkCategoryResult[0].category_count === 0) {
                        if (Category.SubDepartment._text.toString() === "true") {
                            const addCategoryResult = addCategory(Category.Name._text, Category.Id._text, Category.ParentRef?Category.ParentRef._text:null, Category.Active._text === "true" ? 1 : 0, null, null, "Department", user_id, company_id);
                            console.log("category id", Category.Id._text);
                            console.log("category name", Category.Name._text);
                        }
                        else {
                            const addCategoryResult = addCategory(Category.Name._text, Category.Id._text, null, Category.Active._text === "true" ? 1 : 0, null, null, "Department", user_id, company_id);
                            console.log("category id", Category.Id._text);
                            console.log("category name", Category.Name._text);
                            console.log("")
                        }
                    } else {
                        if (Category.SubDepartment._text.toString() === "true") {
                            const updateCategoryResult = updateCategory(Category.Name._text, Category.Id._text, Category.ParentRef?Category.ParentRef._text:null, Category.Active._text === "true" ? 1 : 0, null, null, "Department", company_id);
                        }
                        else {
                            const updateCategoryResult = updateCategory(Category.Name._text, Category.Id._text, null, Category.Active._text === "true" ? 1 : 0, null, null, "Department", company_id);
                        }
                        console.log("category found...");
                        console.log("category id", Category.Id._text);
                        console.log("category name", Category.Name._text);
                        console.log("")
                    }
                }
            }
            else {
                //If departments have only one depart then object do not have array instead have ony one object
                const checkCategoryResult = await checkCategory(categories.Id._text, company_id);
                if (checkCategoryResult[0].category_count === 0) {
                    if (categories.SubDepartment._text.toString() === "true") {
                        const addCategoryResult = addCategory(categories.Name._text, categories.Id._text, categories.ParentRef?categories.ParentRef._text:null, categories.Active._text === "true" ? 1 : 0, null, null, "Department", user_id, company_id);
                        console.log("categories id", categories.Id._text);
                        console.log("categories name", categories.Name._text);
                    }
                    else {
                        const addCategoryResult = addCategory(categories.Name._text, categories.Id._text, null, categories.Active._text === "true" ? 1 : 0, null, null, "Department", user_id, company_id);
                        console.log("category id", categories.Id._text);
                        console.log("category name", categories.Name._text);
                        console.log("")
                    }
                } else {
                    if (categories.SubDepartment._text.toString() === "true") {
                        const updateCategoryResult = updateCategory(categories.Name._text, categories.Id._text, categories.ParentRef?categories.ParentRef._text:null, categories.Active._text === "true" ? 1 : 0, null, null, "Department", company_id);
                    }
                    else {
                        const updateCategoryResult = updateCategory(categories.Name._text, categories.Id._text, null, categories.Active._text === "true" ? 1 : 0, null, null, "Department", company_id);
                    }
                    console.log("category found...");
                    console.log("category id", categories.Id._text);
                    console.log("category name", categories.Name._text);
                    console.log("")
                }
            }
        }

        await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
        return {
            status: 200,
            message: "Categories synced successfully!"
        }
    } catch (e) {
        console.log("category error", e);
        return e;
    }
}

async function syncClasses(user_id, company_id, classes) {
    try {
        // console.log("syncClasses", classes)
        if (isEmptyObject(classes) && classes !== undefined && classes.length > 0) {
            console.log("classes is null");
        } else {
            if(classes.length > 1) {
                for (const Category of classes) {
                    const checkCategoryResult = await checkCategory(Category.Id._text, company_id);
                    console.log("check classes id",Category.Id._text,"result",checkCategoryResult[0].category_count);
                    if (checkCategoryResult[0].category_count === 0) {
                        if (Category.SubClass._text.toString() === "true") {
                            const addCategoryResult = addCategory(Category.Name._text, Category.Id._text, Category.ParentRef?Category.ParentRef._text:null, Category.Active._text === "true" ? 1 : 0, null, null, "Class", user_id, company_id);
                            console.log("classes id", Category.Id._text);
                            console.log("classes name", Category.Name._text);
                        }
                        else {
                            const addCategoryResult = addCategory(Category.Name._text, Category.Id._text, null, Category.Active._text === "true" ? 1 : 0, null, null, "Class", user_id, company_id);
                            console.log("classes id", Category.Id._text);
                            console.log("classes name", Category.Name._text);
                            console.log("")
                        }
                    } else {
                        if (Category.SubClass._text.toString() === "true") {
                            const updateCategoryResult = updateCategory(Category.Name._text, Category.Id._text, Category.ParentRef?Category.ParentRef._text:null, Category.Active._text === "true" ? 1 : 0, null, null, "Class", company_id);
                        }
                        else {
                            const updateCategoryResult = updateCategory(Category.Name._text, Category.Id._text, null, Category.Active._text === "true" ? 1 : 0, null, null, "Class", company_id);
                        }

                        console.log("category found...");
                        console.log("classes id", Category.Id._text);
                        console.log("classes name", Category.Name._text);
                        console.log("")
                    }
                }
            }
            else {
                //If departments have only one depart then object do not have array instead have ony one object
                const checkCategoryResult = await checkCategory(classes.Id._text, company_id);
                if (checkCategoryResult[0].category_count === 0) {
                    if (classes.SubClass._text.toString() === "true") {
                        const addCategoryResult = addCategory(classes.Name._text, classes.Id._text, classes.ParentRef?classes.ParentRef._text:null, classes.Active._text === "true" ? 1 : 0, null, null, "Class", user_id, company_id);
                        console.log("classes id", classes.Id._text);
                        console.log("classes name", classes.Name._text);
                    }
                    else {
                        const addCategoryResult = addCategory(classes.Name._text, classes.Id._text, null, classes.Active._text === "true" ? 1 : 0, null, null, "Class", user_id, company_id);
                        console.log("classes id", classes.Id._text);
                        console.log("classes name", classes.Name._text);
                        console.log("")
                    }
                } else {
                    if (classes.SubClass._text.toString() === "true") {
                        const updateCategoryResult = updateCategory(classes.Name._text, classes.Id._text, classes.ParentRef?classes.ParentRef._text:null, classes.Active._text === "true" ? 1 : 0, null, null, "Class", company_id);
                    }
                    else {
                        const updateCategoryResult = updateCategory(classes.Name._text, classes.Id._text, null, classes.Active._text === "true" ? 1 : 0, null, null, "Class", company_id);
                    }
                    console.log("classes found...");
                    console.log("classes id", classes.Id._text);
                    console.log("classes name", classes.Name._text);
                    console.log("")
                }
            }
        }

        await storeActivity("Categories Synced", "-", "Category", company_id, user_id);
        return {
            status: 200,
            message: "Categories synced successfully!"
        }
    }
    catch (e) {
        console.log("class error", e);
        return e;
    }
}

async function syncSuppliers(user_id, company_id, suppliers) {
    try {
        // console.log("syncSuppliers", suppliers)
        if (isEmptyObject(suppliers) && suppliers !== undefined && suppliers.length > 0) {
            console.log("suppliers is null");
        } else {
            for(const Supplier of suppliers) {
                const checkSupplierResult = await checkSupplier(Supplier.Id._text,company_id);
                if(checkSupplierResult[0].supplier_count === 0) {
                    const addSupplierResult = await addSupplier(Supplier.DisplayName._text, Supplier.Id._text, Supplier.PrimaryPhone!=null?Supplier.PrimaryPhone.FreeFormNumber._text:null, Supplier.Mobile!=null?Supplier.Mobile.FreeFormNumber._text:null, Supplier.PrimaryEmailAddr!=null?Supplier.PrimaryEmailAddr.Address._text:null, Supplier.WebAddr!=null?Supplier.WebAddr.URI._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.Line1._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.City._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.CountrySubDivisionCode._text:null, null, Supplier.BillAddr!=undefined?Supplier.BillAddr.PostalCode._text:null, Supplier.Active._text.toString()==="true"?1:0,  'quickbooks',company_id ,user_id ,Supplier.MetaData.CreateTime._text)
                    console.log("supplier added",Supplier.DisplayName._text, Supplier.Id._text);
                }
                else {
                    console.log("supplier found ",Supplier.Id._text, Supplier.DisplayName._text);
                    const updateSupplierResult = await updateSupplier(Supplier.DisplayName._text, Supplier.Id._text, Supplier.PrimaryPhone!=null?Supplier.PrimaryPhone.FreeFormNumber._text:null, Supplier.Mobile!=null?Supplier.Mobile.FreeFormNumber._text:null, Supplier.PrimaryEmailAddr!=null?Supplier.PrimaryEmailAddr.Address._text:null, Supplier.WebAddr!=null?Supplier.WebAddr.URI._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.Line1._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.City._text:null, Supplier.BillAddr!=undefined?Supplier.BillAddr.CountrySubDivisionCode._text:null, null, Supplier.BillAddr!=undefined?Supplier.BillAddr.PostalCode._text:null, Supplier.Active._text.toString()==="true"?1:0, company_id, Supplier.MetaData.CreateTime._text)
                    console.log("supplier updated",Supplier.DisplayName._text, Supplier.Id._text);
                }
            }
        }

        await storeActivity("Suppliers Synced", "-", "Supplier", company_id, user_id);
        return {
            status: 200,
            message: "Suppliers synced successfully!"
        }
    }
    catch (e) {
        console.log("supplier error", e);
        return e;
    }
}

async function syncPurchases(user_id, company_id, purchases) {
    try {
        if (isEmptyObject(purchases) && purchases !== undefined && purchases.length > 0) {
            console.log("purchases is null");
        } else {
            for (const Expense of purchases) {
                console.log("expenseID",Expense.Id._text , "length",Expense.Line.length);
                if(Expense.Line.length > 0) {
                    // supplier_id Expense.EntityRef?Expense.EntityRef._text:null
                    // supplier_name Expense.EntityRef?Expense.EntityRef._attributes.name:null
                    let supplier_id = null;
                    let supplier_name = null;
                    if(Expense.EntityRef) {
                        let getSupplierOfExpense = await getSupplierBySupplierID(Expense.EntityRef._text, company_id);
                        supplier_id = getSupplierOfExpense?getSupplierOfExpense[0].id:null;
                        supplier_name = getSupplierOfExpense?getSupplierOfExpense[0].name:null;
                    }
                    // department_id Expense.DepartmentRef?Expense.DepartmentRef._text:null
                    let category1 = null;
                    if(Expense.DepartmentRef) {
                        let getDepartmentByCategoryID = await getCategoryByCategoryID(Expense.DepartmentRef._text, company_id);
                        category1 = getDepartmentByCategoryID?getDepartmentByCategoryID[0].id:null;
                    }
                    for (let i = 0; i < Expense.Line.length; i++) {
                        // account_id Expense.AccountRef?Expense.AccountRef._text:null
                        let account_id = null;
                        if (Expense.Line[i].AccountBasedExpenseLineDetail && Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef) {
                            let getAccountOfExpense = await getAccountByAccountID(Expense.Line[i].AccountBasedExpenseLineDetail.AccountRef._text, company_id);
                            account_id = getAccountOfExpense ? getAccountOfExpense[0].id : null;
                        }
                        let category2 = null;
                        // class_id Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null
                        console.log("checking for class", Expense.Id._text, Expense.Line[i].AccountBasedExpenseLineDetail);
                        if (Expense.Line[i].AccountBasedExpenseLineDetail && Expense.Line[i].AccountBasedExpenseLineDetail.ClassRef) {
                            console.log("Expense has and class", Expense.Line[i].AccountBasedExpenseLineDetail.ClassRef)
                            let getClassByCategoryID = await getCategoryByCategoryID(Expense.Line[i].AccountBasedExpenseLineDetail.ClassRef._text, company_id);
                            category2 = getClassByCategoryID ? getClassByCategoryID[0].id : null;
                        }

                        const checkExpenseResult = await checkExpense(Expense.Id._text, i,company_id);
                        if(checkExpenseResult[0].expense_count === 0) {
                            await addExpense(
                                Expense.Id._text,
                                i,
                                Expense.Line[i].Description ? Expense.Line[i].Description._text : null,
                                Expense.MetaData ? Expense.MetaData.CreateTime._text : null,
                                Expense.MetaData ? Expense.MetaData.LastUpdatedTime._text : null,
                                Expense.CurrencyRef ? Expense.CurrencyRef._text : null,
                                Expense.PaymentType ? Expense.PaymentType._text : null,
                                account_id ? account_id : null,
                                supplier_id ? supplier_id : null,
                                supplier_name ? supplier_name : null,
                                category1 ? category1 : null,
                                category2 ? category2 : null,
                                Expense.Line[i] ? Expense.Line[i].Amount._text : null,
                                null,
                                "true",
                                null,
                                null,
                                null,
                                company_id,
                                "quickbooks",
                                user_id);
                            }
                            else {
                                await updateExpense(
                                    Expense.Id._text,
                                    i,
                                    Expense.Line[i].Description?Expense.Line[i].Description._text:null,
                                    Expense.MetaData?Expense.MetaData.CreateTime._text:null,
                                    Expense.MetaData?Expense.MetaData.LastUpdatedTime._text:null,
                                    Expense.CurrencyRef?Expense.CurrencyRef._text:null,
                                    Expense.PaymentType?Expense.PaymentType._text:null,
                                    account_id?account_id:null,
                                    supplier_id?supplier_id:null,
                                    supplier_name?supplier_name:null,
                                    category1?category1:null,
                                    category2?category2:null,
                                    Expense.Line[i]?Expense.Line[i].Amount._text:null,
                                    null,
                                    "true",
                                    null,
                                    null,
                                    null,
                                    company_id,
                                    "quickbooks"
                                );
                            }
                        }
                        console.log("expense added", Expense.Id._text);
                    }
                else if(Expense.Line.length === undefined) {
                    //Expense have only one line item
                    console.log("//Expense have only one line item");
                    let supplier_id = null;
                    let supplier_name = null;
                    if(Expense.EntityRef) {
                        let getSupplierOfExpense = await getSupplierBySupplierID(Expense.EntityRef._text, company_id);
                        supplier_id = getSupplierOfExpense?getSupplierOfExpense[0].id:null;
                        supplier_name = getSupplierOfExpense?getSupplierOfExpense[0].name:null;
                    }
                    // department_id Expense.DepartmentRef?Expense.DepartmentRef._text:null
                    let category1 = null;
                    if(Expense.DepartmentRef) {
                        let getDepartmentByCategoryID = await getCategoryByCategoryID(Expense.DepartmentRef._text, company_id);
                        category1 = getDepartmentByCategoryID?getDepartmentByCategoryID[0].id:null;
                    }
                    let account_id = null;
                    if (Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.AccountRef) {
                        let getAccountOfExpense = await getAccountByAccountID(Expense.Line.AccountBasedExpenseLineDetail.AccountRef._text, company_id);
                        account_id = getAccountOfExpense ? getAccountOfExpense[0].id : null;
                    }
                    let category2 = null;
                    // class_id Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef?Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text:null
                    console.log("checking for class", Expense.Id._text, Expense.Line.AccountBasedExpenseLineDetail);
                    if (Expense.Line.AccountBasedExpenseLineDetail && Expense.Line.AccountBasedExpenseLineDetail.ClassRef) {
                        console.log("Expense has and class", Expense.Line.AccountBasedExpenseLineDetail.ClassRef)
                        let getClassByCategoryID = await getCategoryByCategoryID(Expense.Line.AccountBasedExpenseLineDetail.ClassRef._text, company_id);
                        category2 = getClassByCategoryID ? getClassByCategoryID[0].id : null;
                    }

                    const checkExpenseResult = await checkExpense(Expense.Id._text, 0,company_id);
                    if(checkExpenseResult[0].expense_count === 0) {
                        await addExpense(
                            Expense.Id._text,
                            0,
                            Expense.Line.Description ? Expense.Line.Description._text : null,
                            Expense.MetaData ? Expense.MetaData.CreateTime._text : null,
                            Expense.MetaData ? Expense.MetaData.LastUpdatedTime._text : null,
                            Expense.CurrencyRef ? Expense.CurrencyRef._text : null,
                            Expense.PaymentType ? Expense.PaymentType._text : null,
                            account_id ? account_id : null,
                            supplier_id ? supplier_id : null,
                            supplier_name ? supplier_name : null,
                            category1 ? category1 : null,
                            category2 ? category2 : null,
                            Expense.Line ? Expense.Line.Amount._text : null,
                            null,
                            "true",
                            null,
                            null,
                            null,
                            company_id,
                            "quickbooks",
                            user_id);
                    }
                    else {
                        await updateExpense(
                            Expense.Id._text,
                            0,
                            Expense.Line.Description?Expense.Line.Description._text:null,
                            Expense.MetaData?Expense.MetaData.CreateTime._text:null,
                            Expense.MetaData?Expense.MetaData.LastUpdatedTime._text:null,
                            Expense.CurrencyRef?Expense.CurrencyRef._text:null,
                            Expense.PaymentType?Expense.PaymentType._text:null,
                            account_id?account_id:null,
                            supplier_id?supplier_id:null,
                            supplier_name?supplier_name:null,
                            category1?category1:null,
                            category2?category2:null,
                            Expense.Line?Expense.Line.Amount._text:null,
                            null,
                            "true",
                            null,
                            null,
                            null,
                            company_id,
                            "quickbooks"
                        );
                    }
                }
            }
        }
        await storeActivity("Expenses Synced","-", "Expense", company_id, user_id);
        return {
            status: 200,
            message: "Categories synced successfully"
        }
    }
    catch (e) {
        console.log("purchase error", e);
        return e;
    }
}

async function syncAttachables(user_id, company_id, attachables) {
    try {
        if (isEmptyObject(attachables) && attachables !== undefined && attachables.length > 0) {
            console.log("attachables is null");
        } else {
            for (const Attachable of attachables) {
                console.log("attachable found for expense",Attachable.AttachableRef.EntityRef._text)
                let attachments;
                const getExpenseAttachmentsResult = await getExpenseAttachments(Attachable.AttachableRef.EntityRef._text,company_id);
                console.log("getExpenseAttachmentsResult",getExpenseAttachmentsResult);
                if(getExpenseAttachmentsResult[0].attachments!==null) {
                    attachments = JSON.parse(getExpenseAttachmentsResult[0].attachments);
                }
                else {
                    attachments = [];
                }
                console.log("attachments",attachments);

                console.log("Attachable",Attachable);
                let checkAttachableResult = await checkAttachable(Attachable.Id._text, Attachable.AttachableRef.EntityRef._text);
                if (checkAttachableResult[0].attachable_count === 0) {
                    attachments.push({"attachable_id":Attachable.Id._text,"file_name":Attachable.FileName._text,"url":Attachable.FileAccessUri._text});
                    console.log("attachable added for expense",Attachable.AttachableRef.EntityRef._text," ",Attachable.FileName._text);
                }
                else {
                    let indexOfAttachment = attachments.findIndex(el => el.attachable_id === Attachable.Id._text);
                    attachments[indexOfAttachment].file_name = Attachable.FileName._text;
                    attachments[indexOfAttachment].url = Attachable.FileAccessUri._text;
                    console.log("attachable updated for expense",Attachable.AttachableRef.EntityRef._text," ",Attachable.FileName._text);
                }

                await updateExpenseAttachments(Attachable.AttachableRef.EntityRef._text, JSON.stringify(attachments),company_id);
                console.log("attachments of expense ",Attachable.AttachableRef.EntityRef._text,",",JSON.stringify(attachments));
            }
        }
    }
    catch (e) {
        return e;
    }
}

async function refreshToken(company_id) {
    // const getRefreshTokenResult = await getRefreshToken(email);
    const company = await getCompanyByID(company_id);
    console.log("active Company", company[0]);

    let expire_at = company[0].expire_at;

    let ts = Number(expire_at); // cast it to a Number


    const unixTimestamp = ts;
    const milliseconds = unixTimestamp * 1000 // 1575909015000
    const expire = new Date(milliseconds).toLocaleString();
    let current_date = new Date().toLocaleString();
    // console.log(ts);
    // console.log(expire_at);
    console.log("expire date", expire);
    console.log("current_date", current_date);

    if (current_date > expire) {
        console.log("Expired");
        let tokenSet = null;
        await oauthClient
            .refreshUsingToken(company[0].refresh_token)
            .then(async function (authResponse) {
                // console.log(`The Refresh Token is  ${JSON.stringify(authResponse.getJson())}`);
                oauth2_token_json = JSON.stringify(authResponse.getJson(), null, 2);
                let array = JSON.parse(oauth2_token_json);

                console.log("The Refresh Token is", array);
                let qb_access_token = array.access_token;
                let qb_refresh_token = array.refresh_token;
                let qb_id_token = array.id_token;
                let qb_expire_at = array.x_refresh_token_expires_in;

                let now = new Date();
                let time = now.getTime();
                time += 3600 * 1000;
                let expire_at = time.toString().substring(0,10);

                // const updateRefreshTokenResult = await updateRefreshToken(email, qb_access_token, qb_refresh_token, expire_at);
                const updateCompanyTokenResult = await updateQuickbooksCompanyToken(company[0].tenant_id, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                console.log(updateCompanyTokenResult);

                tokenSet = {
                    token_type: 'Bearer',
                    access_token: qb_access_token,
                    expires_in: qb_expire_at,
                    refresh_token: qb_refresh_token,
                    x_refresh_token_expires_in: qb_expire_at,
                    realmId: company[0].tenant_id,
                    id_token: qb_id_token
                };

                console.log("tokenSet",tokenSet);
            });
        let res = {
            'status': 404,
            'message':'Expired',
            'tokenSet': tokenSet
        };
        return res;
    }
    else {
        console.log("Not Expired")
        let tokenSet = {
            token_type: 'Bearer',
            access_token: company[0].access_token,
            expires_in: company[0].expire_at,
            refresh_token: company[0].refresh_token,
            x_refresh_token_expires_in: company[0].expire_at,
            realmId: company[0].tenant_id,
            id_token: company[0].id_token
        };

        console.log("tokenSet",tokenSet);
        let res = {
            'status': 200,
            'message': 'Not Expired',
            'tokenSet': tokenSet
        };
        return res;
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

            let authUri = oauthClient.authorizeUri({
                scope:[
                    OAuthClient.scopes.Accounting,
                    OAuthClient.scopes.OpenId,
                    OAuthClient.scopes.Email,
                    OAuthClient.scopes.Profile,
                    OAuthClient.scopes.Address,
                    OAuthClient.scopes.Phone],
                state:'developmentState'
            });

            console.log("request_type",request_type);
            // can be an array of multiple scopes ex : {scope:[OAuthClient.scopes.Accounting,OAuthClient.scopes.OpenId]}
            return res.redirect(authUri);
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
            oauthClient
                .createToken(req.url)
                .then(async function (authResponse) {
                    oauth2_token_json = JSON.stringify(authResponse.getJson());
                    let tokenArray = JSON.parse(oauth2_token_json);
                    console.log("tokenArray",tokenArray)
                    qb_access_token = tokenArray.access_token;
                    qb_refresh_token = tokenArray.refresh_token;
                    qb_id_token = tokenArray.id_token;
                    qb_expire_at = tokenArray.x_refresh_token_expires_in;
                    const decodedIdToken = jwt.decode(qb_id_token);

                    const token = crypto.randomBytes(48).toString('hex');

                    let authToken = oauthClient.getToken().getToken();
                    oauthClient.setToken(authToken);

                    console.log("decodedIdToken",decodedIdToken);

                    let user = await getUser(qb_access_token);
                    let company = await getCompany(qb_access_token, decodedIdToken.realmid);

                    let userArray = [];
                    let companyArray = [];

                    let accountArray = [];

                    let purchaseArray = [];
                    let billArray = [];

                    let categoryArray = [];
                    let classArray = [];

                    let supplierArray = [];

                    userArray = JSON.parse(user);
                    companyArray = JSON.parse(company).IntuitResponse.CompanyInfo;

                    let email = userArray.email;
                    let first_name = userArray.givenName;
                    let last_name = userArray.familyName;

                    console.log("userArray",userArray);
                    console.log("companyArray",companyArray);
                    console.log("user email", email)




                    // const checkCompanyExistResult = await checkCompanyExist(decodedIdToken.realmid);
                    // const getCompanyByTenantIdResult = await getCompanyByTenant(decodedIdToken.realmid);
                    // console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult)
                    // let getUserData;
                    // if(checkCompanyExistResult[0].company_count === 1) {
                    //     getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);
                    // }
                    // else {
                    //     getUserData = null;
                    // }
                    // console.log("getUserData",getUserData);
                    // console.log("checkCompanyExistResult",checkCompanyExistResult);

                    if(request_type === "login") {
                        console.log("user is trying to login their account..");
                        const checkCompanyExistResult = await checkCompanyExist(decodedIdToken.realmid);
                        const getCompanyByTenantIdResult = await getCompanyByTenant(decodedIdToken.realmid);
                        console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult)

                        if(checkCompanyExistResult[0].company_count === 1) {
                            let getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);

                            console.log("user exist and status is 1 just need to refresh token and redirect user to login page");
                            console.log("updating email");
                            const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
                            console.log("updating qb tokens")
                            const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);

                            const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, null, null, null, null, 1);
                            let user_id = getUserData[0].id;

                            // Disable all companies in xero and then enable current selected one.
                            const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                            const disableAllCompanyResult = await disableAllCompany(user_id);
                            const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);

                            console.log("user already exist");
                            console.log("redirecting to",`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token)
                            return res.redirect(`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token);
                        }
                        else {
                            return res.redirect(`${process.env.APP_URL}login/error/404`);
                        }
                    }
                    else if(request_type === "sign-up" || request_type === "connect") {
                        const checkUserEmailResult = await checkUserEmail(email);
                        const getUserData = await getUserByEmail(email);
                        if(checkUserEmailResult[0].user_count === 1 && getUserData[0].role_id === 2) {
                            //Check if user is not a normal user
                            return res.redirect(`${process.env.APP_URL}login/error/1002`);
                        }
                        else {
                            if(checkUserEmailResult[0].user_count === 1 && getUserData[0].role_id === 1 && getUserData[0].user_type === "xero") {
                                //check if user is not a qb user
                                return res.redirect(`${process.env.APP_URL}login/error/1004`);
                            }
                            else {
                                let isCompanyFound = false;
                                let user_id;
                                let company_id;
                                const checkCompanyExistResult = await checkCompanyExist(decodedIdToken.realmid);
                                if(checkCompanyExistResult[0].company_count === 0) {
                                    const getUserData = await getUserByEmail(email);
                                    const checkUserByEmailResult = await checkUserEmail(email);
                                    if (checkUserByEmailResult[0].user_count === 0) {
                                        //if email fo not found then we create an user account
                                        const createUsersResult = await createUserAccount(first_name, last_name, email, null, null, null, null, null, token, "quickbooks");
                                        user_id = createUsersResult.insertId;
                                    }
                                    else{
                                        //if email found then we get user by his email
                                        user_id = getUserData[0].id;
                                    }

                                    let NameValue = companyArray.NameValue;

                                    let IndustryType = NameValue.filter(el => el.Name._text === 'IndustryType');
                                    let CompanyType = NameValue.filter(el => el.Name._text === 'CompanyType');
                                    const createCompanyResult = await createCompany(companyArray.CompanyName._text ,null, decodedIdToken.realmid, CompanyType[0]!=undefined||null?CompanyType[0].Value._text:null, IndustryType[0]!=undefined||null?IndustryType[0].Value._text:null, "quickbooks","USD", getUserData[0].id, companyArray.MetaData.CreateTime._text);
                                    console.log("company created",companyArray.CompanyName._text)
                                    company_id = createCompanyResult.insertId;
                                    const createUserRoleResult = await createUserRole(getUserData[0].id, createCompanyResult.insertId, null, 1, null);
                                    console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
                                    const updateQbAccountEmailResult = await updateAccountEmail(user_id, email);
                                    const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                                    const updateLoginTokenResult = await updateLoginToken(user_id, token, null, null, null, null, 1);

                                    let accounts = await getAccounts(qb_access_token, decodedIdToken.realmid);

                                    let purchases = await getPurchases(qb_access_token, decodedIdToken.realmid, "all");
                                    let bills = await getBills(qb_access_token, decodedIdToken.realmid, "all");
                                    let attachables = await getAllAttachables(qb_access_token, decodedIdToken.realmid);

                                    let categories = await getCategories(qb_access_token, decodedIdToken.realmid);
                                    let classes = await getClasses(qb_access_token, decodedIdToken.realmid);

                                    let suppliers = await getSuppliers(qb_access_token, decodedIdToken.realmid, "all");

                                    const accountArray = JSON.parse(accounts).IntuitResponse.QueryResponse.Account;

                                    const purchaseArray = JSON.parse(purchases).IntuitResponse.QueryResponse.Purchase;
                                    const billArray = JSON.parse(bills).IntuitResponse.QueryResponse.Bill;
                                    const attachableArray = JSON.parse(attachables).IntuitResponse.QueryResponse.Attachable;

                                    const categoryArray = JSON.parse(categories).IntuitResponse.QueryResponse.Department;
                                    const classArray = JSON.parse(classes).IntuitResponse.QueryResponse.Class;

                                    const supplierArray = JSON.parse(suppliers).IntuitResponse.QueryResponse.Vendor;


                                    await syncCategories(getUserData[0].id, company_id, categoryArray).then(async () => {
                                        await syncClasses(getUserData[0].id, company_id, classArray).then(async () => {
                                            await syncAccounts(getUserData[0].id, company_id, accountArray).then(async () => {
                                                await syncSuppliers(getUserData[0].id, company_id, supplierArray).then(async () => {
                                                    await syncPurchases(getUserData[0].id, company_id, purchaseArray).then(async () => {
                                                        await syncAttachables(getUserData[0].id, company_id, attachableArray).then(() => {
                                                            storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, getUserData[0].id);
                                                        })
                                                    });
                                                });
                                            });
                                        });
                                    });

                                    const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                                    const disableAllCompanyResult = await disableAllCompany(user_id);
                                    const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);

                                    if(request_type === 'sign-up') {
                                        return res.redirect(`${process.env.APP_URL}auth/sign-up/quickbooks/` + encodeURIComponent(email) + `/` + token);
                                    }
                                    else if(request_type === "connect") {
                                        return res.redirect(`${process.env.APP_URL}companies`);
                                    }
                                }
                                else {
                                    console.log("already exist reditect to")
                                    console.log(`${process.env.APP_URL}companies`);
                                    return res.redirect(`${process.env.APP_URL}companies`);
                                }
                            }
                        }
                    }

                    // if(request_type === "sign-up" || request_type === "connect") {
                    //     console.log("request_type",request_type)
                    //     //User is trying to sign up or connect a company
                    //     if (checkCompanyExistResult[0].company_count === 1) {
                    //         //User already exist no need to create new account
                    //         if(request_type === "sign-up" || request_type === "connect" && getUserData[0].role_id !== 2) {
                    //             console.log("user is admin", getUserData[0].role_id);
                    //             if(request_type === "sign-up" || request_type === "connect" && getUserData[0].role_id === 1 && getUserData[0].user_type !== "xero") {
                    //                 console.log("user is not an xero user");
                    //                 if (request_type === "sign-up" && getUserData[0].role_id === 1 && getUserData[0].user_type === "quickbooks" && getUserData[0].status === 0) {
                    //                     console.log("user do not exist and status is 0");
                    //                     return res.redirect(`${process.env.APP_URL}login/error/1003`);
                    //                     //Check if user exist as a xero user but status is 0
                    //                 }
                    //                 else if(request_type === "sign-up" && getUserData[0].role_id === 1 && getUserData[0].user_type === "quickbooks" && getUserData[0].status === 1) {
                    //                     console.log("user exist and status is 1 just need to refresh token and redirect user to login page");
                    //                     console.log("updating email");
                    //                     const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
                    //                     console.log("updating qb tokens")
                    //                     const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                    //
                    //                     const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, null, null, null, null, 1);
                    //                     let user_id = getUserData[0].id;
                    //
                    //                     // Disable all companies in xero and then enable current selected one.
                    //                     const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                    //                     const disableAllCompanyResult = await disableAllCompany(user_id);
                    //                     const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    //
                    //                     console.log("user already exist");
                    //                     console.log("redirecting to",`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token)
                    //                     return res.redirect(`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token);
                    //                 }
                    //                 else if (request_type === "connect" && getUserData[0].role_id === 1 && getUserData[0].user_type === "quickbooks") {
                    //                     const checkCompanyExistResult = await checkCompanyExist(decodedIdToken.realmid);
                    //                     if (checkCompanyExistResult[0].company_count === 1) {
                    //                         console.log("user is connecting a company but it is already exist in out db")
                    //                         return res.redirect(`${process.env.APP_URL}companies`);
                    //                     }
                    //                     else if (checkCompanyExistResult[0].company_count === 0) {
                    //                         let NameValue = companyArray.NameValue;
                    //
                    //                         let IndustryType = NameValue.filter(el => el.Name._text === 'IndustryType');
                    //                         let CompanyType = NameValue.filter(el => el.Name._text === 'CompanyType');
                    //                         // const createCompanyResult = await createCompany(null ,jwtTokenDecode.realmid,companyArray.IntuitResponse.CompanyInfo.CompanyName._text,companyArray.IntuitResponse.CompanyInfo.MetaData.CreateTime._text, companyArray.IntuitResponse.CompanyInfo._attributes.domain, null,'USD',CompanyType[0]!=undefined||null?CompanyType[0].Value._text:null,IndustryType[0]!=undefined||null?IndustryType[0].Value._text:null,createUsersResult.insertId);
                    //                         const createCompanyResult = await createCompany(companyArray.CompanyName._text ,null, decodedIdToken.realmid, CompanyType[0]!=undefined||null?CompanyType[0].Value._text:null, IndustryType[0]!=undefined||null?IndustryType[0].Value._text:null, "quickbooks","USD", getUserData[0].id, companyArray.MetaData.CreateTime._text);
                    //                         console.log("company created",companyArray.CompanyName._text)
                    //                         const createUserRoleResult = await createUserRole(getUserData[0].id, createCompanyResult.insertId, null, 1, null);
                    //                         console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
                    //                         let company_id = createCompanyResult.insertId;
                    //
                    //                         console.log("updating qb tokens")
                    //                         const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                    //
                    //                         let accounts = await getAccounts(qb_access_token, decodedIdToken.realmid);
                    //
                    //                         let purchases = await getPurchases(qb_access_token, decodedIdToken.realmid, "all");
                    //                         let bills = await getBills(qb_access_token, decodedIdToken.realmid, "all");
                    //                         let attachables = await getAllAttachables(qb_access_token, decodedIdToken.realmid);
                    //
                    //                         let categories = await getCategories(qb_access_token, decodedIdToken.realmid);
                    //                         let classes = await getClasses(qb_access_token, decodedIdToken.realmid);
                    //
                    //                         let suppliers = await getSuppliers(qb_access_token, decodedIdToken.realmid, "all");
                    //
                    //
                    //                         const accountArray = JSON.parse(accounts).IntuitResponse.QueryResponse.Account;
                    //
                    //                         const purchaseArray = JSON.parse(purchases).IntuitResponse.QueryResponse.Purchase;
                    //                         const billArray = JSON.parse(bills).IntuitResponse.QueryResponse.Bill;
                    //                         const attachableArray = JSON.parse(attachables).IntuitResponse.QueryResponse.Attachable;
                    //
                    //                         const categoryArray = JSON.parse(categories).IntuitResponse.QueryResponse.Department;
                    //                         const classArray = JSON.parse(classes).IntuitResponse.QueryResponse.Class;
                    //
                    //                         const supplierArray = JSON.parse(suppliers).IntuitResponse.QueryResponse.Vendor;
                    //
                    //
                    //                         await syncCategories(getUserData[0].id, company_id, categoryArray).then(async () => {
                    //                             await syncClasses(getUserData[0].id, company_id, classArray).then(async () => {
                    //                                 await syncAccounts(getUserData[0].id, company_id, accountArray).then(async () => {
                    //                                     await syncSuppliers(getUserData[0].id, company_id, supplierArray).then(async () => {
                    //                                         await syncPurchases(getUserData[0].id, company_id, purchaseArray).then(async () => {
                    //                                             await syncAttachables(getUserData[0].id, company_id, attachableArray).then(() => {
                    //                                                 storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, getUserData[0].id);
                    //                                             })
                    //                                         });
                    //                                     });
                    //                                 });
                    //                             });
                    //                         });
                    //
                    //                         // Disable all companies in xero and then enable current selected one.
                    //                         const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                    //                         const disableAllCompanyResult = await disableAllCompany(getUserData[0].id);
                    //                         const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    //                         return res.redirect(`${process.env.APP_URL}companies`);
                    //                     }
                    //                 }
                    //             }
                    //             else {
                    //                 //Check if user exist as a xero user
                    //                 return res.redirect(`${process.env.APP_URL}login/error/1004`);
                    //             }
                    //         }
                    //         else {
                    //             //Check if user exist as an user
                    //             return res.redirect(`${process.env.APP_URL}login/error/1002`);
                    //         }
                    //     }
                    //     else if (checkCompanyExistResult[0].company_count === 0) {
                    //         //Check if user exist in our db, 0 = not exist . then create new qb user
                    //         console.log("creating qb account...");
                    //         let user_id;
                    //         let checkUserByEmail = await checkUserEmail(email);
                    //         if(checkUserByEmail[0].user_count === 0) {
                    //             const createUsersResult = await createUserAccount(first_name, last_name, email, null, null, null, null, null, token, "quickbooks");
                    //             user_id= createUsersResult.insertId;
                    //         }
                    //         else {
                    //             let getUserByEmailResult = await getUserByEmail(email);
                    //             console.log("getUserByEmailResult",getUserByEmailResult);
                    //             user_id = getUserByEmailResult[0].id;
                    //             console.log("updateLoginToken");
                    //             const updateLoginTokenResult = await updateLoginToken(getUserByEmailResult[0].id, token, null, null, null, null, 1);
                    //         }
                    //
                    //         const checkUserCompanyResult = await checkUserCompanyByTenant(decodedIdToken.realmid);
                    //         let company_id= null;
                    //         if (checkUserCompanyResult[0].company_count === 0) {
                    //             let NameValue = companyArray.NameValue;
                    //             let IndustryType = NameValue.filter(el => el.Name._text === 'IndustryType');
                    //             let CompanyType = NameValue.filter(el => el.Name._text === 'CompanyType');
                    //             // const createCompanyResult = await createCompany(null ,jwtTokenDecode.realmid,companyArray.IntuitResponse.CompanyInfo.CompanyName._text,companyArray.IntuitResponse.CompanyInfo.MetaData.CreateTime._text, companyArray.IntuitResponse.CompanyInfo._attributes.domain, null,'USD',CompanyType[0]!=undefined||null?CompanyType[0].Value._text:null,IndustryType[0]!=undefined||null?IndustryType[0].Value._text:null,createUsersResult.insertId);
                    //             const createCompanyResult = await createCompany(companyArray.CompanyName._text ,null, decodedIdToken.realmid, CompanyType[0]!=undefined||null?CompanyType[0].Value._text:null, IndustryType[0]!=undefined||null?IndustryType[0].Value._text:null, "quickbooks","USD", user_id, companyArray.MetaData.CreateTime._text);
                    //             console.log("company created",companyArray.CompanyName._text)
                    //             const createUserRoleResult = await createUserRole(user_id, createCompanyResult.insertId, null, 1, null);
                    //             console.log("role created company id",createCompanyResult.insertId,"user id",user_id);
                    //             company_id = createCompanyResult.insertId;
                    //
                    //             console.log("updating qb tokens")
                    //             const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                    //
                    //             let accounts = await getAccounts(qb_access_token, decodedIdToken.realmid);
                    //
                    //             let purchases = await getPurchases(qb_access_token, decodedIdToken.realmid, "all");
                    //             let bills = await getBills(qb_access_token, decodedIdToken.realmid, "all");
                    //             let attachables = await getAllAttachables(qb_access_token, decodedIdToken.realmid);
                    //
                    //             let categories = await getCategories(qb_access_token, decodedIdToken.realmid);
                    //             let classes = await getClasses(qb_access_token, decodedIdToken.realmid);
                    //
                    //             let suppliers = await getSuppliers(qb_access_token, decodedIdToken.realmid, "all");
                    //
                    //
                    //             const accountArray = JSON.parse(accounts).IntuitResponse.QueryResponse.Account;
                    //
                    //             const purchaseArray = JSON.parse(purchases).IntuitResponse.QueryResponse.Purchase;
                    //             const billArray = JSON.parse(bills).IntuitResponse.QueryResponse.Bill;
                    //             const attachableArray = JSON.parse(attachables).IntuitResponse.QueryResponse.Attachable;
                    //
                    //             const categoryArray = JSON.parse(categories).IntuitResponse.QueryResponse.Department;
                    //             const classArray = JSON.parse(classes).IntuitResponse.QueryResponse.Class;
                    //
                    //             const supplierArray = JSON.parse(suppliers).IntuitResponse.QueryResponse.Vendor;
                    //
                    //
                    //             await syncCategories(user_id, company_id, categoryArray).then(async () => {
                    //                 await syncClasses(user_id, company_id, classArray).then(async () => {
                    //                     await syncAccounts(user_id, company_id, accountArray).then(async () => {
                    //                         await syncSuppliers(user_id, company_id, supplierArray).then(async () => {
                    //                             await syncPurchases(user_id, company_id, purchaseArray).then(async () => {
                    //                                 await syncAttachables(user_id, company_id, attachableArray).then(() => {
                    //                                     storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
                    //                                 })
                    //                             });
                    //                         });
                    //                     });
                    //                 });
                    //             });
                    //
                    //             // Disable all companies in xero and then enable current selected one.
                    //             const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                    //             const disableAllCompanyResult = await disableAllCompany(user_id);
                    //             const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    //             console.log("sending email....");
                    //             // const sendEmailResult = await sendEmail(email, first_name);
                    //             // console.log("sendEmailResult",sendEmailResult);
                    //             console.log("redirecting to ",`${process.env.APP_URL}auth/sign-up/quickbooks/` + encodeURIComponent(email) + `/` + token);
                    //             return res.redirect(`${process.env.APP_URL}auth/sign-up/quickbooks/` + encodeURIComponent(email) + `/` + token);
                    //         }
                    //     }
                    // }
                    // else if(request_type === "login") {
                    //     console.log("user is trying to login their account..");
                    //     const checkCompanyExistResult = await checkCompanyExist(decodedIdToken.realmid);
                    //     const getCompanyByTenantIdResult = await getCompanyByTenant(decodedIdToken.realmid);
                    //     console.log("getCompanyByTenantIdResult",getCompanyByTenantIdResult)
                    //
                    //     if(checkCompanyExistResult[0].company_count === 1) {
                    //         let getUserData = await getUserById(getCompanyByTenantIdResult[0].user_id);
                    //
                    //         console.log("user exist and status is 1 just need to refresh token and redirect user to login page");
                    //         console.log("updating email");
                    //         const updateXeroAccountEmailResult = await updateAccountEmail(getUserData[0].id, email);
                    //         console.log("updating qb tokens")
                    //         const updateQuickbooksCompanyTokenResult = await updateQuickbooksCompanyToken(decodedIdToken.realmid, qb_id_token, qb_access_token, qb_refresh_token, qb_expire_at);
                    //
                    //         const updateLoginTokenResult = await updateLoginToken(getUserData[0].id, token, null, null, null, null, 1);
                    //         let user_id = getUserData[0].id;
                    //
                    //         // Disable all companies in xero and then enable current selected one.
                    //         const getCompanyByTenantResult = await getCompanyByTenant(decodedIdToken.realmid);
                    //         const disableAllCompanyResult = await disableAllCompany(user_id);
                    //         const activateCompanyResult = await activateCompany(getCompanyByTenantResult[0].id);
                    //
                    //         console.log("user already exist");
                    //         console.log("redirecting to",`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token)
                    //         return res.redirect(`${process.env.APP_URL}auth/login/quickbooks/` + encodeURIComponent(email) + `/` + token);
                    //     }
                    //     else {
                    //         return res.redirect(`${process.env.APP_URL}login/error/404`);
                    //     }
                    // }
                });
        }
        catch (e) {
            return res.json({
                status: 500,
                message: e
            })
        }
    },
    disconnect: async (req, res) => {
        try{
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;

            const refreshTokenResult = await refreshToken(company_id);

            const company = await getCompanyByID(company_id);
            const user = await getUserById(user_id);
            await oauthClient.setToken({
                token_type: 'Bearer',
                access_token: company[0].access_token,
                expires_in: company[0].expire_at,
                refresh_token: company[0].refresh_token,
                x_refresh_token_expires_in: company[0].expire_at,
                realmId: company[0].tenant_id,
                id_token: company[0].id_token
            });

            console.log("oauthClient", oauthClient.getToken().getToken());
            let uc_length = null;
            let uc_active_company = null;

            await oauthClient.revoke({'access_token': company[0].access_token, 'refresh_token': company[0].refresh_token}).then(async (res) => {
                console.log('Tokens revoked : ' + res);
                const setForeignKeyResult1 = await setForeignKeyDisable('companies');
                const setForeignKeyResult2 = await setForeignKeyDisable('expenses');
                const setForeignKeyResult4 = await setForeignKeyDisable('users');
                const setForeignKeyResult5 = await setForeignKeyDisable('accounts');
                const setForeignKeyResult6 = await setForeignKeyDisable('categories');
                const setForeignKeyResult7 = await setForeignKeyDisable('suppliers');
                const setForeignKeyResult8 = await setForeignKeyDisable('attachables');
                const setForeignKeyResult9 = await setForeignKeyDisable('user_relations');

                const getCompanyUsersResponse = await getCompanyUsers(company_id);
                if(getCompanyUsersResponse.length > 0) {
                    for (let i=0;i<getCompanyUsersResponse.length;i++) {
                        const getSubscriptionResult = await getSubscription(getCompanyUsersResponse[i].id);
                        console.log("canceling Subscription for user",getCompanyUsersResponse[i].email," sub id:",getSubscriptionResult[0].subscription_id);
                        const deleted = await stripe.subscriptions.del(
                            getSubscriptionResult[0].subscription_id
                        );
                        const deleteUserSubscriptionResult = await deleteUserSubscription(getCompanyUsersResponse[i].id);
                    }
                }
                else {
                    console.log("no user found for the company",company_id)
                }

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
                                                    if (user_companies_after_deletion.length > 0) {
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

            const token = await refreshToken(company_id);

            const company = await getCompanyByID(company_id);
            const user = await getUserById(user_id);

            console.log("token", token);

            let access_token = company[0].access_token;
            let tenant_id = company[0].tenant_id;

            console.log("access_token", access_token);
            console.log("tenant_id", tenant_id);

            let accounts = await getAccounts(access_token, tenant_id);

            let purchases = await getPurchases(access_token, tenant_id, "week");
            let bills = await getBills(access_token, tenant_id, "week");
            let attachables = await getAllAttachables(access_token, tenant_id);

            let categories = await getCategories(access_token, tenant_id);
            let classes = await getClasses(access_token, tenant_id);

            let suppliers = await getSuppliers(access_token, tenant_id, "all");


            const accountArray = JSON.parse(accounts).IntuitResponse.QueryResponse.Account;

            const purchaseArray = JSON.parse(purchases).IntuitResponse.QueryResponse.Purchase;
            const billArray = JSON.parse(bills).IntuitResponse.QueryResponse.Bill;
            const attachableArray = JSON.parse(attachables).IntuitResponse.QueryResponse.Attachable;

            const categoryArray = JSON.parse(categories).IntuitResponse.QueryResponse.Department;
            const classArray = JSON.parse(classes).IntuitResponse.QueryResponse.Class;

            const supplierArray = JSON.parse(suppliers).IntuitResponse.QueryResponse.Vendor;

            await syncCategories(user_id, company_id, categoryArray).then(async () => {
                await syncClasses(user_id, company_id, classArray).then(async () => {
                    await syncAccounts(user_id, company_id, accountArray).then(async () => {
                        await syncSuppliers(user_id, company_id, supplierArray).then(async () => {
                            await syncPurchases(user_id, company_id, purchaseArray).then(async () => {
                                await syncAttachables(user_id, company_id, attachableArray).then(() => {
                                    storeActivity("All Data Synced", "Data has been synced successfully", "All", company_id, user_id);
                                })
                            });
                        });
                    });
                });
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
    viewAttachment: async (req, res) => {
        try {
            const user_id = req.params.user_id;
            const company_id = req.params.company_id;
            const attachment_id = req.params.attachment_id;

            console.log("user_id", user_id);
            console.log("company_id", company_id);
            console.log("attachment_id", attachment_id);


            //Check if token expired , if expire then we refresh the token and return tokenSet
            const refreshTokenResult = await refreshToken(company_id);

            const company = await getCompanyById(company_id);
            // console.log("company",company);

            console.log("refreshTokenResult",refreshTokenResult)
            if(refreshTokenResult.status === 200 || refreshTokenResult.status === 404) {
                // oauthClient.setToken(refreshTokenResult.tokenSet);
            }

            const image = await getAllAttachableImage(company[0].access_token,company[0].tenant_id, attachment_id);
            const imageArray = JSON.parse(image).IntuitResponse.QueryResponse.Attachable;
            console.log("image",imageArray);


            // console.log("oauthClient",oauthClient.getToken().getToken());

            return res.json({
                status: 200,
                data: imageArray.TempDownloadUri._text
            });
        } catch (err) {
            // const error = JSON.stringify(err.response, null, 2)
            console.log("attachment error",err);
            return res.json({
                status: 500,
                message: "Loading attachment failed",
                error: err
            })
        }
    },
    syncEmail: async (req, res) => {
        try {
            const company_id = req.params.company_id;
            const user_id = req.params.user_id;

            const token = await refreshToken(company_id);

            const company = await getCompanyByID(company_id);
            let user = await getUser(company[0].access_token);
            let userArray = JSON.parse(user);
            let email = userArray.email;
            const updateXeroAccountEmailResult = await updateAccountEmail(user_id, email);
            console.log("email updated",updateXeroAccountEmailResult);
            console.log("user", userArray)

            const getUserByIDRes = await getUserById(user_id);
            getUserByIDRes[0].password = undefined;
            return res.json({
                status: 200,
                message: "Email refreshed successfully",
                user: getUserByIDRes[0]
            })
        }
        catch (e) {
            return res.json({
                status: 500,
                message: "Error :" + e.message,
            });
        }
    }
};
