const mongoose = require('mongoose')

const CadernoGuias = mongoose.model('CadernoGuias',{
    nome: {type: String},
    idguia: {type: String},
    idsubguia: {type: String},
    idquestoes: { type: []},
    disciplina: {type: String},
    assunto: {type: String},
    data:{type: Date}
})

module.exports = CadernoGuias