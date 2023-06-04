const userModel = require('../models/userModel')
const ordersModel = require('../models/ordersModel')
const productModel = require('../models/productModel')
module.exports = {
    userStatusCheck: (user) => {
        // console.log(user,'0000000000000000');
        return new Promise((resolve, reject) => {
            userModel.findOne({ email: user.email }).then((Details) => {
                resolve(Details.status);
            }).catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    },
    pendingOrders: () => {
        return new Promise(async (resolve, reject) => {
            console.log('???????????????????')
            let orders = await ordersModel.find({ Status: 'Pending' })
            if (orders.length == 0) {
                resolve()
            } else {
                console.log(orders, "OOOOOOOOOOOOOOOOOO")
               
                orders.forEach((order) => {
                    console.log(order.Products)
                    order.Products.forEach((item) => {
                        productModel.findOne({ _id: item.proId }).then((product) => {
                            product.ProductQuantity += item.quantity
                            if (product.ProductQuantity > 0) {
                                product.ProductStockStatus = "available"
                            }
                            product.save()
                        })
                    })
                })
                ordersModel.deleteMany({ Status: 'Pending' }).then(() => {
                    console.log('pending orders deleted..')
                    resolve()
                }).catch((error) => {
                    reject(error)
                })
            }
        })
    }
}