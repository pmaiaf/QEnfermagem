const mongoose = require('mongoose')
const Estatisticas = require('../Models/Estatisticas')

const RespostasSimulado ={

    idquestoes: {type: []},
    idquestoesCertas: {type: []},
    idquestoesErradas: {type: []},
    idquestoesRespondidas: {type: []},
    idquestoesFavoritas: { type: []} ,
}

const RespsotasUsario ={
    idquestao:{type: String},
    respostaUsuario: {type: String},
    dataResposta: {type: Date},

}
const Simulado = mongoose.model('Simulado',{
    nome: {type: String},
    cargo: {type: String},
    inicio: {type: Date},
    exibir: {type: Date},
    idquestoes: {type: [String]},
    respostas: {type: [RespostasSimulado]},
    dataexibir: { type: String},
    data: { type: Date},
    acertos: {type: Number, default: 0},
    erros: {type: Number, default: 0},
    total: {type: Number, default: 0},
    respostaUsuario: {type: [RespsotasUsario]},
    estatisticas: {type: [Estatisticas.schema]}


})

module.exports = Simulado