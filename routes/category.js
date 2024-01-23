const express = require('express');
const connection = require('../connection');
const router = express.Router();
const auth = require('../services/authenticate');
const checkRole = require('../services/checkRole');

//Adding a new category
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const category = req.body;
    query = "INSERT INTO category (name) values(?)";
    connection.query(query, [category.name], (err, results) => {
        if (!err) {
            return res.status(200).json({
                message: "Category added Successfully"
            });
        }
        else {
            return res.status(500).json(err);
        }
    });
});

//Geting the categories
router.get('/get', auth.authenticateToken, (req, res) => {
    const query = "SELECT * FROM category ORDER BY name";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

//Update a category
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = "UPDATE category SET name=? WHERE id=?";
    connection.query(query, [product.name, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).send("No Category Found");
            }
            return res.status(200).json({
                message: "Category Updated Successfully"
            });
        } else {
            return res.status(500).json(err);
        }
    });
});



module.exports = router;