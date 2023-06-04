const ordersModel = require('../models/ordersModel')
const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const walletModel = require('../models/walletModel')
const categoryModel = require('../models/categoryModel')
const userModel=require('../models/userModel')
const cartHelpers = require('../helpers/cart-helpers');
const fs = require('fs');
const PDFDocument = require('pdfkit')

const { reject } = require('bcrypt/promises');
const { error } = require('toastr');
const { productsCategory } = require('./product-helpers');
const { name } = require('ejs')
const products = require('../models/productModel')

module.exports = {

    processOrder: (body, id) => {
        // let stat = body.payment_option === 'COD' ? 'Placed' : 'Pending';
        let stat = (body.payment_option === 'COD' || body.payment_option === 'Wallet') ? 'Placed' : 'Pending';

        let total = parseInt(body.cartTotal)
        return new Promise((resolve, reject) => {
                cartModel.findOne({ userId: id }).then((cart) => {
                    console.log(cart, '|||||||||||||')
                    let i = 0
                    let product = []
                    cart.products.forEach(items => {
                        product[i] = {
                            proId: items.proId,
                            quantity: items.quantity

                        }
                        i++
                    })
                    cartHelpers.fetchCart(id).then((result) => {
                        let k = 0
                        result.cartItems.forEach(item => {
                            product[k].subTotal = item.subTotal
                            k++
                        })
                        console.log(product, 'PPPPPPPPP')
                        product.forEach(items => {
                            productModel.findOne({ _id: items.proId }).then((Product) => {
                                Product.ProductQuantity = Product.ProductQuantity - items.quantity;
                                if (Product.ProductQuantity === 0) {
                                    Product.ProductStockStatus = "outofStock";
                                }
                                
                                Product.save()
                            })
                        })
                        const code = Math.floor(100000 + Math.random() * 900000);
                        new ordersModel({
                            userId: id,
                            orderId:code,
                            DeliveryAddress: {
                                FullName: body.fullname,
                                HouseAddress: body.houseaddress,
                                State: body.state,
                                City: body.city,
                                PostalCode: body.zipcode,
                                Phone: body.phone,
                                Email: body.email
                            },
                            Products: product,
                            PaymentMethod: body.payment_option,
                            Status: stat,
                            TotalAmount: total
                        }).save().then((order) => {
                            console.log(order,'../..//././/.//')
                            resolve(order)
                        }).catch((error)=>{
                            reject(error)
                        })
                    })
                })
            
        })
    },
    getAllOrder: (id,sortField,sortOrder,skip,perPage,search) => {
        console.log('::::::::::::::::::::::::::::::::::::::')
        return new Promise(async(resolve, reject) => {
            const sortOptions = {}
            sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

            const query = {
                userId: id,
                ...search
            };
           const allOrder = await ordersModel.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(perPage)

            if(allOrder){
                resolve(allOrder)
            }else{
                reject
            }
            // then((allOrder) => {
            //     console.log(allOrder,"&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
            //     resolve(allOrder)
            // }).catch((error) => {
            //     reject(error);
            // })
        })
    },
    getCount:(id,search)=>{
        return new Promise((resolve,reject)=>{
            const query = {
                userId:id,
                ...search
            }

            ordersModel.countDocuments(query).then((totalCount)=>{
                resolve(totalCount)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    fetchOrderDetails: (id) => {
        // console.log(Id, '::::::::::::::::::')
        return new Promise(async (resolve, reject) => {
            let orderInfo = await ordersModel.findOne({orderId:id}).populate([{
                path: 'Products.proId',
                select: 'ProductTitle ProductImages ProductPricing'
            },{
                path:'userId',
                select:'name phone'
            }])
            console.log(orderInfo)
            resolve(orderInfo)
        })
    },
    fetchAllOrder: () => {
        return new Promise((resolve, reject) => {
            ordersModel.find().populate({
                path: 'userId',
                select: 'name'
            }).exec().then((allOrders) => {
                console.log(allOrders)
                resolve(allOrders)
            }).catch((error) => {
                console.log(error);
                reject((error))
            })
        })
    },
    changePaymentDetails: (details) => {
        return new Promise((resolve, reject) => {
            ordersModel.findByIdAndUpdate(details['order[receipt]'],{
                $set:{
                    Status:'Placed'
                }
            }, {
                $push: {
                    PaymentDetails: {
                        payment_id: details['payment[razorpay_payment_id]'],
                        order_id: details['payment[razorpay_order_id]'],
                        payment_signature: details['payment[razorpay_signature]']
                    }
                }
            }).then(()=>{
                resolve()
            })
        })
    },
    updateOrderStatus:(id,status)=>{
        console.log('////;;;;;////')
        return new Promise((resolve,reject)=>{
            ordersModel.updateOne({_id:id},{
                $set:{
                    Status:status
                }
            }).then((out)=>{
                console.log(out)
                resolve({status:true})
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    cancelSingleOrder:(orderId,userId)=>{
        return new Promise((resolve,reject)=>{
            ordersModel.findOne({orderId:orderId}).then((order)=>{
                console.log(order,'dlfjlsdkfjldsjflksdjfl')
                order.Products.forEach((item)=>{
                    productModel.findOne({_id:item.proId}).then((product)=>{
                        product.ProductQuantity += item.quantity
                        if(product.ProductQuantity > 0){
                            product.ProductStockStatus = "available"
                        }
                        product.save()
                    })
                })
                order.Status = "Cancelled"
                order.save()
               userModel.updateOne({_id:userId},{
                $inc:{
                    WalletAmount:order.TotalAmount
                }
               }).then(()=>{
                resolve({Status:true,order})
               })
               
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    returnSingleOrder:(orderId,userId)=>{
        return new Promise((resolve,reject)=>{
            ordersModel.findOne({orderId:orderId}).then((order)=>{
                order.Products.forEach((item)=>{
                    productModel.findOne({_id:item.proId}).then((product)=>{
                        product.ProductQuantity += item.quantity
                        if(product.ProductQuantity > 0){
                            product.ProductStockStatus = "available"
                        }
                        product.save()
                    })
                })
                order.Status = "Returned"
                order.save()
                userModel.updateOne({_id:userId},{
                    $inc:{
                        WalletAmount:order.TotalAmount
                    }
                   }).then(()=>{
                    resolve({Status:true,order})
                   })
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    getSalesDetails:()=>{
        return new Promise((resolve,reject)=>{
            ordersModel.aggregate([
                {
                    $group:{
                        _id:{ $month:"$createdAt"},
                        totalAmount:{ $sum:"$TotalAmount"}
                    }
                }
            ]).then((salesByMonth)=>{
                console.log(salesByMonth,'__________________salesByMonth');
                resolve(salesByMonth)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    getYearlySalesDetails:()=>{
        return new Promise((resolve,reject)=>{
            ordersModel.aggregate([
                {
                    $group:{
                        _id:{ $year:"$createdAt"},
                        totalAmount:{ $sum:"$TotalAmount"}
                    }
                }
            ]).then((salesByYear)=>{
                console.log(salesByYear,'___________________salesByYear');
                resolve(salesByYear)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    getOrdersByDate:async()=>{
        try{
            const ordersByDate = await ordersModel.aggregate([
                {
                    $group:{
                        _id:{
                            month:{ $month:"$createdAt"},
                            year:{ $year:"$createdAt"}
                        },
                        count:{$sum:1}
                    }
                }
            ]);
            console.log(ordersByDate,'_________________ordersByDate')
            return ordersByDate;
        }catch(error){
            throw new Error(error)
        }
    },
    getCategorySales:async()=>{
        try{
            const orders = await ordersModel.find().populate('Products.proId','ProductCategory');
            const categorySales = {}

            orders.forEach(order=>{
                order.Products.forEach(product=>{
                    const ProductCategory = product.proId.ProductCategory
                    if(ProductCategory){
                        if(ProductCategory in categorySales){
                            categorySales[ProductCategory] += 1;
                        }else{
                            categorySales[ProductCategory] = 1;
                        }
                    }
                })
            })

            const allCategories = await categoryModel.find()
            const result = allCategories.map(category=>{
                const count = categorySales[category.name] || 0
                return {name:category.name,count}
            })
            console.log(result,'________________________result of getCategorySales')
            return result;
        }catch(error){
            throw error
        }
    },
    adminAllOrders:()=>{
        return new Promise((resolve,reject)=>{
            ordersModel.find().populate([{
                path:'userId',
                select:'name'
            },{
                path:'Products.proId',
                select:'ProductTitle'
            }]).then((allOrders)=>{
                console.log(allOrders,'___________________allOrders')
                resolve(allOrders)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    checkWalletAmount:(userId,total)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({_id:userId}).then((user)=>{
                if(user.WalletAmount >= total){
                    resolve({validAmount:true,WalletAmount:user.WalletAmount})
                }else{
                    resolve({validAmount:false,WalletAmount:user.WalletAmount})
                }
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    generateInvoice:(orderInfo)=>{
        console.log(orderInfo)
        return new Promise((resolve,reject)=>{
            const {
                DeliveryAddress: {
                  FullName,
                  HouseAddress,
                  City,
                  State,
                  PostalCode,
                  Phone,
                  Email
                },
                _id,
                userId: { _id: userId, name, phone },
                orderId,
                Products,
                PaymentMethod,
                Status,
                TotalAmount,
                PaymentDetails,
                createdAt,
                updatedAt,
                __v
              } = orderInfo;
              
              formattedDate = createdAt.toLocaleDateString('en-GB')
              const doc = new PDFDocument()
    
              doc.font('Times-Roman').fontSize(18).text('INVOICE',{align:'center'});
              doc.fontSize(15).text('Shipping Address',50,150);
              doc.fontSize(12).text(`Name: ${FullName}`,50,180)
              .text(`Office/House No.: ${HouseAddress}`)
              .text(`City: ${City}`)
              .text(`State: ${State}`)
              .text(`ZipCode: ${PostalCode}`)
              .text(`Email: ${Email}`)
              .text(`Phone: ${Phone}`)
    
              doc.fontSize(15).text('OrderDetails',345,150)
              doc.fontSize(12).text(`Invoice No: ${orderId}`, 345, 180)
              .text(`Purchase Date: ${formattedDate}`)
              .text(`Total Amount: ${TotalAmount}`)
              .text(`Payment Mode: ${PaymentMethod}`)
              doc.moveTo(30, 300).lineTo(580, 300).stroke();
              doc.moveTo(30, 140).lineTo(580, 140).stroke();
              doc.moveTo(30, 170).lineTo(580, 170).stroke();
    
              doc.fontSize(15).text('No.', 50, 340)
              .text('Name', 100, 340)
              .text('Quantity', 350, 340)
              .text('Unit Price', 450, 340)
              .text('Amount', 550, 340)
              
              let y = 370;
    
              Products.forEach(({proId,quantity}, index) => {
                const {ProductTitle,ProductPricing} = proId
                y += 30;
                doc.fontSize(12)
                    .text(`${index + 1}`, 50, y)
                    .text(ProductTitle, 100, y)
                    .text(quantity, 350, y)
                    .text(ProductPricing, 450, y)
                    .text(ProductPricing * quantity, 550, y)
              });
    
              doc.fontSize(16).text('Subtotal', 400, y + 50)
              doc.fontSize(18).text(`${TotalAmount}`, 550, y + 50)
    
              const stream = doc.pipe(fs.createWriteStream('invoice.pdf'));
                stream.on('finish', () => {
                    console.log('PDF created');
                    resolve();
                });
                doc.end();
        })
    }
}