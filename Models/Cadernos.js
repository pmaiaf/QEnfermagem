const mongoose = require('mongoose')
const Estatisticas = require('../Models/Estatisticas')
const Favoritar = require('../Models/Favoritar')
const Filtros = require('../Models/Filtros')

const RespostaSchema = new mongoose.Schema({
    idquestao:{type: String},
    respostaUsuario: {type: String},
    dataResposta: {type: Date},

  });

const Cadernos = mongoose.model('Cadernos',{
    iduser:{type:String},
    nome: {type: String},
    pasta: {type: String},
    dataexebir: {type: String},
    data: {type: Date},
    dataexibir:{ type: String},
    questoesAcertadas: {type: Number},
    questoesErradas: {type: Number},
    total: {type: Number},
    idquestoes: {type: []},
    idquestoesCertas: {type: []},
    idquestoesErradas: {type: []},
    idquestoesRespondidas: {type: []},
    respostas: [{ idquestao: String, respostaUsuario: String, dataResposta: String }],
    idquestoesFavoritas: { type: []} ,
    estatisticas: {type: [Estatisticas.schema]},
    filtros: {type: [Filtros.schema]},
    ultimaaba: {type: String}

})

module.exports = Cadernos