const layout = 'layouts/adminLayout'
const couponHelper = require('../helpers/coupon-helpers')

module.exports = {
    getAllCoupons: (req, res) => {
        couponHelper.displayAllCoupon().then((AllCoupons) => {
            res.render('admin/admin-coupons', { layout, AllCoupons })
        }).catch((error) => {
            let message = "Error Fetching All Coupons"
            res.render('admin/error', { message, log: true })
        })
    },
    getAddCoupons: (req, res) => {
        res.render('admin/admin-addcoupons', { layout })
    },
    postAddCoupons: (req, res) => {
        couponHelper.AddNewCoupon(req.body).then((response) => {
            if (response.status) {
                res.json({ status: true })
            } else {
                res.json({ status: false })
            }
        }).catch((error) => {
            let message = "Error performing the Addition of New Coupon operation..!"
            res.render('admin/error', { message, log: true })
        })
    },
    deleteCoupon:(req,res)=>{
        const id = req.params.id;
        couponHelper.DeleteCoupon(id).then((response)=>{
            res.json({status:true})
        }).catch((error)=>{
            let message = "Eroor performing the Delete Coupon Operation..!"
            res.render('admin/error', { message, log: true })
        })
    },
    getEditCoupon:(req,res)=>{
        const id = req.params.id
        couponHelper.getSingleCoupon(id).then((coupon)=>{
            res.render('admin/admin-editcoupon',{layout,coupon})
        }).catch((error)=>{
            let message = "Eroor performing the fetching of Single Coupon Operation..!"
            res.render('admin/error', { message, log: true })
        })
    },
    postEditCoupon:(req,res)=>{
        couponHelper.updateCouponDetails(req.body).then(()=>{
            res.json({status:true})
        }).catch((eroor)=>{
            console.log(error)
            res.json({status:false})
        })
    },
    processCoupon:(req,res)=>{
        let Coupon;
        if(req.query.Coupon){
            
            Coupon = req.query.Coupon
        }else{
            Coupon = req.body.Coupon
        }
        console.log(req.query,'coupnQUery.............')
        const id = req.session.user._id;
        const total = req.params.id
        console.log(req.body,'total:',total)
        couponHelper.checkValidCoupon(Coupon,total,id).then((response)=>{
            console.log(response)
            res.json(response)
        })
    }
}