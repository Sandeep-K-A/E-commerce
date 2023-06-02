const express = require('express');
const router = express.Router();
const layout = 'layouts/adminLayout'
const fileUpload = require('express-fileupload')

const upload = require('../middleware/multer')
const {adminSignin , adminHome,adminVerify,adminAllUsers,userStatus,adminLogout,adminCategory,addCategory,editCategory, updateCategory, categoryStatus,getAllOrders,getOrderDetails,changeOrderStatus,getAddBanner,postAddBanner,getAllBanners,getEditBanner,postEditBanner,deleteBanner,adminSignup,postadminSignup} = require('../controller/admin-controller')
const {getAllCoupons,getAddCoupons,postAddCoupons,deleteCoupon,getEditCoupon,postEditCoupon} = require('../controller/coupon-controller')
const {getAllProducts,getAddProducts,postProducts,editProduct,updateProduct,DeleteProduct} = require('../controller/product-controller')
const {isadminLoggedIn} = require('../middleware/middleware')

/*******************************Admin Signup and Signin routes*******************************/
router.get('/signup',adminSignup)
router.post('/signup',postadminSignup)
router.get('/',adminSignin)
router.post('/',adminVerify)
router.get('/adminhome',isadminLoggedIn,adminHome)
router.get('/logout',adminLogout)
/*******************************Admin User Management****************************************/ 
router.get('/allusers',isadminLoggedIn,adminAllUsers)
router.get('/allusers/:id',userStatus)

/*******************************Admin Product Management*************************************/
router.get('/allproducts',isadminLoggedIn,getAllProducts)
router.get('/addproducts',isadminLoggedIn,getAddProducts)
router.post('/addproducts',upload.array('productImage',4),postProducts)
router.get('/editproduct/:id',isadminLoggedIn,editProduct)
router.post('/editproduct',upload.array('productImage',4),updateProduct)
router.get('/deleteproduct/:id',isadminLoggedIn,DeleteProduct)

/*******************************Admin Category Management************************************/
router.get('/categories',isadminLoggedIn,adminCategory)
router.post('/addcategory',isadminLoggedIn,addCategory)
router.get('/editcategory/:id',isadminLoggedIn,editCategory)
router.post('/editcategory',isadminLoggedIn,updateCategory)
router.get('/blockcategory/:id',isadminLoggedIn,categoryStatus)

/*******************************Admin Order Management***************************************/
router.get('/orders',isadminLoggedIn,getAllOrders)
router.get('/order-details/:id',isadminLoggedIn,getOrderDetails)
router.get('/order-status/:id',isadminLoggedIn,changeOrderStatus)

/*******************************Admin Coupon Management**************************************/
router.get('/coupons',isadminLoggedIn,getAllCoupons)
router.get('/add-coupons',isadminLoggedIn,getAddCoupons)
router.post('/add-coupons',isadminLoggedIn,postAddCoupons)
router.get('/delete-coupon/:id',isadminLoggedIn,deleteCoupon)
router.get('/edit-coupon/:id',isadminLoggedIn,getEditCoupon)
router.post('/edit-coupon',isadminLoggedIn,postEditCoupon)

/*******************************Admin Banner Management**************************************/
router.get('/add-banners',isadminLoggedIn,getAddBanner)
router.post('/add-banners',isadminLoggedIn,fileUpload(),postAddBanner)
router.get('/banners',isadminLoggedIn,getAllBanners)
router.get('/edit-banner/:id',isadminLoggedIn,getEditBanner)
router.post('/edit-banner',isadminLoggedIn,fileUpload(),postEditBanner)
router.get('/delete-banner/:id',isadminLoggedIn,deleteBanner)
module.exports = router;
