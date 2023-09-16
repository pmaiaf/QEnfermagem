const mongoose = require('mongoose')

const Orgao = mongoose.model('Orgao',{
    nome: {type: String},
    data: {type: String},

})

module.exports = Orgao