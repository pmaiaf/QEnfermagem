const mongoose = require('mongoose')

const Disciplina = mongoose.model('Disciplina',{
    disciplina: {type: String},
    
})

module.exports = Disciplina