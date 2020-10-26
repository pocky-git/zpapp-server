const express = require('express')
const router = express.Router()
const md5 = require('blueimp-md5')

const {User, Chat} = require('../db/models')

//注册路由
router.post('/register',function(req,res){
  const {username,password,type} = req.body
  User.findOne({username},function(err,user){
    if(err){
      res.send({code: 500, msg: '服务器错误'})
    }else{
      if(user){
        res.send({code: 1, msg: '此用户已存在'})
      }else{
        const user = new User({
          username,
          password: md5(password),
          type
        })
        user.save(function(err,user){
          if(err){
            res.send({code: 500, msg: '服务器错误'})
          }else{
            res.cookie('user_id',user._id,{maxAge: 1000*60*60*24})
            res.send({code: 0, data: {_id:user._id,username,type}})
          }
        })
      }
    }
  })
})

// 登陆路由
router.post('/login',function(req,res){
  const {username,password} = req.body
  User.findOne({username,password:md5(password)},{password:0,__v:0},function(err,user){
    if(err){
      res.send({code: 500, msg: '服务器错误'})
    }else{
      if(user){
        res.cookie('user_id',user._id,{maxAge: 1000*60*60*24})
        res.send({code: 0, data: user})
      }else{
        res.send({code: 1, msg: '用户名或密码错误'})
      }
    }
  })
})

//更新用户信息路由
router.post('/update',function(req,res){
  const _id = req.cookies.user_id
  User.findByIdAndUpdate({_id},req.body,function(err,oldUser){
    if(err){
        res.send({code: 1, msg: '服务器错误'})
    }else{
      if(!oldUser){
        res.clearCookie('user_id')
        res.send({code: 1, msg: '请先登录'})
      }else{
        const {_id,username,type} = oldUser
        const user = Object.assign(req.body,{_id,username,type})
        res.send({code: 0, data: user})
      }
    }
  })
})

// 获取用户信息路由
router.get('/user',function(req,res){
  const type = req.query.type
  const _id = req.cookies.user_id
  if(type && _id){
    User.find({type,header:{$exists:true}},{password:0,__v:0},function(err,users){
      if(err){
        res.send({code: 1, msg: '服务器错误'})
      }else{
        res.send({code: 0, data: users})
      }
    })
  }else{
    User.findOne({_id},{password:0,__v:0},function(err,user){
      if(err){
        res.send({code: 1, msg: '服务器错误'})
      }else{
        if(user){
          res.send({code: 0, data: user})
        }else{
          res.send({code: 1, msg: '请先登录'})
        }
      }
    })
  }
})

// 获取聊天记录
router.get('/msglist',function(req,res){
  const userid = req.cookies.user_id
  if(!userid){
    return res.send({code: 1, msg: '请先登录'})
  }

  User.find(function(err,data){
    const users = {}
    if(data){
      data.forEach(user=>{
        users[user._id]={
          username:user.username,
          header:user.header
        }
      })
      Chat.find({$or:[
        {from: userid},
        {to: userid}
      ]},function(err,data){
        if(data){
          res.send({code: 0, data: {
            users,
            msgList: data
          }})
        }
      })
    }
  })
  
})

// 设置消息为已读状态
router.post('/read',function(req,res){
  const userid = req.cookies.user_id
  if(!userid){
    return res.send({code: 1, msg: '请先登录'})
  }
  const {chat_id} = req.body
  Chat.updateMany({chat_id,to:userid},{read: true},function(err,data){
    if(err){
      res.send({code: 1, msg: '服务器错误'})
    }else{
      res.send({code: 0, data})
    }
  })
})

module.exports = router;