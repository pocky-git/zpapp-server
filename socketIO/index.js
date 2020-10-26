const {Chat} = require('../db/models')

module.exports = function(server){
    const io = require('socket.io')(server)

    io.on('connection',function(socket){
        socket.on('sendMsg',function(data){
            const {content,from,to} = data
            const chat_id = [from,to].sort().join('_')
            const create_time = Date.now()
            const read = false

            const chat = new Chat({
                content,
                from,
                to,
                chat_id,
                create_time,
                read
            })
            chat.save(function(err,data){
                if(data){
                    io.emit('receiveMsg',data)
                }
            })
        })
    })
}