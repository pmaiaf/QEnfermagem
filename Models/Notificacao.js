const mongoose = require('mongoose')

const Notificacao = mongoose.model('Notificacao',{
    assunto: {type: String},
    mensagem: {type: String},
    tiponotificacao: {type: String},
    usuario: {type: String},
    feedback: {type: String},
     data: {type: Date},
     dataexibir:{ type:String},
     visto: {type: Boolean},
})

module.exports = Notificacao