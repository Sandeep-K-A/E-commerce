const userModel=require('../models/userModel')
module.exports={
    userStatusCheck:(user)=>{
        // console.log(user,'0000000000000000');
        return new Promise((resolve,reject)=>{
            userModel.findOne({email:user.email}).then((Details)=>{
                resolve(Details.status);
            }).catch((error)=>{
                console.log(error);
                reject(error);
            })
        })
    }
}