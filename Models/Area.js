const mongoose = require('mongoose')

const Area = mongoose.model('Area',{
    nome: {type: String},
    data: {type: String}
})

module.exports = Area