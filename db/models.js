const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/zpapp')

const conn = mongoose.connection

conn.on('connected',()=>{
    console.log('数据库连接成功!')
})

const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true}, 
    header: {type: String}, 
    post: {type: String},
    info: {type: String}, 
    company: {type: String},
    salary: {type: String}
})

const User = mongoose.model('User',userSchema)

const chatSchema = mongoose.Schema({
    from: {type: String, required: true},
    to: {type: String, required: true},
    chat_id: {type: String, required: true},
    content: {type: String, required: true},
    read: {type: Boolean, default: false},
    create_time: {type: Number},
})

const Chat = mongoose.model('Chat',chatSchema)

exports.User = User

exports.Chat = Chat