const mongoose = require('mongoose')
const Justificativa = require('./Justificativa')

const Questions = mongoose.model('Qustions',{
    tipoDeQuestao: {type: String},
    textoassociado: {type: String},
    enunciado: {type: String},
    gabarito: {type: String},
    situacaoQuestao: {type: String},
    justificativa: {type: [Justificativa.schema] },
    alternativas: {type: []} ,
    disciplina: {type: String},
    assunto : {type:String},
    subassunto : {type:String},
    banca: {type: String},
    orgao: {type: String},
    cargo: {type: String},
    ano: {type: String},
    area : {type:String},
    escolaridade: {type: String},
    formacao: {type: String},
    date : { type: Date},
    erros: { type: Number},
    acertos: { type: Number},
    total: { type: Number},
    respostas: [{ idquestao: String, idusuario: String, respostaUsuario: String,dataResposta: String }],
    
})

module.exports = Questions