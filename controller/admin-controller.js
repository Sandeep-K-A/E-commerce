const layout = 'layouts/adminLayout'
const { Reject } = require('twilio/lib/twiml/VoiceResponse')
const adminHelper = require('../helpers/admin-helpers')
const productHelper = require('../helpers/product-helpers')
const { reject } = require('bcrypt/promises')
const toastr = require('toastr')
const ordersHelpers = require('../helpers/orders-helpers')
module.exports = {

    adminSignup:(req,res)=>{
        res.render('admin/admin-signup',{layout:false})
    },

    postadminSignup:(req,res)=>{

        adminHelper.createAdmin(req.body).then((admin)=>{
            req.session.admin = true;
            res.redirect('/admin/adminhome')
        }).catch((err)=>{
            res.render('admin/admin-signup',{err,layout:false})
        })
    },

    adminSignin: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin/adminhome')
        } else {
            res.render('admin/index', { layout: false })
        }

    },
    adminHome:async(req, res) => {
        console.log(req.session.admin,'::::::::::::')
        try{
            if(req.session.admin){
                console.log('if access')
                const salesByMonth = await ordersHelpers.getSalesDetails()
                const salesByYear = await ordersHelpers.getYearlySalesDetails()
                const orders = await ordersHelpers.adminAllOrders()
                const ordersByDate = await ordersHelpers.getOrdersByDate()
                const categorySales = await ordersHelpers.getCategorySales()
                const allProducts = await productHelper.fetchallProducts()
                const allUsers = await adminHelper.getAllUsers()
                const currentMonth = new Date().getMonth() + 1
                const currentMonthSales = await salesByMonth.find(sales=>sales._id === currentMonth)
                console.log(currentMonthSales,'______________________currentMonthSales')
                res.render('admin/admin-dashboard', { layout,salesByMonth,salesByYear,orders,ordersByDate,categorySales,allProducts,allUsers,currentMonthSales })
            }else{
                console.log('else access')
                res.render('admin/index',{layout:false})
            }
        }catch(error){
            console.log('catchblock initialized')
            let err = "Incorrect Email Address or Password.."
            res.render('admin/index', { layout: false, err })
        }
        

    },
    adminVerify: (req, res) => {
        const user = req.body;
        adminHelper.adminLogin(user).then((response) => {
            if (response.status) {
                req.session.admin = true;
                res.redirect('/admin/adminhome')
            } else {
                let err = "Incorrect Email Address or Password.."
                res.render('admin/index', { layout: false, err })
            }
        }).catch((error) => {
            console.log(error);
            let err = "Incorrect Email Address or Password.."
            res.render('admin/index', { layout: false, err })
        })
    },
    adminAllUsers: (req, res) => {

        adminHelper.getAllUsers().then((allUsers) => {
            res.render('admin/admin-allusers', { layout, allUsers })
        }).catch((error) => {
            let message = "Error Fetching all Users.."
            res.render('admin/error', { message, log: true })
        })


    },
    userStatus: (req, res) => {

        console.log('hello')
        id = req.params.id;
        console.log(id + 'llllllllllllllllllllll')
        adminHelper.blockUser(id).then(() => {
            res.redirect('/admin/allusers')
        }).catch((error) => {
            let message = "Error blocking a user.."
            res.render('admin/error', { message, log: true })
        })

    },
    adminLogout: (req, res) => {
        req.session.admin = null;
        res.redirect('/admin')
    },
    adminCategory: ((req, res) => {
        productHelper.getAllCategory().then((categories) => {
            // console.log(categories)
            res.render('admin/admin-categories', { layout, categories })
        }).catch((error) => {
            let message = "Error getting all categories.."
            res.render('admin/error', { message, log: true })
        })
    }),
    addCategory: ((req, res) => {
        const category = req.body.category;
        productHelper.newCategory(category).then(() => {
            res.redirect('/admin/categories')
        }).catch((error) => {
            console.log(error);
            productHelper.getAllCategory().then((categories) => {
                // console.log(categories)
                res.render('admin/admin-categories', { layout, categories, error })
            })
        })
    }),
    editCategory: ((req, res) => {
        const id = req.params.id;
        productHelper.getCategory(id).then((category) => {
            res.render('admin/admin-categoryaction', { layout, category })

        }).catch((error) => {
            let message = "Error fetching the Selected Category.."
            res.render('admin/error', { message, log: true })
        })
    }),
    updateCategory: ((req, res) => {
        const category = req.body.categoryname;
        const hiddencategory = req.body.hiddenname
        console.log(hiddencategory)
        productHelper.changeCategory(category, hiddencategory).then(() => {
            res.redirect('/admin/categories')
        }).catch((error) => {
            let message = "Error updating the Selected Category"
            res.render('admin/error', { message, log: true })
        })
    }),
    categoryStatus: (req, res) => {
        const id = req.params.id;
        console.log(id)
        productHelper.blockCategory(id).then((result) => {
            if (result) {
                res.json({ status: true })
            } else {
                res.json({ status: false })
            }
            // res.redirect('/admin/categories')
        }).catch((error) => {
            let message = "Error performing the Block Category operation"
            res.render('admin/error', { message, log: true })
        })
    },
    getAllOrders: (req, res) => {
        ordersHelpers.fetchAllOrder().then((allOrders) => {
            res.render('admin/admin-allOrders', { layout, allOrders })
        }).catch((error) => {
            let message = "Error Fetching all orders"
            res.render('admin/error', { message, log: true })
        })
    },
    getOrderDetails: (req, res) => {
        const id = req.params.id;
        ordersHelpers.fetchOrderDetails(id).then((orderInfo) => {
            console.log(orderInfo,'{{{{{{{{{{{{{{{{{{{')
            res.render('admin/admin-orderdetails', { layout, orderInfo })
        }).catch((error) => {
            console.log(error)
            let message = "Error Fetching the Order details"
            res.render('admin/error', { message, log: true })
        })

    },
    changeOrderStatus: (req, res) => {
        const id = req.params.id;
        const status = req.query.status
        console.log(id, '::::::::::::::::::::::', status)
        ordersHelpers.updateOrderStatus(id, status).then((response) => {
            console.log('.................', response)
            if (response.status) {
                res.json(response)
            }
        }).catch((error) => {
            let message = "Error changing the order Status"
            res.render('admin/error', { message, log: true })
        })
    },
    getAddBanner: (req, res) => {
        res.render('admin/admin-addbanner', { layout })
    },
    postAddBanner: (req, res) => {
        console.log('???????????????')
        console.log(req.body)
        const Image = req.files.BannerImage
        const image = req.files.BannerImage.name
        console.log(image)
        adminHelper.createNewBanner(req.body, image).then((response) => {
            console.log(response, '_____________')
            if (response.bannerExist) {
                console.log(':::::::::')
                res.json({ bannerExist: true })
            } else if (response.Status) {
                console.log('{{{{{{{{{{{{')
                console.log(response.newBanner)
                const id = response.newBanner._id
                console.log(response.newBanner._id)
                Image.mv('./public/assets/imgs/slider/' + image, (err, done) => {
                    if (!err) {
                        res.json(response)
                    } else {
                        console.log(err)
                        res.json({ operationFailed: true })
                    }
                })
            }
        }).catch((error) => {
            let message = "Error occured adding new banner operation"
            res.render('admin/error', { message, log: true })
        })
    },
    getAllBanners: (req, res) => {
        adminHelper.fetchAllBanners().then((banners) => {
            console.log(banners)
            res.render('admin/admin-allbanner', { layout, banners })
        }).catch((error) => {
            let message = "Error performing the Fetch banner operation"
            res.render('admin/error', { message, log: true })
        })
    },
    getEditBanner: (req, res) => {
        const id = req.params.id
        adminHelper.getBannerDetails(id).then((banner) => {
            res.render('admin/admin-editbanner', { banner, layout })
        }).catch((error) => {
            let message = "Error performing the Fetch banner operation"
            res.render('admin/error', { message, log: true })
        })
    },
    postEditBanner: (req, res) => {
        let image = false;
        let Image = null;
        if (req.files) {
            console.log('????????')
            Image = req.files.BannerImage
            image = req.files.BannerImage.name
        }
        adminHelper.updateBannerDetails(req.body, image).then((response) => {

            if (response.Status) {
                Image.mv('./public/assets/imgs/slider/' + image, (err, done) => {
                    if (!err) {
                        return res.json(response)
                    } else {
                        console.log(err)
                        res.json({ operationFailed: true })
                    }
                })
            } else {
                res.json(response)
            }
        }).catch((error) => {
            let message = "Error performing the update banner operation"
            res.render('admin/error', { message, log: true })
        })
    },
    deleteBanner:(req,res)=>{
        const id = req.params.id;
        adminHelper.changeBannerStatus(id).then((banner)=>{
            res.json({Status:true,banner})
        }).catch((error)=>{
            let message = "Error performing the delete banner operation"
            res.render('admin/error', { message, log: true })
        })
    }
}