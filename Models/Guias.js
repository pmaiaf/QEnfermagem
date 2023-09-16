const mongoose = require('mongoose')

const Guias = mongoose.model('Guias',{
    nome: {type: String},
    disciplina: {type: String},
    assunto: {type: String},
    banca: { type: String},
    edital: { type: String},
    editallink: {type: String},
    data: {type: Date},
    dataexibir: {type: String}

})

module.exports = Guias