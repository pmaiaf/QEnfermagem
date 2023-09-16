const mongoose = require('mongoose')

const Estatisticas = mongoose.model('Estatisticas',{
        disciplina: { type: String },
        assunto: { type: String },
        questoesAcertadas: { type: Number, default: 0 },
        questoesErradas: { type: Number, default: 0 },
        questaoId: { type: String},
        iduser: {type: String}

})

module.exports = Estatisticas