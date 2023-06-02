const userModel=require('../models/userModel')
const productModel = require('../models/productModel')
const bannerModel = require('../models/bannerModel')
const walletModel = require('../models/walletModel')
const bcrypt = require('bcrypt')
require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid,authToken)
const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
module.exports={

    createNewUser: (user)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({phone:user.phone}).then((userExist)=>{
                if(userExist){
                    reject()
                }else{
                    bcrypt.hash(user.password,10,(err,hashedpassword)=>{
                        if(err){
                            console.log(err)
                            reject()
                        }else{
                            new userModel({
                                name:user.name,
                                phone:user.phone,
                                email:user.email,
                                password:hashedpassword
                            }).save().then((newUser)=>{
                                resolve(newUser)
                            }).catch((error)=>{
                                console.log(error);
                                reject(error)
                            })
                        }
                    })
                }
            })
        })
    },
    userLogin: (user)=> {
        return new Promise((resolve,reject)=> {
            let loginstatus = false;
            let response = {};
            userModel.findOne({email:user.email,status:true}).then((userExist)=>{
                if(userExist){
                   bcrypt.compare(user.password,userExist.password,(err,isMatch)=>{
                    if(isMatch){
                        response.user = userExist;
                        response.status = true;
                        resolve(response);   
                    }else{
                        console.log(err);
                        reject(err);
                    }
                   })
                }else{
                    reject();
                }
            })
        })
    },
    otpGenerate:(user)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({phone:user.phone,status:true}).then((userExist)=>{
                if(userExist){
                    client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
                    .verifications
                    .create({to:`+91${userExist.phone}`,channel:'sms'})
                    .then(verification => console.log(verification.status))
                    resolve()
                }else{
                    reject()
                }
            }).catch((error)=>{
                console.log(error);
                reject(error);
            })
        })
    },
    
    verifyOtp:(otp,number)=>{
        
        return new Promise((resolve,reject)=>{
            console.log(otp+'///////////////////'+number)
            client.verify.v2.services(process.env.TWILIO_SERVICE_SID)
            .verificationChecks
            .create({to:`+91${number}` , code:otp})
            .then((response)=>{
                console.log(response)
                const status = response.valid
                userModel.findOne({phone:number}).then((user)=>{
                    console.log(user)
                    resolve({user,status})
                })
            }).catch((error)=>{
                console.log(error)
                reject(error);
            })
        })   
    },
    fetchProducts:()=>{
        return new Promise((resolve,reject)=>{
            productModel.find({IsDeleted:false}).limit(4).then((products)=>{
                resolve(products)
            }).catch((error)=>{
                console.log(error);
                reject(error);
            })
            
        })
    },
    fetchSingleProduct:(id)=>{
        return new Promise((resolve,reject)=>{
            productModel.findOne({_id:id}).then((singleProduct)=>{
                console.log(singleProduct);
                resolve(singleProduct)
            }).catch((error)=>{
                console.log(error);
                reject(error);
            })
        })
    },
    filterCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            productModel.find({ProductCategory:category}).then((products)=>{
                resolve(products)
            }).catch((error)=>{
                console.log(error);
                reject(error)
            })
        })
    },
    generateRazorpay:(orderId,totalAmount)=>{
        return new Promise((resolve,reject)=>{
            var options = {
                amount: totalAmount*100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ""+orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err)
                }else{
                    console.log(order,')))))))))))))))))))');
                    resolve(order)
                }
              });
        })
    },
    verifyRazorPayPayment:(details)=>{
        return new Promise((resolve,reject)=>{
            const crypto = require('crypto')
            let expectedSignature = details['payment[razorpay_order_id]']+"|"+details['payment[razorpay_payment_id]'];
            let hmac = crypto.createHmac('sha256', '2IFkzjYsW0zwpPIgu0WdHUvF')
                             .update(expectedSignature.toString())
                             .digest('hex')
                             console.log('sig_Recieved:',details['payment[razorpay_signature]'])
                             console.log('sig_Generated:',expectedSignature)
            if(hmac === details['payment[razorpay_signature]']){
                resolve()
            }else{
                reject()
            }                 
        })
    },
    fetchDisplayBanner:()=>{
       return new Promise((resolve,reject)=>{
        bannerModel.find({bannerStatus:true}).then((banners)=>{
            console.log(banners)
            resolve(banners)
        }).catch((error)=>{
            reject(error)
        })
       })
    },
    userProducts:(page,query)=>{
        const PAGE_SIZE = 4;
        return new Promise(async(resolve,reject)=>{
            const count = await productModel.countDocuments({IsDeleted:false})
            const totalPages = Math.ceil(count/PAGE_SIZE);
            const currentPage = Math.min(Math.max(page,1),totalPages);
            const skip = (currentPage-1)*PAGE_SIZE

            let queryObj = {IsDeleted:false}
            if(query && query.category){
                queryObj.ProductCategory = query.category
            }
            let sortObj = {}
            if(query && query.sort){
                if(query.sort == 'l2h'){
                    sortObj = {ProductPricing:1}
                }else if(query.sort == 'h2l'){
                    sortObj = {ProducPricing:-1}
                }
            }

            const products = await productModel
            .find(queryObj)
            .sort(sortObj)
            .skip(skip)
            .limit(PAGE_SIZE)

            if(products){
                resolve({
                    data:products,
                    pagination:{
                        currentPage,
                        totalPages,
                        pageSize:PAGE_SIZE,
                        totalItems:count
                    }
                })
            }else{
                reject()
            }
        })
    },
    getUserDetails:(id)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({_id:id}).then((user)=>{
                resolve(user)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    changeUserDetails:(body)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({email:body.UserEmail}).then((user)=>{
                bcrypt.compare(body.UserPassword,user.password,(err,isMatch)=>{
                    if(isMatch){
                        if(body.UserNewPassword){
                            bcrypt.hash(body.UserNewPassword,10,(err,hashedPassword)=>{
                                if(err){
                                    reject(err)
                                }else{
                                    user.name = body.UserName
                                    user.email = body.UserEmail
                                    user.phone = body.UserPhone
                                    user.password = hashedPassword
                                    
                                    user.save()
                                    
                                    resolve({Status:true,passChange:true,user})
                                }
                            })
                        }else{
                            user.name = body.UserName
                            user.email = body.UserEmail
                            user.phone = body.UserPhone

                            user.save()
                            console.log(user,':::::::::::::::;')
                            resolve({Status:true,user})
                        }
                    }
                })
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    changeUserPassword:(newPassword,number)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({phone:number}).then((user)=>{
                if(user){
                    bcrypt.hash(newPassword,10,(err,newPassword)=>{
                        if(err){
                            reject(err)
                        }else{
                            user.password = newPassword
                            
                            user.save()
                            
                            resolve({Status:true})
                        }
                    })
                }
            })
        })
    },
    getUserWallet:(user)=>{
        return new Promise((resolve,reject)=>{
            walletModel.findOne({userId:user}).then((userWallet)=>{
                resolve(userWallet)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    deductWalletAmount:(user,total)=>{
        return new Promise((resolve,reject)=>{
            userModel.findOne({userId:user}).then((user)=>{
                user.WalletAmount = user.WalletAmount - total
                user.save()
                resolve()
            }).catch((error)=>{
                reject(error)
            })
        })
    }
}



