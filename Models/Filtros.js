
const mongoose = require('mongoose');

const Filtros = mongoose.model('Filtros', {
    nome: {type: String},
    questoes: { type: []},
    disciplina: { type: [] },
    assunto: {  type: [] },
    subassunto: {  type: [] },
    ano: {  type: [] },
    area: {  type: [] },
    banca: {  type: []},
    cargo: { type: [] },
    escolaridade: { type: []},
    formacao: {  type: [] },
    orgao: {  type: [] },
    opcao: {  type: [] },
    _id: { type: String},
    data: { type: Date, default: Date.now } // data em que o filtro foi criado
});

module.exports = Filtros;
