const adminModel = require('../models/adminModel');
const userModel = require('../models/userModel')
const bannerModel = require('../models/bannerModel')
// const {adminSignin} = require('../models/adminModel')
const bcrypt = require('bcrypt');
const { reject } = require('bcrypt/promises');
require('dotenv').config()

const adminCredentials = {
    email:process.env.ADMIN_EMAIL,
    password:process.env.ADMIN_PASSWORD
}

module.exports = {
    createAdmin:(body)=>{
        return new Promise((resolve,reject)=>{
           adminModel.findOne({email:body.email}).then((adminExist)=>{
            if(adminExist){
                let err = 'Admin with this credentials already exist!'
                reject(err)
            }else{
                bcrypt.hash(body.password,10,(err,hashedPassword)=>{
                    if(err){
                        reject(err)
                    }else{
                        new adminModel({
                           name:body.name,
                           email:body.email,
                           password:hashedPassword 
                        }).save().then((admin)=>{
                            resolve(admin)
                        }).catch((err)=>{
                            reject(err)
                        })
                    }
                })
            }
           }) 
        })
    },
    adminLogin: (user)=>{
        console.log(user)
      return new Promise((resolve,reject)=>{
        let response = {};
        adminModel.findOne({email:user.email}).then((adminExist)=>{
            if(adminExist){
                bcrypt.compare(user.password,adminExist.password,(err,isValid)=>{
                    if(isValid){
                        response.user= user;
                        response.status = true;
                        resolve(response)
                    }else{
                        reject(err)
                    }
                })
            }else{
                let err = "Incorrect email and password"
                reject (err)
            }
        })
      })
    },
    getAllUsers:()=>{
        return new Promise((resolve,reject)=>{
            userModel.find().then((allUsers)=>{
                console.log(allUsers)
                resolve(allUsers)
            }).catch((err)=>{
                console.log(err);
                reject(err)
            })
            
        })
    },
    blockUser:(id)=>{
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$')
       return new Promise(async(resolve,reject)=>{
        let user = await userModel.findOne({_id:id})
       
        if(user.status===true){
            userModel.updateOne({_id:id},{
                $set:{status:false}
            }).then((newUser)=>{
                console.log(newUser.status)
            })
        }else{
            console.log('////////////////////');
            userModel.updateOne({_id:id},{
                $set:{status:true}
            }).then((newUser)=>{
                console.log(newUser.status)
            })
        }resolve()
       })
    },
    createNewBanner:(body,image)=>{
        return new Promise((resolve,rejec)=>{
            bannerModel.findOne({bannerMainHeader:body.BannerHeader}).then((bannerExist)=>{
                if(bannerExist){
                    resolve({bannerExist:true})
                }else{
                    new bannerModel({
                        bannerMainHeader:body.BannerHeader,
                        bannerDescription:body.BannerDescription1,
                        bannerSubDescription:body.BannerDescription2,
                        bannerImage:image,
                        bannerLink:body.BannerLink,
                    }).save().then((newBanner)=>{
                        resolve({Status:true,newBanner})
                    })
                }
            }).catch((error)=>{
                reject(error)
            })
        })
    },
    fetchAllBanners:()=>{
        return new Promise((resolve,reject)=>{
            bannerModel.find().then((banners)=>{
                resolve(banners)
            }).catch((error)=>{
                console.log(error);
                reject(error)
            })
        })
    },
    getBannerDetails:(id)=>{
        return new Promise((resolve,reject)=>{
            bannerModel.findOne({_id:id}).then((banner)=>{
                console.log(banner);
                resolve(banner)
            }).catch((error)=>{
                console.log(error);
                reject(error)
            })
        })
    },
    updateBannerDetails:(body,image)=>{
        return new Promise((resolve,reject)=>{
            if(image){
                bannerModel.updateOne({_id:body.Banner_id},{
                    $set:{
                        bannerMainHeader:body.BannerHeader,
                        bannerDescription:body.BannerDescription1,
                        bannerSubDescription:body.BannerDescription2,
                        bannerImage:image,
                        bannerLink:body.BannerLink,
                    }
                }).then(()=>{
                    resolve({Status:true})
                }).catch((error)=>{
                    reject(error)
                })
            }else{
                bannerModel.updateOne({_id:body.Banner_id},{
                    $set:{
                        bannerMainHeader:body.BannerHeader,
                        bannerDescription:body.BannerDescription1,
                        bannerSubDescription:body.BannerDescription2,
                        bannerLink:body.BannerLink,
                    }
                }).then(()=>{
                    resolve({updated:true})
                }).catch((error)=>{
                    reject(error)
                })
            }
        })
    },
    changeBannerStatus:(id)=>{
        return new Promise((resolve,reject)=>{
            bannerModel.findOne({_id:id}).then((banner)=>{
                banner.bannerStatus = !banner.bannerStatus
                banner.save()
                resolve(banner)
            }).catch((error)=>{
                reject(error)
            })
        })
    },
   
        
}