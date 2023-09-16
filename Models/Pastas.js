const mongoose = require('mongoose')

const Pasta = mongoose.model('Pasta',{
    nome: {type: String},
    iduser: {type: String},
    idCaderno: {type: [String]},
})

module.exports = Pasta