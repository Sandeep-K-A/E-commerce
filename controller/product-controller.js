const layout = 'layouts/adminLayout';
const { reject } = require('bcrypt/promises');
const productHelper = require('../helpers/product-helpers')


module.exports = {
    getAllProducts: (req, res) => {
        productHelper.fetchallProducts().then((products) => {
            res.render('admin/admin-allproducts', { layout, products })
        }).catch((error) => {
            console.log(error);
            let message = "Error Fetching all Products.."
                res.render('admin/error',{message,log:true})
        })
    },
    getAddProducts: (req, res) => {
        productHelper.getAllCategory().then((categories)=>{
            res.render('admin/admin-addproducts', { layout,categories })
        }).catch((error)=>{
            console.log(error);
            let message = "Error Fetching all category.."
            res.render('admin/error',{message,log:true})
        }) 
    },
    postProducts: (req, res) => {

        let product = req.body
        let image = req.files.map(file => file.filename)
        console.log(req.files, '////////////////')
        productHelper.addProduct(product, image).then(() => {
            res.redirect('/admin/allproducts')
        }).catch((error) => {
            let message = "Error adding a new Products.."
            res.render('admin/error',{message,log:true})
        })
    },
    editProduct: (req, res) => {

        let id = req.params.id
        productHelper.getAllCategory().then((categories)=>{

            productHelper.editproductDetails(id).then((product) => {
                res.render('admin/admin-editproduct', { layout, product,categories })
            })
        }).catch((error)=>{
            let message = "Error getting edit Product.."
            res.render('admin/error',{message,log:true})
        })

    },
    updateProduct: (req, res) => {

        let product = req.body;
        let image = req.files
        console.log(product, '////////////////////////', image);
        if (image) {
            image = image.map(file => file.filename)
        } else {
            image = false
        }
        productHelper.updateProductDetails(product, image).then(() => {
            res.redirect('/admin/allproducts')
        }).catch((error)=>{
            let message = "Error updating product Details.."
            res.render('admin/error',{message,log:true})
        })

    },
    DeleteProduct: (req, res) => {

        const id = req.params.id
        console.log(id, 'popopoppoppop')
        productHelper.deleteProduct(id).then((data) => {
            console.log(data)
            res.redirect('/admin/allproducts')
        }).catch((error)=>{
            let message = "Error deleting a product.."
            res.render('admin/error',{message,log:true})
        })

    },
   
}