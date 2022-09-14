const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");


module.exports = {
    getUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getLoginToken: (email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT token FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanyByID: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getAdminActiveCompany: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT *
                FROM companies where user_id = ? and active_status = 1`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUserCategories: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanies: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategories: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategoriesForDashboard: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ? AND category_status = 1`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategoriesForUserCreation: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ? AND category_status = 1`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getSuppliers: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM suppliers WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUsers: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM users WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUserAssignedCategories: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `select u.user_id,c.category_name from user_relations u join categories c on u.category_id = c.id where u.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategoriesForUserDashboard: (company_id,user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `select c.id,c.category_name,c.category_status from user_relations u join categories c on u.category_id = c.id where u.company_id = ? and u.user_id = ?`, [company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUserAssignedCategoriesByUserID: (company_id,user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                // `SELECT u.id,u.first_name,u.last_name,u.email,u.contact,r.name as 'role',d.depart_name FROM user_relations ur JOIN users u ON u.id=ur.user_id JOIN roles r ON r.id=ur.role_id LEFT JOIN departments d ON ur.depart_id=d.id WHERE ur.company_id = ? and ur.role_id!=1 and u.status = 1`, [id],
                `select c.* from user_relations u join categories c on u.category_id = c.id where u.company_id = ? and u.user_id = ?`, [company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getExpenses: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,a.name as 'account_name',s.name as 'supplier_name',cat1.category_name as 'category_1',cat2.category_name as 'category_2',e.attachments FROM expenses e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getExpensesByCategoryID: (company_id, category_id) => {
        console.log(`SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,e.account_id,a.name as 'account_name',e.supplier_id,s.name as 'supplier_name',e.category1_id,cat1.category_name as 'category_1',e.category2_id,cat2.category_name as 'category_2',e.attachments FROM expenses e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ${company_id} AND e.category1_id = ${category_id} OR e.company_id = ${company_id} AND e.category2_id = ${category_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,e.account_id,a.name as 'account_name',e.supplier_id,s.name as 'supplier_name',e.category1_id,cat1.category_name as 'category_1',e.category2_id,cat2.category_name as 'category_2',e.attachments FROM expenses e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ? AND e.category1_id = ? OR e.company_id = ? AND e.category2_id = ?`, [company_id, category_id, company_id, category_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUserExpenses: (company_id) => {
        console.log(`SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,e.account_id,a.name as 'account_name',e.supplier_id,s.name as 'supplier_name',e.category1_id,cat1.category_name as 'category_1',e.category2_id,cat2.category_name as 'category_2',e.attachments FROM expenses e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ${company_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,e.account_id,a.name as 'account_name',e.supplier_id,s.name as 'supplier_name',e.category1_id,cat1.category_name as 'category_1',e.category2_id,cat2.category_name as 'category_2',e.attachments FROM expenses e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getAttachables: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM attachables WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    disableAllCompany: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 0 WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    activateCompany: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 1 WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getLastSyncedActivity: (company_id, type) => {
        console.log(`SELECT * FROM activities WHERE company_id = ${company_id} and type = ${type} ORDER BY id DESC LIMIT 1`);
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM activities WHERE company_id = ? and type = ? ORDER BY id DESC LIMIT 1`, [company_id, type],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    createUserAccount: (first_name,last_name, email,xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, user_type) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO users(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, user_type, role_id, is_verified) VALUES (? ,? ,?, ? ,? ,?, ?, ?, ?, ?, 1, 1)`, [first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token,xero_refresh_token,xero_expire_at, token, user_type],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    storeActivity:(title, description, type, company_id, user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO activities(title, description, type, company_id, user_id) VALUES (?, ?, ?, ?, ?)`, [title, description, type, company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateAccountEmail: (id, email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET email = ? WHERE id = ?`, [email, id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkUserEmail: (email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as user_count FROM users where email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkCompanyExist: (tenant_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as company_count FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanyByTenant: (tenant_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanyById: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM companies where id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getUserById: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM users where id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    createCompany: (company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO companies(company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date) VALUES (? ,?, ?, ?, ?, ?, ?, ?, ?)`, [company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    createUserRole: (user_id ,company_id, category_id,role_id ,created_by) => {
        return new Promise((resolve, reject) => {
            console.log("create role log: ",user_id, company_id, role_id, created_by);
            pool.query(
                `INSERT INTO user_relations(user_id,company_id,category_id,role_id,created_by) VALUES (?, ?, ?, ?, ?)`, [user_id, company_id, category_id, role_id, created_by],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateAllCompanies: (tenant_id, company_name, currency) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE companies SET company_name = ?, currency = ? WHERE tenant_id = ?`, [company_name, currency, tenant_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkCategory: (category_id ,company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'category_count' FROM categories WHERE category_id = ? and company_id = ?`, [category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    addCategory:(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO categories(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateCategory:(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, company_id) => {
        console.log(`UPDATE categories SET category_name = ${category_name}, category_parent = ${category_parent}, category_status = ${category_status}, parent_category_id = ${parent_category_id}, parent_category_name = ${parent_category_name}, category_type = ${category_type} WHERE category_id = ${category_id} AND company_id = ${company_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE categories SET category_name = ?, category_parent = ?, category_status = ?, parent_category_id = ?, parent_category_name = ?, category_type = ? WHERE category_id = ? AND company_id = ?`, [category_name, category_parent, category_status, parent_category_id, parent_category_name, category_type, category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkAccount: (account_id ,company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'account_count' FROM accounts WHERE account_id = ? and company_id = ?`, [account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    createAccount: (name, account_id, account_type, description, currency_code, status, company_id, user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO accounts(name, account_id, account_type, description, currency_code, status, company_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, account_id, account_type, description, currency_code, status, company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateAccount: (name, account_id, description, currency_code, status, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE accounts SET name = ?, account_id = ?, description = ?, currency_code = ?, status = ? WHERE account_id = ? AND company_id = ?`, [name, account_id, description, currency_code, status, account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkSupplier: (supplier_id ,company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'supplier_count' FROM suppliers WHERE supplier_id = ? and company_id = ?`, [supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    addSupplier: (name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO suppliers(name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateSupplier: (name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, company_id, create_date) => {
        console.log(`UPDATE suppliers SET name = ?, phone = ?, mobile = ?, email = ?, web = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, status = ${status}, create_date = ? WHERE supplier_id = '${supplier_id}' AND company_id = ${company_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE suppliers SET name = ?, phone = ?, mobile = ?, email = ?, web = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, status = ?, create_date = ? WHERE supplier_id = ? AND company_id = ?`, [name, phone, mobile, email, web, address, city, region, country, postal_code, status, create_date, supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getSupplierBySupplierID: (supplier_id, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM suppliers WHERE supplier_id = ? AND company_id = ?`, [supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getAccountByAccountID: (account_id, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM accounts WHERE account_id = ? AND company_id = ?`, [account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategoryByCategoryIDAndParentName: (category_name, parent_category_id, company_id) => {
        console.log(`SELECT * FROM categories WHERE category_name = ${category_name} AND parent_category_id = ${parent_category_id} AND company_id = ${company_id} AND category_status = 1`)
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE category_name = ? AND parent_category_id = ? AND company_id = ? AND category_status = 1`, [category_name, parent_category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkExpense: (expense_id , line_item ,company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'expense_count' FROM expenses WHERE expense_id = ? AND line_item = ? AND company_id = ?`, [expense_id, line_item, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    addExpense:(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO expenses(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateExpense:(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE expenses SET line_item = ?, description = ?, expense_date = ?, expense_update_date = ?, currency = ?, payment_type = ?, account_id = ?, supplier_id = ?, supplier_name = ?, category1_id = ?, category2_id = ?, total_amount = ?, tax = ?, is_paid = ?, payment_ref_number = ?, paid_amount = ?, payment_date = ?, company_type = ? WHERE expense_id = ? AND company_id = ?`, [line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_type, expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getExpenseAttachments: (expense_id ,company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT expense_id,attachments FROM expenses WHERE expense_id = ? and company_id = ?`, [expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateExpenseAttachments: (expense_id, attachments, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE expenses SET attachments = ? WHERE expense_id = ? and company_id = ?`, [attachments, expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkAttachable: (attach_id, expense_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'attachable_count' FROM attachables WHERE expense_id = ? and attach_id = ?`, [expense_id, attach_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanyByUserID: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateUserStatus: (user_id, status) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET status = ? WHERE id = ?`, [status, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    setForeignKeyDisable: (table) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `ALTER TABLE ${table} DISABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    setForeignKeyEnable: (table) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `ALTER TABLE ${table} ENABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    },
    removeAccounts: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM accounts WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeActivities: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM activities WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeExpenses: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM expenses WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeAttachables: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM attachables WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeCategories: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM categories WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeUserRelations: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeSuppliers: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM suppliers WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeCompany: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    removeUsersOfCompany: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM users WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateLoginToken: (user_id, token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status) => {
        console.log(`UPDATE users SET token = ${token}, xero_id_token = ?,xero_access_token = ?,xero_refresh_token = ?,xero_expire_at = ?, status = ? WHERE id = ${user_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET token = ?, xero_id_token = ?,xero_access_token = ?,xero_refresh_token = ?,xero_expire_at = ?, status = ? WHERE id = ?`, [token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkUserCompanyByTenant: (tenant_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as company_count FROM companies WHERE tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateQuickbooksCompanyToken: (tenant_id, id_token, access_token, refresh_token, expire_at) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE companies SET id_token = ?, access_token = ?, refresh_token = ?, expire_at = ? WHERE tenant_id = ?`, [id_token, access_token, refresh_token, expire_at, tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCategoryByCategoryID: (category_id, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE category_id = ? AND company_id = ?`, [category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    createUser: (email, role_id, company_id, category_ids, created_by, user_type) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO users(email,role_id,company_id,category_ids,created_by,user_type) VALUES (?, ?, ?, ?, ?, ?)`, [email, role_id, company_id, category_ids, created_by, user_type],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateUser: (user_id, category_ids) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET category_ids = ? WHERE id = ?`, [category_ids, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateUserProfile: (user_id, first_name, last_name) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?,last_name = ? WHERE id = ?`, [first_name, last_name, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    changeUserPassword: (user_id, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET password = ? WHERE id = ?`, [password, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    setTokenForFirstTimeLogin: (user_id, token) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET token = ? WHERE id = ?`, [token, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    storeSubscription: (company_id, customer_id, subscription_id, amount, package_duration, quantity) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO subscriptions(company_id, customer_id, subscription_id, amount, package_duration, quantity) VALUES (? ,? ,? ,? ,?, ?)`, [company_id, customer_id, subscription_id, amount, package_duration, quantity],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateSubscription: (company_id, customer_id, subscription_id, quantity) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE subscriptions SET quantity = ? WHERE company_id = ? AND customer_id = ? AND subscription_id = ?`, [quantity, company_id, customer_id, subscription_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    deleteUserRelationsByUserId: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    deleteUserByID: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM users WHERE id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    deleteUserSubscription: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM subscriptions WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    checkSetupAccount: (token, email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'count' FROM users WHERE token = ? AND email = ?`, [token, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateAccountInformation: (email, first_name, last_name, contact, password) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET first_name = ?, last_name = ?, contact = ?, password = ?, token = NULL, is_verified = 1 WHERE email = ?`, [first_name, last_name, contact, password, email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    deactivate: (id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET status = 0 WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    activate: (id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET status = 1 WHERE id = ?`, [id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getSubscription: (company_id, subscription_plan) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT *
                FROM subscriptions where company_id = ? AND package_duration = ?`, [company_id, subscription_plan],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    updateStatusOfSubscription: (status, user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE subscriptions set status = ? WHERE user_id = ?`, [status, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getSubscriptionByUserID: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM subscriptions WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    deleteAllUserRelation: (user_id, company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE user_id = ? AND company_id = ?`, [user_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    getCompanyUsers: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT * FROM users WHERE company_id = ? AND role_id = 2`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        // console.log(error);
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        })
    },
    insertForgotPasswordToken: (email, token) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO reset_password(email, token) VALUES (?, ?)`, [email, token],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    updateForgotPasswordToken: (email, token) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE reset_password SET token = ? WHERE email = ?`, [token, email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    checkForgotPasswordToken: (email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as token_count FROM reset_password WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    checkForgotPasswordTokenWithToken: (email, token) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as token_count FROM reset_password WHERE email = ? AND token = ?`, [email, token],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    removeForgotPasswordToken: (email) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `DELETE FROM reset_password WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    setAllSupplierStatusToZero: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE suppliers SET status = 0 WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    setAllCategoryStatusToZero: (company_id) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE categories SET category_status = 0 WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    checkSubscription: (customer_id, subscription_id, company_id) => {
        console.log(`SELECT count(*) as 'subscription_count' FROM subscriptions WHERE customer_id = '${customer_id}' AND subscription_id = '${subscription_id}' AND company_id = '${company_id}'`)
        return new Promise((resolve, reject) => {
            pool.query(
                `SELECT count(*) as 'subscription_count' FROM subscriptions WHERE customer_id = ? AND subscription_id = ? AND company_id = ?`, [customer_id, subscription_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
    updateUserPlan: (user_id, subscription_type) => {
        console.log(`UPDATE users SET subscription_type = ${subscription_type} WHERE id = ${user_id}`)
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET subscription_type = ? WHERE id = ?`, [subscription_type, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    console.log(results)
                    return resolve(results);
                }
            );
        })
    },
};