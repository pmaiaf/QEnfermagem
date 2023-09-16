const mongoose = require('mongoose')

const Disciplina = mongoose.model('Assunto',{
    disciplina: {type: String},
    assunto: {type: String},
    data: {type: String},

})

module.exports = Disciplina