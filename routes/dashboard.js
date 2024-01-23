const express = require('express');
const connection = require('../connection');
const router = express.Router();
const auth = require('../services/authenticate');

router.get('/details', auth.authenticateToken, (req, res) => {
    var categoryCount;
    var productCount
    var billCount;
    var query = "SELECT COUNT(id) AS categoryCount FROM category";
    connection.query(query, (err, results) => {
        if (!err) {
            categoryCount = results[0].categoryCount;
        }
        else {
            return res.status(500).json(err);
        }
    });

    var query = "SELECT COUNT(id) AS productCount FROM product";
    connection.query(query, (err, results) => {
        if (!err) {
            productCount = results[0].productCount;
        }
        else {
            return res.status(500).json(err);
        }
    });

    var query = "SELECT COUNT(id) AS billCount FROM bill";
    connection.query(query, (err, results) => {
        if (!err) {
            billCount = results[0].billCount;
            var data = {
                categoryCount: categoryCount,
                productCount: productCount,
                billCount: billCount
            };
            return res.status(200).json(data);
        }
        else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;