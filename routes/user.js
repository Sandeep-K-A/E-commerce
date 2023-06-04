const express = require('express');
const userController = require('../controller/user-controller');
const router = express.Router();
const { getHome,getSignup, postSignup,getSignin, postSignin,Otpsignin,getOtp, OtpLogin,logOut,getShop,productView,getAccount,getCart,addToCart,updateQuantity,getAddaddress,newAddress,getCheckOut,placeOrder,viewOrders,orderDetails,removeProduct,clearCart,orderPlaced,verifyPayment,editAddress,updateUserDetails,getForgotPassword,postForgotPassword,passwordChange,updateUserPassword,cancelOrder,returnOrder,getSearchProducts,getInvoice} = require('../controller/user-controller');
// const { getcartCount } = require('../helpers/cart-helpers');
const {processCoupon} = require('../controller/coupon-controller')
const {isLoggedIn,isBlocked} = require('../middleware/middleware')


/* GET users listing. */

// router.use((req,res,next)=>{
//     var cartCount = null;
//     if(req.session.user){
//         const id = req.session.user._id;
//         getcartCount(id).then((count)=>{
//             cartCount = count;
//         })
//     }
//     console.log(cartCount,'UUUUUUUUUUUUUUUUUUUUU')
//     next();
// })
router.get('/',getHome)
router.get('/logout',logOut)
router.get('/signup',getSignup)
router.post('/signup',postSignup)
router.get('/signin',getSignin)
router.post('/signin',postSignin)
router.get('/otpsignin',Otpsignin)
router.post('/otpsignin',getOtp)
router.post('/otpverify',OtpLogin)
router.get('/shop',isBlocked,getShop)
router.post('/search/:key',getSearchProducts)
router.get('/quickview/:id',productView)
router.get('/account',isBlocked,isLoggedIn,getAccount)
router.get('/cart',isBlocked,isLoggedIn,getCart)
router.get('/add-to-cart/:id',isBlocked,isLoggedIn,addToCart)
router.post('/change-product-quantity',isBlocked,isLoggedIn,updateQuantity)
router.get('/add-address',isBlocked,isLoggedIn,getAddaddress)
router.post('/add-address',isBlocked,isLoggedIn,newAddress)
router.get('/checkout',isBlocked,isLoggedIn,getCheckOut)
router.post('/placeorder',isBlocked,isLoggedIn,placeOrder)
router.get('/order-placed',isBlocked,isLoggedIn,orderPlaced)
router.get('/allorders',isBlocked,isLoggedIn,viewOrders)
router.get('/cancel-order/:id',isBlocked,isLoggedIn,cancelOrder)
router.get('/return-order/:id',isBlocked,isLoggedIn,returnOrder)
router.get('/orderdetails/:id',isBlocked,isLoggedIn,orderDetails)
router.get('/invoice/:id',isBlocked,isLoggedIn,getInvoice)
router.post('/remove-single-product',isBlocked,isLoggedIn,removeProduct)
router.get('/clear-cart/:id',isBlocked,isLoggedIn,clearCart)
// router.get('/manage-address',displayAllAddress)
router.post('/verify-payment',isBlocked,isLoggedIn,verifyPayment)
router.post('/edit-address',isBlocked,isLoggedIn,editAddress)
router.post('/update-account',isBlocked,isLoggedIn,updateUserDetails)
router.post('/apply-coupon/:id',isBlocked,isLoggedIn,processCoupon)
router.get('/apply-coupon/:id',isBlocked,isLoggedIn,processCoupon)
router.get('/forgot-password',getForgotPassword)
router.post('/forgot-password',postForgotPassword)
router.post('/otp-forgotpassword',passwordChange)
router.post('/password-change',updateUserPassword)


module.exports = router;
