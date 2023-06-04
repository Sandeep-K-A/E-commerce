const {userStatusCheck} = require('../helpers/middleware-helper')
const {getcartCount} = require('../helpers/cart-helpers');
const cart = require('../models/cartModel');
const middlewareHelper = require('../helpers/middleware-helper');
module.exports = {

    isLoggedIn:(req,res,next)=>{
        if(req.session.user){
            next();
        }else{
            res.redirect('/signin')
        }
    },
    isadminLoggedIn:(req,res,next)=>{
        if(req.session.admin){
            next();
        }else{
            res.redirect('/admin')
        }
    },
    isBlocked:(req,res,next)=>{
        // console.log(req.session)
        console.log('>>>>>>>>>>>>>>>>middleware accessed')
        let user = req.session.user
        if(user){
            userStatusCheck(user).then((response)=>{
                if(response==false){
                    req.session.user=null;
                    // res.redirect('/signin')
                    let blockMessage = "Your Access is Restricted Please Try Again Later...!!"
                    res.render('user/user-signin',{log:true,blockMessage})
                }else{
                    next()
                }
            })
        }else{
            // res.redirect('/signin')
            next()
        }
       
    },
    cartCount:(req,res,next) =>{
        let cartCount = null;
        if(req.session.user){
            const id = req.session.user._id;
            getcartCount(id).then((count)=>{
                console.log(count)
                cartCount = count;
            })
        }
        req.session.cartCount = cartCount;
        // console.log(req.session)
        next()
      
    },
    processOrderStatus:(req,res,next)=>{
        middlewareHelper.pendingOrders().then(()=>{
            console.log('Order Status with pending has be removed from the logs....')
          
        })
        next()
    }
}