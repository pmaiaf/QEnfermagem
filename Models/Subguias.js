const mongoose = require('mongoose')

const Subguias = mongoose.model('Subguias',{
    idguia: {type: String},
    nome: {type: String},
    detalhamento: { type: String},
    idcadenrnosguias: { type: Number},
    idquestoes : {type: Number},
    disciplina: {type: String},
    assunto: {type: String},

    

})

module.exports = Subguias