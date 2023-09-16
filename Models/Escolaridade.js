const mongoose = require('mongoose')

const Escolaridade = mongoose.model('Escolaridade',{
    nome: {type: String},
    data: {type: String}
})

module.exports = Escolaridade