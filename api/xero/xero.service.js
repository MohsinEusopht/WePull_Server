const e = require("express");
const pool = require("../../config/database");

const AppError = require("../../utils/appError");
const json = require("body-parser/lib/types/json");

module.exports = {
    updateRefreshToken: (user_id, xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at) => {
        return new Promise((resolve, reject) => {
            pool.query(
                `UPDATE users SET xero_id_token = ?,xero_access_token = ?, xero_refresh_token = ?,xero_expire_at = ? WHERE id = ?`, [xero_id_token, xero_access_token, xero_refresh_token, xero_expire_at, user_id],
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
};