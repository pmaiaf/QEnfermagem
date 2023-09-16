const mongoose = require('mongoose')

const Formacao = mongoose.model('Formacao',{
    nome: {type: String},
    data: {type: String}
})

module.exports = Formacao