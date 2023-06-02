const { reject } = require('bcrypt/promises');
const userHelper = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers');
const cartHelpers = require('../helpers/cart-helpers')
const addressHelpers = require('../helpers/address-helpers')
const orderHelpers = require('../helpers/orders-helpers');
const couponHelper = require('../helpers/coupon-helpers')
const toastr = require('toastr');
const ordersHelpers = require('../helpers/orders-helpers');

module.exports = {

    getHome: (req, res) => {
        const user = req.session.user
        let cartCount = null;
        userHelper.fetchProducts().then((products) => {
            if (user) {
                const id = user._id;
                cartHelpers.getcartCount(id).then((count) => {
                    cartCount = count
                    console.log(cartCount)
                    userHelper.fetchDisplayBanner().then((banners) => {
                        res.render('user/index', { user, products, cartCount, banners })
                    })
                }).catch((error) => {
                    let message = "Error Fetching Cart Count"
                    res.render('user/error', { message, log: true })
                })
            } else {
                userHelper.fetchDisplayBanner().then((banners) => {
                    res.render('user/index', { user, products, banners })
                })
            }
        }).catch((error) => {
            console.log(error);
            let message = "Error Fetching Products"
            res.render('user/error', { message, log: true })

        })

    },
    getSignup: (req, res) => {
        res.render('user/user-signup', { log: true })
    },
    postSignup: (req, res) => {
        const user = req.body
        userHelper.createNewUser(user).then((newUser) => {
            req.session.user = newUser
            console.log(req.session.user)
            res.redirect('/')
        }).catch((error) => {
            let message = "Error Creating a new User Account"
            res.render('user/error', { message, log: true })
        })
    },
    getSignin: (req, res) => {
        if (req.session.user) {
            res.redirect('/')
        }
        res.render('user/user-signin', { log: true });
    },
    postSignin: (req, res) => {
        const user = req.body;
        userHelper.userLogin(user).then((response) => {
            if (response.status) {
                req.session.user = response.user;
                res.redirect('/')
            } else {
                res.redirect('/signin')
            }
        }).catch((error) => {
            console.log(error)
            let err = "Invalid User!!"
            res.render('user/user-signin', { err, log: true })
        })
    },
    Otpsignin: (req, res) => {
        res.render('user/getOtp', { log: true })
    },

    getOtp: (req, res) => {
        const user = req.body;
        // console.log(user,'))))))))))))))))))))))))))))')
        req.session.phone = user.phone;
        let phone = user.phone
        userHelper.otpGenerate(user).then((response) => {
            if (user.resend) {
                res.json({ status: true })
            } else {
                res.render('user/otpLogin', { log: true, phone })
            }

        }).catch((error) => {
            console.log(error)
            let message = "Error Generating Otp.."
            // res.redirect('/otpsignin')
            res.render('user/error', { message, log: true })

        })

    },
    OtpLogin: (req, res) => {
        const otp = req.body.otp
        const number = req.session.phone;
        // console.log(otp + '#################' + number)
        userHelper.verifyOtp(otp, number).then((response) => {
            if (response.status) {
                req.session.user = response.user
                res.redirect('/');
            } else {
                let err = "Invalid OTP"
                res.render('user/otpLogin', { err, log: true })
            }
        }).catch((error) => {
            let message = "Error Verifying Otp"
            // res.redirect('/signin')
            res.render('user/error', { message, log: true })
        })
    },
    logOut: (req, res) => {
        req.session.user = null
        res.redirect('/')
    },
    getShop: async (req, res) => {
        const user = req.session.user
        let query = {}
        if (req.session.query) {
            query = req.session.query
        }
        const page = req.query.page ? req.query.page : 1
        query.category = req.query.category
        query.sort = req.query.sort
        req.session.query = query;
        const allProducts = await productHelpers.fetchallProducts()
        userHelper.userProducts(page, query).then((result) => {
            const products = result.data
            const pagination = result.pagination
            productHelpers.getAllCategory().then((categories) => {
                productHelpers.productsCategory(allProducts, categories).then((matchingCategory) => {
                    if (user) {
                        const id = user._id;
                        cartHelpers.getcartCount(id).then((cartCount) => {
                            res.render('user/user-shop', { products, user, matchingCategory, cartCount, pagination })
                        })
                    } else {
                        res.render('user/user-shop', { products, user, matchingCategory, pagination })
                    }
                })
            })
        }).catch((error) => {
            console.log(error);
            let message = "Error Fetching Shop Details.."
            res.render('user/error', { message, log: true })
        })
    },
    productView: ((req, res) => {
        const id = req.params.id
        const user = req.session.user
        console.log(id)
        userHelper.fetchSingleProduct(id).then((product) => {
            if (user) {
                const userId = req.session.user._id;
                cartHelpers.getcartCount(userId).then((count) => {
                    let cartCount = count
                    res.render('user/user-productView', { product, cartCount, user })
                })
            } else {
                res.render('user/user-productView', { product })
            }
            // console.log(product.ProductImages[0], 'llllllllllllllllll')

        }).catch((error) => {
            let message = "Error Fetching Product Details.."
            res.render('user/error', { message, log: true })
        })
    }),
    getAccount: (req, res) => {
        const user = req.session.user
        const id = req.session.user._id;
        let cartCount = null
        addressHelpers.fetchAllAddress(id).then((addresses) => {
            userHelper.getUserDetails(id).then((userDetails) => {
                cartHelpers.getcartCount(id).then((count)=>{
                    cartCount = count
                    res.render('user/user-account', { user, addresses, userDetails, cartCount })
                })
               
            })
        }).catch((error) => {
            let message = "Error Fetching User Account..."
            res.render('user/error', { message, log: true })
        })
    },
    getCart: (req, res) => {
        const user = req.session.user
        const id = req.session.user._id
        console.log(user)
        // console.log(id+"jijih")
        cartHelpers.displayCart(id).then((cartItems) => {
            // console.log(cartItems);
            cartHelpers.getcartCount(id).then((cartCount)=>{
                res.render('user/user-cart', { cartItems, user,cartCount })
            })
           
        }).catch((error) => {
            console.log('error occured')
            res.render('user/user-cart', { user })
        })

    }
    ,
    addToCart: (req, res) => {
        if (!req.session.user) {
            res.json({ status: false })
        }
        const id = req.params.id;
        const userId = req.session.user._id;
        cartHelpers.updateCart(id, userId).then((response) => {
            // toastr.options.timeOut = 500;
            // toastr.success('Item added to Cart..')
            res.json({ status: true })
        }).catch((error) => {
            let message = "Error adding product to Cart.."
            res.render('user/error', { message, log: true })
        })
    },
    updateQuantity: (req, res) => {
        const id = req.session.user._id
        console.log(req.body)
        cartId = req.body.cart;
        proId = req.body.product;
        count = req.body.count;
        quantity = req.body.quantity;
        subTotal = req.body.subTotal;
        unitPrice = req.body.unitPrice;
        cartHelpers.changeProductQuantity(cartId, proId, count, quantity, subTotal, unitPrice).then((response) => {
            cartHelpers.displayCart(id).then((cartItems) => {
                res.json({ response, cartItems })
            }).catch((error) => {
                let message = "Error Displaying the cart.."
                res.render('user/error', { message, log: true })
            })

        })
    },
    getAddaddress: (req, res) => {
        res.render('user/add-address')
    },
    newAddress: (req, res) => {
        console.log('>?>?>?>?>?>?>?>?>??')
        const id = req.session.user._id;
        addressHelpers.addAddress(id, req.body).then(() => {
            res.redirect('/account')
        }).catch((err) => {
            console.log(err);
            let message = "Error adding a new Address.."
            res.render('user/error', { message, log: true })
        })
    },
    getCheckOut: (req, res) => {
        const id = req.session.user._id;
        const user = req.session.user
        addressHelpers.fetchAllAddress(id).then((addresses) => {
            console.log(addresses)
            cartHelpers.fetchCart(id).then((cartItems) => {
                console.log(cartItems)
                couponHelper.displayCoupons().then((validCoupons) => {
                    orderHelpers.checkWalletAmount(id, cartItems.totalAmount).then((Wallet) => {
                        console.log(Wallet, '___________________________userWallet')
                        if (Wallet.validAmount) {
                            res.render('user/user-checkout', { addresses, cartItems, validCoupons, user, Wallet })
                        } else {
                            res.render('user/user-checkout', { addresses, cartItems, validCoupons, user })
                        }
                    })

                })
            })
        }).catch((error) => {
            let message = "Error Proceding to Checkout.."
            res.render('user/error', { message, log: true })
        })

    },
    placeOrder: (req, res) => {
        const user = req.session.user
        const id = req.session.user._id;
        if (req.body.coupon_Code != '') {
            req.session.CouponApplied = req.body.coupon_Code;
        }
        console.log(req.body, 'SSSSSSSSSSSSSSSSSSS')
        orderHelpers.processOrder(req.body, id).then((order) => {
            console.log(order, '_______________________________order')
            if (req.body.payment_option === 'COD') {
                cartHelpers.deleteCart(id).then(() => {
                    if (req.body.coupon_Code === '') {
                        res.json({ codSuccess: true })
                    } else {
                        couponHelper.expireUserCoupon(req.body.coupon_Code, id).then(() => {
                            res.json({ codSuccess: true })
                        })
                    }

                })
            } else if (req.body.payment_option === 'RazorPay') {
                const orderId = order._id
                const totalAmount = order.TotalAmount
                userHelper.generateRazorpay(orderId, totalAmount).then((order) => {
                    res.json(order)
                })
            } else {
                const total = order.TotalAmount;
                console.log(total)
                userHelper.deductWalletAmount(id, total).then(() => {
                    cartHelpers.deleteCart(id).then(() => {
                        if (req.body.coupon_Code === '') {
                            res.json({ codSuccess: true })
                        } else {
                            couponHelper.expireUserCoupon(req.body.coupon_Code, id).then(() => {
                                res.json({ codSuccess: true })
                            })
                        }

                    })
                })
            }
        }).catch((error) => {
            let message = "Error Placing order.."
            res.render('user/error', { message, log: true })
        })
    },
    verifyPayment: (req, res) => {
        const id = req.session.user._id
        userHelper.verifyRazorPayPayment(req.body).then(() => {
            orderHelpers.changePaymentDetails(req.body).then(() => {
                cartHelpers.deleteCart(id).then(() => {
                    console.log('Payment Successful')
                    if (req.session.CouponApplied) {
                        couponHelper.expireUserCoupon(req.session.CouponApplied, id).then(() => {
                            req.session.CouponApplied = null
                            res.json({ status: true })
                        })
                    } else {
                        res.json({ status: true })
                    }
                })
            }).catch((err) => {
                console.log(err)
                res.json({ status: 'Payment failed' })
            })
        })
    },
    orderPlaced: (req, res) => {
        const user = req.session.user;
        res.render('user/user-orderPlaced', { user })
    },
    viewOrders: (req, res) => {
        const user = req.session.user
        const id = req.session.user._id;
        const sortField = req.query.sortField || 'orderId';
        const sortOrder = req.query.sortOrder || 'desc';
        const searchQuery = req.query.searchQuery || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = 2;
        let cartCount = null;

        const search = searchQuery ? {
            $or: [
              

              { PaymentMethod: { $regex: new RegExp(searchQuery, 'i') } },
              { Status: { $regex: new RegExp(searchQuery, 'i') } }
              // Add more fields as needed
            ]
          } : {};

        orderHelpers.getCount(id, search).then((totalCount) => {
            const totalPages = Math.ceil(totalCount / perPage);
            const skip = (page - 1) * perPage;


            orderHelpers.getAllOrder(id,sortField,sortOrder,skip,perPage,search).then((allOrder) => {
                cartHelpers.getcartCount(id).then((count)=>{
                    cartCount = count;
                    res.render('user/user-orderhistory', { user,allOrder,sortField,sortOrder,searchQuery,currentPage:page,totalPages,cartCount })
                })
                
            }).catch((error) => {
                console.log(error)
                let message = "Error viewing all orders.."
                res.render('user/error', { message, log: true })
            })
        }).catch((error) => {
            console.log(error)
            let message = "Error performing count Operation.."
            res.render('user/error', { message, log: true })
        })

    },
    orderDetails: (req, res) => {
        const id = req.params.id
        const userId = req.session.user._id

        orderHelpers.fetchOrderDetails(id).then((orderInfo) => {
            res.render('user/user-orderDetails', { orderInfo })
        }).catch((error) => {
            let message = "Error Fetching Order Details.."
            res.render('user/error', { message, log: true })
        })

    },
    removeProduct: (req, res) => {
        cartId = req.body.cart;
        proId = req.body.product;
        cartHelpers.removeSingleProduct(cartId, proId).then((response) => {
            console.log(response)
            res.json({ response })
        }).catch((error) => {
            let message = "Error removing a product.."
            res.render('user/error', { message, log: true })
        })
    },
    clearCart: (req, res) => {
        cartId = req.params.id;
        cartHelpers.clearCartProducts(cartId).then(() => {
            res.redirect('/cart')
        }).catch((error) => {
            let message = "Error clearing the Cart.."
            res.render('user/error', { message, log: true })
        })
    },
    editAddress: (req, res) => {
        const id = req.session.user._id;
        addressHelpers.updateAddress(id, req.body).then((address) => {
            res.json({ status: true, address })
        }).catch((error) => {
            console.log(error);
            res.json({ status: false })
        })
    },
    updateUserDetails: (req, res) => {
        console.log('++++++++++++++++++++++++++++++')
        console.log(req.body, '_________________');
        userHelper.changeUserDetails(req.body).then((response) => {
            res.json(response);
        }).catch((error) => {
            let message = "Error updating user Account Details.."
            res.render('user/error', { message, log: true })
        })
    },
    getForgotPassword: (req, res) => {
        res.render('user/user-forgotpassword', { log: true })
    },
    postForgotPassword: (req, res) => {
        const user = req.body
        req.session.phone = user.phone
        userHelper.otpGenerate(user).then(() => {
            res.render('user/user-otpforgotpassword', { log: true })
        })
    },
    passwordChange: (req, res) => {
        const otp = req.body.otp
        const number = req.session.phone;
        userHelper.verifyOtp(otp, number).then((response) => {
            if (response.status) {
                res.render('user/user-passwordchange', { log: true });
            } else {
                let err = "Invalid OTP"
                res.render('user/user-otpforgotpassword', { err, log: true })
            }
        })
    },
    updateUserPassword: (req, res) => {
        const newPassword = req.body.newPassword;
        const number = req.session.phone
        userHelper.changeUserPassword(newPassword, number).then((response) => {
            if (response.Status) {
                res.redirect('/signup')
            }
        }).catch((error) => {
            let message = "Error updating the new user password."
            res.render('user/error', { message, log: true })
        })
    },
    cancelOrder: (req, res) => {
        const orderId = req.params.id;
        const userId = req.session.user._id;
        orderHelpers.cancelSingleOrder(orderId, userId).then((response) => {
            if (response.Status) {
                res.json(response)
            }
        }).catch((error) => {
            let message = "Error performing cancel order operation."
            res.render('user/error', { message, log: true })
        })
    },
    returnOrder: (req, res) => {
        const orderId = req.params.id;
        const userId = req.session.user._id;
        ordersHelpers.returnSingleOrder(orderId, userId).then((response) => {
            if (response.Status) {
                res.json(response)
            }
        }).catch((error) => {
            let message = "Error performing return order operation."
            res.render('user/error', { message, log: true })
        })
    },
    getSearchProducts: (req, res) => {
        const search = req.params.key
        productHelpers.searchProducts(search).then((data) => {
            res.json(data)
        }).catch((error) => {
            let message = "Error performing search Product operation."
            res.render('user/error', { message, log: true })
        })
    }
}