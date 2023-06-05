const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')

const mongoose = require('mongoose')

module.exports = {


    updateCart: (id, userId) => {
        return new Promise(async (resolve, reject) => {
            
                const cartExist = await cartModel.findOne({ userId: userId })
                if (!cartExist) {
                    new cartModel({
                        userId: userId,
                        products: [{
                            proId: id,
                            quantity: 1
                        }]

                    }).save().then(() => {
                        resolve()
                    })

                } else {

                    let itemIndex = cartExist.products.findIndex(item => item.proId.toString() === id)
                    if (itemIndex >= 0) {
                        cartExist.products[itemIndex].quantity += 1;
                    } else {
                        cartExist.products.push({ proId: id, quantity: 1 })
                    }
                    cartExist.save().then(() => {
                        resolve()
                    })

                }

        }).catch((error) => {
            console.log(error)
            reject(error)
        })
    },
    displayCart: (id) => {
        return new Promise((resolve, reject) => {
            cartModel.findOne({ userId: id })
                .populate({
                    path: 'products.proId',
                    select: 'ProductTitle ProductDescription ProductImages ProductPricing _id'
                }).exec().then((cartItems) => {
                    console.log('LLLLLLLLLLLLLlll')
                    if (!cartItems) {
                        resolve(cartItems)
                    } else {
                        cartItems = cartItems?.products
                        let subtotal;
                        let totalAmount = 0;
                        cartItems.forEach(item => {
                            subtotal = item.quantity * item.proId.ProductPricing;
                            console.log(subtotal, '{{{{{{{{{{{')
                            item.subTotal = subtotal
                            totalAmount += subtotal
                        })
                        let result = {
                            userId: id,
                            cartItems: cartItems,
                            totalAmount: totalAmount
                        }
                        // console.log(result,'PPPPPPPPPPPPPpp')
                        // console.log(cartItems)
                        resolve(result);
                    }
                }).catch((error) => {
                    console.log(error)
                    reject(error)
                })
        })
    },
    getcartCount: (id) => {
        return new Promise((resolve, reject) => {
            let count;
            cartModel.findOne({ userId: id }).then((cart) => {
                if (cart) {
                    count = cart.products.length
                } else {
                    count = 0;
                }
                resolve(count)
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    changeProductQuantity: (cartId, proId, count, quantity, subTotal, unitPrice) => {
        // count = parseInt(count)
        let subCount = 2 * count;
        quantity = parseInt(quantity)
        console.log(cartId)
        return new Promise(async (resolve, reject) => {
            if (count == -1 && quantity == 1) {
                cartModel.updateOne({ userId: cartId }, {
                    $pull: {
                        products: {
                            _id: proId
                        }
                    }
                }).then((response) => {
                    resolve({ removeProduct: true })
                }).catch((error) => {
                    reject(error)
                })
            }
            await cartModel.updateOne({ userId: cartId, products: { $elemMatch: { _id: proId } } },
                { $set: { "products.$.subTotal": subTotal } })
            if (count == 1) {

                cartModel.updateOne({ userId: cartId, products: { $elemMatch: { _id: proId } } }, {
                    $inc: {
                        "products.$.quantity": count
                    },
                    $mul: {
                        "products.$.subTotal": subCount
                    }
                }).then((response) => {
                    resolve(true)
                }).catch((error) => {
                    reject(error)
                })
            } else {
                cartModel.updateOne({ userId: cartId, products: { $elemMatch: { _id: proId } } }, {
                    $inc: {
                        "products.$.quantity": count,
                        "products.$.subTotal": -unitPrice
                    },
                }).then((response) => {
                    resolve(true)
                }).catch((error) => {
                    reject(error)
                })
            }

        })
    },
    fetchCart: (id) => {
        return new Promise((resolve, reject) => {
            cartModel.findOne({ userId: id })
                .populate({
                    path: 'products.proId',
                    select: 'ProductTitle ProductDescription ProductImages ProductPricing _id'
                }).exec().then((cartItems) => {
                    cartItems = cartItems.products
                    let subtotal;
                    let totalAmount = 0;
                    cartItems.forEach(item => {
                        subtotal = item.quantity * item.proId.ProductPricing;
                        console.log(subtotal, '{{{{{{{{{{{')
                        item.subTotal = subtotal
                        totalAmount += subtotal
                    })
                    let result = {
                        userId: id,
                        cartItems: cartItems,
                        totalAmount: totalAmount
                    }
                    console.log(result)
                    resolve(result)
                }).catch((error) => {
                    reject(error)
                })
        })
    },
    getCartTotalAmount: (id) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await cartModel.findOne({ userId: id })
                .populate({
                    path: 'products.proId',
                    select: 'ProductPricing _id'
                }).exec()
            cartItems = cartItems.products
            let subtotal;
            let totalAmount = 0;
            cartItems.forEach(item => {
                subtotal = item.quantity * item.proId.ProductPricing;
                item.subTotal = subtotal
                totalAmount += subtotal
            })
            resolve(totalAmount)
        })
    },
    removeSingleProduct: (cartId, proId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ userId: cartId }, {
                $pull: {
                    products: {
                        _id: proId
                    }
                }
            }).then(() => {
                resolve({ removeProduct: true })
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    clearCartProducts: (cartId) => {
        return new Promise((resolve, reject) => {
            cartModel.updateOne({ userId: cartId }, {
                $set: {
                    products: []
                }
            }).then(() => {
                resolve()
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    deleteCart: (id) => {
        return new Promise((resolve, reject) => {
            cartModel.deleteOne({ userId: id }).then(() => {
                resolve()
            })
        })
    }
}