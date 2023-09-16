const mongoose = require('mongoose')

const SubAssunto = mongoose.model('SubAssunto',{
    disciplina: {type: String},
    assunto: {type: String},
    subassunto: {type: String},
    data: {type: String}

})

module.exports = SubAssunto