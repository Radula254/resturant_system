const express = require('express');
const connection = require('../connection');
const router = express.Router();
const auth = require('../services/authenticate');
const checkRole = require('../services/checkRole');

//Add Products
router.post('/add', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = "INSERT INTO product (name,categoryId,description,price,status) values(?,?,?,?,'true')";
    connection.query(query, [product.name, product.categoryId, product.description, product.price], (err, results) => {
        if (!err) {
            return res.status(200).json({
                message: 'Product added successfully'
            });
        } else {
            return res.status(500).json(err);
        }
    });
});

//Get products
router.get('/get', auth.authenticateToken, (req, res) => {
    const query = "SELECT p.id, p.name, p.price, p.status, c.id AS categoryId, c.name AS categoryName FROM product AS p INNER JOIN category as c WHERE p.categoryId = c.id";
    connection.query(query, (err, results) => {
        if(!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

//Get product by category ID
router.get('/getByCategoryId/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "SELECT id, name FROM product WHERE categoryId=? and status='true'";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

//Get product by ID
router.get('/getById/:id', auth.authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = "SELECT id, name, description, price FROM product WHERE id = ?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        } else {
            return res.status(500).json(err);
        }
    });
});

//Update Product
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const product = req.body;
    const query = "UPDATE product set name=?, categoryId=?, description=?, price=? WHERE id=?";
    connection.query(query, [product.name, product.categoryId, product.description, product.price, product.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0 ) {
                return res.status(404).json({
                    message: "Product id not found"
                });
            }
            return res.status(200).json({
                message: "Product successfully updated"
            });
        }
        else{
            return res.status(500).json(err);
        }
    });
});

//Delete a product
router.delete("/delete/:id", auth.authenticateToken, checkRole.checkRole, (req, res) => {
    const id = req.params.id;
    const query = "DELETE FROM product WHERE id=?";
    connection.query(query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0 ) {
                return res.status(404).json({
                    message:"Product not found!"
                });
            }
            return res.status(200).json({
                message: "Product deleted successfully"
            });
        } 
        else {
            return res.status(500).json(err);
        }
    });
});

//Update Product status
router.patch('/updateStatus',auth.authenticateToken , checkRole.checkRole, (req, res) => {
    const user = req.body;
    const query = "UPDATE product set status=? WHERE id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows === 0){
                return res.status(404).json({
                    message: "Product not found!"
                });
            }
            return res.status(200).json({
                message: "Product Status updated successfully"
            });
        } else {
            return res.status(500).json(err);
        }
    });
});

module.exports = router;