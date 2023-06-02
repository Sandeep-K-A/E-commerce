const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const { reject } = require('bcrypt/promises')

module.exports = {

    addProduct: (product, image) => {
        console.log(product)
        let stockStatus;
        const productId =  Math.floor(100000 + Math.random() * 900000);
        const selectedOptions = product.selectedOptions;
        const optionsArray = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions];

        if(parseInt(product.productQuantity) > 0){
            stockStatus = "available"
        }else{
            stockStatus = "outofStock"
        }
        return new Promise((resolve, reject) => {
            new productModel({
                ProductId:productId,
                ProductTitle: product.productTitle,
                ProductDescription: product.productDescription,
                ProductPricing: product.productPrice,
                ProductQuantity: product.productQuantity,
                ProductStockStatus: stockStatus,
                ProductImages: image,
                ProductCoverImages:optionsArray,
                ProductCategory: product.productCategory
            }).save().then(() => {
                resolve()
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    fetchallProducts: () => {
        return new Promise((resolve, reject) => {
            productModel.find().then((products) => {
                // console.log(products)
                // console.log(products,'yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy')
                resolve(products)
            }).catch((error) => {
                console.log(error);
                reject(error);
            })
        })
    },
    editproductDetails: (id) => {
        return new Promise(async (resolve, reject) => {
            productModel.findOne({ _id: id }).then((product) => {
                console.log(product);
                resolve(product);
            })
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    },
    updateProductDetails: (product, image) => {
        return new Promise((resolve, reject) => {
            let stockStatus ;
            if(parseInt(product.productQuantity) > 0){
                stockStatus = "available"
            }else{
                stockStatus = "outofStock"
            }
            console.log(product)

            console.log(image);
            if (image.length > 0) {
                console.log('image given')
                productModel.updateOne({ _id: product.productId }, {
                    $set: {
                        ProductTitle: product.productTitle,
                        ProductDescription: product.productDescription,
                        ProductPricing: product.productPrice,
                        ProductImages: image,
                        ProductCategory: product.productCategory,
                        ProductQuantity: product.productQuantity,
                        ProductStockStatus: stockStatus
                    }
                }).then((updatedProduct) => {
                    console.log(updatedProduct)
                    resolve(updatedProduct)
                })
            } else {
                console.log('image not given')
                productModel.updateOne({ _id: product.productId }, {
                    $set: {
                        ProductTitle: product.productTitle,
                        ProductDescription: product.productDescription,
                        ProductPricing: product.productPrice,
                        ProductCategory: product.productCategory,
                        ProductQuantity: product.productQuantity,
                        ProductStockStatus: stockStatus
                    }
                }).then((updatedProduct) => {
                    console.log(updatedProduct)
                    resolve(updatedProduct)
                })
            }

        }).catch((e) => {
            console.log(e)
            reject(e)
        })
    },
    deleteProduct: (id) => {
        return new Promise((resolve, reject) => {
            productModel.findOne({ _id: id }).then((data) => {
                data.IsDeleted = !data.IsDeleted
                data.save().then((data) => {
                    resolve(data);
                })
            }).catch((error) => {
                console.log(error);
                reject(error);
            })

        })
    },
    newCategory: (category) => {
        return new Promise((resolve, reject) => {
            categoryModel.find({name:{'$regex' : `${category}`, '$options' : 'i'}}).then((categoryExist) => {
                console.log(categoryExist)
                if (categoryExist.length > 0) {
                    err = `The Category ${category} already Exist..!!`
                    reject(err)
                } else {
                    new categoryModel({
                        name: category
                    }).save().then((response) => {
                        // console.log(response)
                        resolve();
                    })
                }

            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })

    },
    getAllCategory: () => {
        return new Promise((resolve, reject) => {
            categoryModel.find().then((categories) => {
                // console.log(categories)
                resolve(categories)
            }).catch((error) => {
                console.log(error);
                reject(error)
            })
        })
    },
    getCategory: (id) => {
        return new Promise((resolve, reject) => {
            categoryModel.findById(id).then((category) => {
                // console.log(category)
                resolve(category)
            }).catch((error) => {
                reject(error)
            })
        })
    },
    changeCategory: (category, hiddencategory) => {
        return new Promise((resolve, reject) => {
            categoryModel.updateOne({ name: hiddencategory }, {
                $set: {
                    name: category
                }
            }).then(() => {
                productModel.updateMany({ ProductCategory: hiddencategory }, {
                    $set: {
                        ProductCategory: category
                    }
                }).then(() => {
                    resolve()
                })
            }).catch((error) => {
                reject(error)
            })
        })
    },
    blockCategory: (id) => {
        return new Promise(async (resolve, reject) => {
            let category = await categoryModel.findById(id)
            console.log(category)

            productModel.find({ ProductCategory: category.name }).then((products) => {
                console.log(products)
                if (products.length == 0) {
                    console.log('lllllllllllllll')

                    category.status = !category.status;

                    category.save()
                    resolve(true)
                } else {
                    console.log('??????????????//')
                    resolve(false)
                }
            }).catch((error) => {
                console.log(error)
                reject(error)
            })
        })
    },
    productsCategory: (products, categories) => {
        return new Promise((resolve,reject)=>{
            const matchingCategory = categories.filter(category => {
                return products.some(product => category.name === product.ProductCategory);
            });
            console.log(matchingCategory);
            resolve(matchingCategory)
        })
    },
    searchProducts:(key)=>{
        return new Promise((resolve,reject)=>{
            productModel.aggregate([{
                $match:{
                    $or:[
                        {$and:[{ProductTitle:{$regex:new RegExp(key,'i')}},{IsDeleted:false}]},{ProductCategory:{$regex:new RegExp(key,'i')}}
                    ]
                }
            }]).then((products)=>{
                console.log(products,'_______________________-search Products.')
                resolve(products)
            }).catch((error)=>{
                reject(error)
            })
        })
    }
   
}