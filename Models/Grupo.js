const mongoose = require('mongoose')

const Grupo = mongoose.model('Grupo',{
    nome: {type: String},
    cargo: {type: String},
    linkwhats: {type: String},
    linktelegram: {type: String},
})

module.exports = Grupo