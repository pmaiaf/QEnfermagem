const mongoose = require('mongoose')

const Ano = mongoose.model('Ano',{
    nome: {type: String},
    data: {type: String}
})

module.exports = Ano