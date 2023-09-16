
const mongoose = require('mongoose');

const UltimoCaderno = mongoose.model('UltimoCaderno', {
    nome: {type: String},
    idcaderno: { type: String },
    data: { type: Date, default: Date.now } // data em que o filtro foi criado
});

module.exports = UltimoCaderno;
