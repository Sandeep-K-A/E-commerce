const express = require('express');
const userController = require('../controller/user-controller');
const router = express.Router();
const { getHome,getSignup, postSignup,getSignin, postSignin,Otpsignin,getOtp, OtpLogin,logOut,getShop,productView,getAccount,getCart,addToCart,updateQuantity,getAddaddress,newAddress,getCheckOut,placeOrder,viewOrders,orderDetails,removeProduct,clearCart,orderPlaced,verifyPayment,editAddress,updateUserDetails,getForgotPassword,postForgotPassword,passwordChange,updateUserPassword,cancelOrder,returnOrder,getSearchProducts,getInvoice} = require('../controller/user-controller');
// const { getcartCount } = require('../helpers/cart-helpers');
const {processCoupon} = require('../controller/coupon-controller')
const {isLoggedIn,isBlocked} = require('../middleware/middleware')


/*******************************User Signup and Signin routes*******************************/

router.get('/',getHome)
router.get('/logout',logOut)
router.get('/signup',getSignup)
router.post('/signup',postSignup)
router.get('/signin',getSignin)
router.post('/signin',postSignin)
router.get('/otpsignin',Otpsignin)
router.post('/otpsignin',getOtp)
router.post('/otpverify',OtpLogin)

/*******************************User Shop and Shop routes*******************************/

router.get('/shop',isBlocked,getShop)
router.post('/search/:key',getSearchProducts)
router.get('/quickview/:id',productView)

/*******************************User cart and cart routes*******************************/

router.get('/cart',isBlocked,isLoggedIn,getCart)
router.get('/add-to-cart/:id',isBlocked,isLoggedIn,addToCart)
router.post('/change-product-quantity',isBlocked,isLoggedIn,updateQuantity)
router.post('/remove-single-product',isBlocked,isLoggedIn,removeProduct)
router.get('/clear-cart/:id',isBlocked,isLoggedIn,clearCart)

/*******************************User Order and Order routes*******************************/

router.get('/checkout',isBlocked,isLoggedIn,getCheckOut)
router.post('/apply-coupon/:id',isBlocked,isLoggedIn,processCoupon)
router.get('/apply-coupon/:id',isBlocked,isLoggedIn,processCoupon)
router.post('/placeorder',isBlocked,isLoggedIn,placeOrder)
router.post('/verify-payment',isBlocked,isLoggedIn,verifyPayment)
router.get('/order-placed',isBlocked,isLoggedIn,orderPlaced)


/*******************************User Account and Account routes*******************************/
router.get('/account',isBlocked,isLoggedIn,getAccount)
router.get('/add-address',isBlocked,isLoggedIn,getAddaddress)
router.post('/add-address',isBlocked,isLoggedIn,newAddress)
router.get('/allorders',isBlocked,isLoggedIn,viewOrders)
router.get('/cancel-order/:id',isBlocked,isLoggedIn,cancelOrder)
router.get('/return-order/:id',isBlocked,isLoggedIn,returnOrder)
router.get('/orderdetails/:id',isBlocked,isLoggedIn,orderDetails)
router.get('/invoice/:id',isBlocked,isLoggedIn,getInvoice)
router.post('/edit-address',isBlocked,isLoggedIn,editAddress)
router.post('/update-account',isBlocked,isLoggedIn,updateUserDetails)
router.get('/forgot-password',getForgotPassword)
router.post('/forgot-password',postForgotPassword)
router.post('/otp-forgotpassword',passwordChange)
router.post('/password-change',updateUserPassword)


module.exports = router;
