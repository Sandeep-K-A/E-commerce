const { reject } = require('bcrypt/promises')
const couponModel = require('../models/couponModel')
const userModel = require('../models/userModel')
const ordersHelpers = require('./orders-helpers')

module.exports = {
    AddNewCoupon: (body) => {
        console.log(body)
        return new Promise((resolve, reject) => {
            couponModel.findOne({ $or: [{ CouponName: body.CouponName }, { CouponCode: body.CouponCode }] }).then((couponExist) => {
                if (couponExist) {
                    resolve({ status: false })
                } else {
                    new couponModel({
                        CouponName: body.CouponName,
                        CouponCode: body.CouponCode,
                        ExpiryDate: body.ExpiryDate,
                        MinAmount: body.MinAmount,
                        MaxAmount: body.MaxAmount,
                        Percentage: body.DiscountPercentage
                    }).save().then((newCoupon) => {
                        console.log(newCoupon, 'newCoupon')
                        resolve({ status: true })
                    }).catch((error) => {
                        console.log(error);
                        reject(error)
                    })
                }
            })

        })
    },
    displayAllCoupon: () => {
        return new Promise((resolve, reject) => {
            couponModel.find().then((AllCoupons) => {
                console.log(AllCoupons)
                resolve(AllCoupons)
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    DeleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            couponModel.findOne({ _id: id }).then((coupon) => {
                coupon.Status = !coupon.Status;
                coupon.save()
                resolve()
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    getSingleCoupon: (id) => {
        return new Promise((resolve, reject) => {
            couponModel.findOne({ _id: id }).then((coupon) => {
                resolve(coupon)
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    updateCouponDetails: (body) => {
        return new Promise((resolve, reject) => {
            couponModel.updateOne({ _id: body.couponId }, {
                $set: {
                    CouponName: body.CouponName,
                    CouponCode: body.CouponCode,
                    ExpiryDate: body.ExpiryDate,
                    MinAmount: body.MinAmount,
                    MaxAmount: body.MaxAmount,
                    Percentage: body.DiscountPercentage
                }
            }).then(() => {
                resolve();
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    displayCoupons: () => {
        return new Promise((resolve, reject) => {
            const currentDate = new Date()
            couponModel.find({ ExpiryDate: { $gte: currentDate }, Status: true }).then((validCoupons) => {
                console.log(validCoupons);
                resolve(validCoupons)
            }).catch((error) => {
                console.log(error)
                reject(error);
            })
        })
    },
    checkValidCoupon: (Coupon, total, userId) => {
        console.log(Coupon,'::::::::::::')
        return new Promise(async(resolve, reject) => {
            const checkoutTotal = parseInt(total);
            const currentDate = new Date()
            console.log(checkoutTotal)
            const userWallet = await ordersHelpers.checkWalletAmount(userId,total)
            userModel.findOne({ _id: userId, usedCoupons: { $elemMatch: { CouponCode: { $in: [Coupon] } } } }).then((couponExist) => {
                if (couponExist) {
                    resolve({ usedCoupon: true })
                } else {
                    console.log('else condition')
                    couponModel.findOne({ CouponCode: Coupon, ExpiryDate: { $gte: currentDate }, Status: true }).then((validCoupon) => {
                        console.log(validCoupon,':::::::::::')
                        if (validCoupon) {
                            if (checkoutTotal >= validCoupon.MinAmount && checkoutTotal <= validCoupon.MaxAmount) {

                                resolve({ couponApplied: true, CouponName: validCoupon.CouponName, DiscountPercentage: validCoupon.Percentage, CouponCode: Coupon ,Wallet:userWallet})
                            } else {
                                resolve({ couponApplied: false })
                            }
                        } else {
                            resolve({ status: false })
                        }
                    })
                }
            }).catch((error) => {
                console.log(error)
                reject(error);
            })
        })
    },
    expireUserCoupon: (CouponCode, userId) => {
        return new Promise((resolve, reject) => {
            userModel.updateOne({ _id: userId }, {
                $push: {
                    usedCoupons: {
                        CouponCode: CouponCode
                    }
                }
            }).then(() => {
                resolve()
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    }
}