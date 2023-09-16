const mongoose = require('mongoose')

const Coments = mongoose.model('Coments',{
    comentario: {type: String},
    idquestao: { type: String},
    iduser: { type: String},
    nomeuser: {type: String},
    data: { type: String},
    likes:{type: Number},
    deslikes: {type: Number},
    foto: {type: String}


})

module.exports = Coments