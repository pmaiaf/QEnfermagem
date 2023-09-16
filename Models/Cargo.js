const mongoose = require('mongoose')

const Cargo = mongoose.model('Cargo',{
    nome: {type: String},
    data: {type: String},

})

module.exports = Cargo