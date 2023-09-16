const mongoose = require('mongoose')

const Favoritar = mongoose.model('Favoritar',{
    nome  : {type: String},
    idquestoesfavoritas: {type: []},

})

module.exports = Favoritar