const mongoose = require("mongoose");

const Notificacao = require("./Notificacao");
const Simulado = require("./Simulado")
const Favoritar = require("./Favoritar")
const Filtros = require('../Models/Filtros')
const UltimoCaderno = require('../Models/UltimoCaderno')
const User = mongoose.model("User", {
  nome: { type: String },
  email: { type: String },
  senha: { type: String },
  celular: { type: String },
  plano: { type: String },
  start_date: {type: Date},
  end_date: { type: Date},
  external: {type: String},
  approved: {type: String},
  cargo: { type: String },
  curriculo: {type: String},
  uf: { type: String },
 
  dataCadastro: { type: Date },
  dataExibir: {type: String},
  notificacao: { type: [Notificacao.schema] },
  totalQuestoes: { type: Number, default: 0 },
  totalErradas: { type: Number, default: 0 },
  totalCertas: { type: Number, default: 0 },
  idquestoesCorretas: {type: []},
  filtros : {type: [Filtros.schema]},
  ultimocaderno:{type: [UltimoCaderno.schema]},

  idquestoesErradas: {type: []},
  idquestoesResolvidas: {type: []},
  questoesFavoritas: { type: [Favoritar.schema] },
  confirmacaoToken: {
    type: String,
  },
  confirmacaoExpiracao: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  ativo: {
    type: Boolean,
  },
  simulados:{ type: [Simulado.schema] },
  foto: { type: String}
});

module.exports = User;
