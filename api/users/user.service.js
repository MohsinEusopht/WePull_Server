const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");


module.exports = {
    getUserByEmail: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getLoginToken: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT token FROM users WHERE email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyByID: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAdminActiveCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT *
                FROM companies where user_id = ? and active_status = 1`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserCategories: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanies: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCategories: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCategoriesForDashboard: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCategoriesForUserCreation: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getSuppliers: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM suppliers WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUsers: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM users WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getExpenses: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT e.expense_id,e.expense_date,e.description,e.total_amount,e.is_paid,e.tax,e.paid_amount,e.payment_date,a.name as 'account_name',s.name as 'supplier_name',cat1.category_name as 'category_1',cat2.category_name as 'category_2',e.attachments FROM \`expenses\` e LEFT JOIN accounts a ON a.id = e.account_id LEFT JOIN suppliers s ON s.id = e.supplier_id LEFT JOIN categories cat1 ON cat1.id = e.category1_id LEFT JOIN categories cat2 ON cat2.id = e.category2_id WHERE e.company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAttachables: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM attachables WHERE company_id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    disableAllCompany: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 0 WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    activateCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET active_status = 1 WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getLastSyncedActivity: (company_id, type) => {
        console.log(`SELECT * FROM activities WHERE company_id = ${company_id} and type = ${type} ORDER BY id DESC LIMIT 1`);
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM activities WHERE company_id = ? and type = ? ORDER BY id DESC LIMIT 1`, [company_id, type],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createUserAccount: (first_name,last_name, email,xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, user_type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO users(first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, token, user_type, role_id) VALUES (? ,? ,?, ? ,? ,?, ?, ?, ?, ?, 1)`, [first_name, last_name, email, xero_user_id, xero_id_token, xero_access_token,xero_refresh_token,xero_expire_at, token, user_type],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    storeActivity:(title, description, type, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO activities(title, description, type, company_id, user_id) VALUES (?, ?, ?, ?, ?)`, [title, description, type, company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateAccountEmail: (id, email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET email = ? WHERE id = ?`, [email, id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserEmail: (email) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as user_count FROM users where email = ?`, [email],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkCompanyExist: (tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as company_count FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyByTenant: (tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies where tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyById: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies where id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getUserById: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM users where id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createCompany: (company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO companies(company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date) VALUES (? ,?, ?, ?, ?, ?, ?, ?, ?)`, [company_name, connection_id, tenant_id, company_type, industry_type, type, currency, user_id, create_date],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createUserRole: (user_id ,company_id, category_id,role_id ,created_by) => {
        return new Promise((resolov, reject) => {
            console.log("create role log: ",user_id, company_id, role_id, created_by);
            pool.query(
                `INSERT INTO user_relations(user_id,company_id,category_id,role_id,created_by) VALUES (?, ?, ?, ?, ?)`, [user_id, company_id, category_id, role_id, created_by],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateAllCompanies: (tenant_id, company_name, currency) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET company_name = ?, currency = ? WHERE tenant_id = ?`, [company_name, currency, tenant_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkCategory: (category_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'category_count' FROM categories WHERE category_id = ? and company_id = ?`, [category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    addCategory:(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO categories(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, created_by, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateCategory:(category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE categories SET category_name = ?, category_parent = ?, category_status = ?, parent_category_id = ?, parent_category_name = ?, category_type = ? WHERE category_id = ? AND company_id = ?`, [category_name, category_id, category_parent, category_status, parent_category_id, parent_category_name, category_type, category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkAccount: (account_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'account_count' FROM accounts WHERE account_id = ? and company_id = ?`, [account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    createAccount: (name, account_id, account_type, description, currency_code, status, company_id, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO accounts(name, account_id, account_type, description, currency_code, status, company_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [name, account_id, account_type, description, currency_code, status, company_id, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateAccount: (name, account_id, description, currency_code, status, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE accounts SET name = ?, account_type = ?, description = ?, currency_code = ?, status = ? WHERE account_id = ? AND company_id = ?`, [name, account_id, account_type, description, currency_code, status, account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkSupplier: (supplier_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'supplier_count' FROM suppliers WHERE supplier_id = ? and company_id = ?`, [supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    addSupplier: (name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO suppliers(name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, type, company_id, user_id, create_date],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateSupplier: (name, supplier_id, phone, mobile, email, web, address, city, region, country, postal_code, status, company_id, create_date) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE suppliers SET name = ?, phone = ?, mobile = ?, email = ?, web = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, status = ?, create_date = ? WHERE supplier_id = ? AND company_id = ?`, [name, phone, mobile, email, web, address, city, region, country, postal_code, status, create_date, supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getSupplierBySupplierID: (supplier_id, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM suppliers WHERE supplier_id = ? AND company_id = ?`, [supplier_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getAccountByAccountID: (account_id, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM accounts WHERE account_id = ? AND company_id = ?`, [account_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCategoryByCategoryIDAndParentName: (category_name, parent_category_id, company_id) => {
        console.log(`SELECT * FROM categories WHERE category_name = ${category_name} AND parent_category_id = ${parent_category_id} AND company_id = ${company_id}`)
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE category_name = ? AND parent_category_id = ? AND company_id = ?`, [category_name, parent_category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkExpense: (expense_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'expense_count' FROM expenses WHERE expense_id = ? and company_id = ?`, [expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    addExpense:(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `INSERT INTO expenses(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateExpense:(expense_id, line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_id, company_type) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE expenses SET line_item = ?, description = ?, expense_date = ?, expense_update_date = ?, currency = ?, payment_type = ?, account_id = ?, supplier_id = ?, supplier_name = ?, category1_id = ?, category2_id = ?, total_amount = ?, tax = ?, is_paid = ?, payment_ref_number = ?, paid_amount = ?, payment_date = ?, company_type = ? WHERE expense_id = ? AND company_id = ?`, [line_item, description, expense_date, expense_update_date, currency, payment_type, account_id, supplier_id, supplier_name, category1_id, category2_id, total_amount, tax, is_paid, payment_ref_number, paid_amount, payment_date, company_type, expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getExpenseAttachments: (expense_id ,company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT expense_id,attachments FROM expenses WHERE expense_id = ? and company_id = ?`, [expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateExpenseAttachments: (expense_id, attachments, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE expenses SET attachments = ? WHERE expense_id = ? and company_id = ?`, [expense_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkAttachable: (attach_id, expense_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as 'attachable_count' FROM attachables WHERE expense_id = ? and attach_id = ?`, [expense_id, attach_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCompanyByUserID: (user_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM companies WHERE user_id = ?`, [user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateUserStatus: (user_id, status) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET status = ? WHERE id = ?`, [status, user_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    setForeignKeyDisable: (table) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `ALTER TABLE ${table} DISABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        });
    },
    setForeignKeyEnable: (table) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `ALTER TABLE ${table} ENABLE KEYS;`, [],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        });
    },
    removeAccounts: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM accounts WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeActivities: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM activities WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeExpenses: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM expenses WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeAttachables: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM attachables WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeCategories: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM categories WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeUserRelations: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM user_relations WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeSuppliers: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM suppliers WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM companies WHERE id = ?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    removeUsersOfCompany: (company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `DELETE FROM users WHERE company_id=?`, [company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateLoginToken: (user_id, token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status) => {
        console.log(`UPDATE users SET token = ${token}, xero_id_token = ?,xero_access_token = ?,xero_refresh_token = ?,xero_expire_at = ?, status = ? WHERE id = ${user_id}`)
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE users SET token = ?, xero_id_token = ?,xero_access_token = ?,xero_refresh_token = ?,xero_expire_at = ?, status = ? WHERE id = ?`, [token, xero_id_token,xero_access_token, xero_refresh_token, xero_expire_at, status, user_id],
                (error, results, fields) => {
                    if (error) {
                        console.log(error);
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    checkUserCompanyByTenant: (tenant_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT count(*) as company_count FROM companies WHERE tenant_id = ?`, [tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    updateQuickbooksCompanyToken: (tenant_id, id_token, access_token, refresh_token, expire_at) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `UPDATE companies SET id_token = ?, access_token = ?, refresh_token = ?, expire_at = ? WHERE tenant_id = ?`, [id_token, access_token, refresh_token, expire_at, tenant_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    },
    getCategoryByCategoryID: (category_id, company_id) => {
        return new Promise((resolov, reject) => {
            pool.query(
                `SELECT * FROM categories WHERE category_id = ? AND`, [category_id, company_id],
                (error, results, fields) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolov(results);
                }
            );
        })
    }
};