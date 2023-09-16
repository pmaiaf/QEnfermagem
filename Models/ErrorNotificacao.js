const mongoose = require('mongoose')

const ErroNotificacao = mongoose.model('ErroNotificacao',{
    tipo: {type: String},
    resumo: { type: String},
    idquestao: {type: String},
    iduser: {type: String},
    data: {type: Date},
    dataexibir: {type: String},

    feito: {type: Boolean}

})

module.exports = ErroNotificacao