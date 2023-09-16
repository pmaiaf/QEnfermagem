const mongoose = require('mongoose')

const Banca = mongoose.model('Banca',{
    disciplina: {type: String},
    banca: {type: String},
    data: {type: String},

})

module.exports = Banca