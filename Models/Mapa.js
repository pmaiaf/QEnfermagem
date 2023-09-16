const mongoose = require('mongoose')

const Mapas = mongoose.model('Mapa',{
    disciplina: {type: String},
    assunto: {type: String},
    subassunto: {type: String},
    mapaMental: {type: String},

})

module.exports = Mapas