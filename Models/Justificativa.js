const mongoose = require('mongoose')

const Justificativa = mongoose.model('Justificativa',{
    explicacao: {type: String},
    professor: {type: String},
    curriculo: {type: String},
    iduser: {type: String}

})

module.exports = Justificativa