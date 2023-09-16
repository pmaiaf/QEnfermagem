const express = require("express");
const Simulado = require("../Models/Simulado");
const Questao = require("../Models/Questions");
const User = require("../Models/User");
const moment = require("moment");
const Estatisticas = require("../Models/Estatisticas");

require("dotenv").config();

var router = express.Router();
const multer = require("multer");
const upload = multer({
  dest: "uploads/mapa",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

router.post("/newsimulado", async (req, res) => {
  const { dados } = req.body;
  const nome = dados.nome;
  const cargo = dados.cargo;
  const inicio = dados.inicio;
  const exibir = dados.exibir;

  const date = new Date();
  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  // Extrair os valores dos assuntos e as quantidades de questões
  const assuntos = Object.keys(dados).filter(
    (key) =>
      key !== "nome" && key !== "cargo" && key !== "inicio" && key !== "exibir"
  );
  const quantidades = Object.values(dados).filter(
    (value) => typeof value === "number"
  );
  const currentDate = moment().format("YYYY-MM-DD HH:mm");

  // Validar se o número de assuntos e quantidades estão corretos
  if (assuntos.length !== quantidades.length) {
    return res
      .status(400)
      .json({ error: "Número de assuntos e quantidades inválidos." });
  }

  const existe = await Simulado.findOne({ nome: nome });

  if (existe) {
    res.json("existe");
    return;
  }

  const caderno = new Simulado({
    nome: nome,
    cargo: cargo,
    inicio: inicio,
    idquestoes: [],
    exibir: exibir,
    dataexibir: d + "/" + mm + "/" + aa,
    data: currentDate,
    respostas: [],
    estatisticas: [],
  });

  try {
    for (let i = 0; i < assuntos.length; i++) {
      const assunto = assuntos[i];
      const quantidade = quantidades[i];

      // Fazer a query para buscar questões aleatórias para cada assunto
      const questoes = await Questao.aggregate([
        { $match: { assunto: assunto } },
        { $sample: { size: quantidade } },
        { $project: { _id: 1 } },
      ]);

      // Extrair os IDs das questões selecionadas
      const idsQuestoes = questoes.map((q) => q._id);

      // Verificar se os IDs das questões já estão presentes no array do caderno
      for (const idQuestao of idsQuestoes) {
        if (!caderno.idquestoes.includes(idQuestao)) {
          // Adicionar o ID da questão ao array do caderno
          caderno.idquestoes.push(idQuestao);
        }
      }
    }
    await caderno.save();

    // Obtém o objeto completo do simulado criado
    const simulado = await Simulado.findById(caderno._id);
    const simuladoid = simulado._id;

    // Encontra o usuário para adicionar o simulado
    await User.updateMany(
      {},
      {
        $push: {
          simulados: {
            _id: simuladoid,
            nome: nome,
            cargo: cargo,
            inicio: inicio,
            idquestoes: simulado.idquestoes,
            exibir: exibir,
            dataexibir: d + "/" + mm + "/" + aa,
            data: currentDate,
            estatisticas: [],
            respostas: [
              {
                idquestoes: [],
                respostaUsuario: [],
                idquestoesRespondidas: [],
                idquestoesCertas: [],
                acertos: 0,
                erros: 0,
                total: 0,
              },
            ],
          },
        },
      }
    );

    res.json("success");
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.get("/getsimuladosuser/:idsimulado/:iduser", async (req, res) => {
  const iduser = req.params.iduser;
  const idsimulado = req.params.idsimulado;

  try {
    const user = await User.findById(iduser).populate("simulados");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const simulado = user.simulados.find(
      (simulado) => simulado._id.toString() === idsimulado
    );
    if (!simulado) {
      return res.status(404).json({ message: "Simulado não encontrado" });
    }

    const notificacoes = {
      _id: simulado._id,
      nome: simulado.nome,
      cargo: simulado.cargo,
      inicio: simulado.inicio,
      exibir: simulado.exibir,
      idquestoes: simulado.idquestoes,
      respostas: simulado.respostas,
      dataexibir: simulado.dataexibir,
      data: simulado.data,
      acertos: simulado.acertos,
      erros: simulado.erros,
      total: simulado.total,
    };

    res.json(notificacoes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar as notificações.");
  }
});

router.get("/getsimuladosranking/:id", async (req, res) => {
  const simuladoId = req.params.id;

  try {
    const simulado = await Simulado.findById(simuladoId);
    res.json(simulado); // Retorna o ranking dos usuários com base nas respostas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar o ranking dos simulados.");
  }
});

router.get("/getsimuladosall", async (req, res) => {
  try {
    //
    const simulados = await Simulado.find(); // Filtra os simulados com data de início menor ou igual à data atual
    res.json(simulados); // Retorna um JSON com os simulados encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os simulados.");
  }
});

router.get("/getsimulados", async (req, res) => {
  try {
    const currentDate = new Date().toISOString(); // Obtém a data atual no formato ISO 8601
    //
    const simulados = await Simulado.find({ inicio: { $lte: currentDate } }); // Filtra os simulados com data de início menor ou igual à data atual
    res.json(simulados); // Retorna um JSON com os simulados encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os simulados.");
  }
});
router.get("/getsimuladosembreve", async (req, res) => {
  try {
    const currentDate = new Date().toISOString(); // Obtém a data atual no formato ISO 8601
    //
    const simulados = await Simulado.find({ inicio: { $gte: currentDate } }); // Filtra os simulados com data de início menor ou igual à data atual
    res.json(simulados); // Retorna um JSON com os simulados encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os simulados.");
  }
});

router.post("/deletesimulado", async (req, res) => {
  const _id = req.body._id;

  try {
    // Deleta o documento na coleção Simulado
    await Simulado.deleteOne({ _id: _id });
    const user = await User.findOne({});

    user.simulados = user.simulados.filter(
      (simulado) => simulado._id.toString() !== _id
    );

    // Salvar as alterações no documento do usuário
    await user.save();
    res.json("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar o simulado.");
  }
});

router.post("/deletesimuladoall", async (req, res) => {
  const ids = req.body._ids; // Array de IDs dos simulados a serem excluídos

  try {
    // Deleta os documentos na coleção Simulado
    await Simulado.deleteMany({ _id: { $in: ids } });

    // Para cada ID de simulado, remover do usuário correspondente
    for (const id of ids) {
      const user = await User.findOne({});
      user.simulados = user.simulados.filter(simulado => simulado._id.toString() !== id);
      
      // Salvar as alterações no documento do usuário
      await user.save();
    }

    res.json("success");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao deletar os simulados.");
  }
});


router.post("/verifyresponsesimulado", async (req, res) => {
  let respostas = req.body.resposta;
  // verifique se `respostas` é um array
  if (!Array.isArray(respostas)) {
    // se não for, coloque em um array
    respostas = respostas;
  }

  const userid = respostas.userid;

  if (respostas.acertou == false) {
    try {
      await Questao.updateOne(
        { _id: respostas.questaoId },
        { $inc: { erros: 1, total: 1 } }
      );

      await Simulado.updateOne(
        { _id: respostas.simuladoid, "respostas.email": respostas.email },
        {
          $push: {
            "respostas.$.idquestoes": respostas.questaoId,
            "respostas.$.respostaUsuario": respostas.resposta,
            "respostas.$.idquestoesRespondidas": respostas.questaoId,
            "respostas.$.idquestoesErradas": respostas.questaoId,
            "respostas.$.respostaUsuario": respostas.resposta,
            respostaUsuario: {
              idquestao: respostas.questaoId,
              respostaUsuario: respostas.resposta,
            },
          },
          $inc: {
            "respostas.$.erros": 1,
            "respostas.$.total": 1,
            erros: 1,
            total: 1,
          }, // Incrementa 1 em erros, total e mantém acertos como 0
        }
      );

      await User.updateOne(
        { _id: respostas.userid },
        {
          $inc: { totalErradas: 1, total: 1 },
          $push: {
            idquestoesERradas: respostas.questaoId,
            idquestoesResolvidas: respostas.questaoId,
          },
        }
      );
      await User.updateOne(
        {
          _id: respostas.userid,
          "simulados._id": respostas.simuladoid,
        },
        {
          $push: {
            "simulados.$.respostas.0.idquestoes": respostas.questaoId,
            "simulados.$.respostas.0.respostaUsuario": respostas.resposta,
            "simulados.$.respostas.0.idquestoesRespondidas":
              respostas.questaoId,
            "simulados.$.respostas.0.idquestoesErradas": respostas.questaoId,
            "simulados.$.respostaUsuario": {
              idquestao: respostas.questaoId,
              respostaUsuario: respostas.resposta,
            },
          },
          $inc: { "simulados.$.erros": 1, "simulados.$.total": 1 },
        },
        { upsert: true }
      );

      const estatisticaUser = await User.findOne({
        "simulados.estatisticas.assunto": respostas.assunto,
        "simulados._id": respostas.simuladoid,
      });

      if (estatisticaUser) {
        await User.updateOne(
          {
            _id: respostas.userid,
            simulados: {
              $elemMatch: {
                _id: respostas.simuladoid,
                "estatisticas.assunto": respostas.assunto,
              },
            },
          },
          {
            $inc: { "simulados.$.estatisticas.$[elem].questoesErradas": 1 },
          },
          {
            arrayFilters: [{ "elem.assunto": respostas.assunto }],
            upsert: true,
          }
        );
      } else {
        await User.updateOne(
          {
            _id: respostas.userid,
            "simulados._id": respostas.simuladoid,
          },
          {
            $push: {
              "simulados.$.estatisticas": {
                disciplina: respostas.disciplina,
                assunto: respostas.assunto,
                questoesErradas: 1,
              },
            },
          }
        );
      }

      const estatistica = await Estatisticas.findOne({
        assunto: respostas.assunto,
        iduser: userid,
      });

      if (estatistica) {
        await Estatisticas.updateOne(
          { _id: estatistica._id },
          { $inc: { questoesErradas: 1 } }
        );
      } else {
        await new Estatisticas({
          disciplina: respostas.disciplina,
          assunto: respostas.assunto,
          questoesAcertadas: 0,
          questoesErradas: 1,
          iduser: userid,
          questaoId: respostas.questaoId,
        }).save();
      }
      res.json("success");
    } catch (err) {
      console.log(err);
      res.json("error");
    }
  } else {
    try {
      await Questao.updateOne(
        { _id: respostas.questaoId },
        { $inc: { acertos: 1, total: 1 } }
      );
     
         await Simulado.updateOne(
          { _id: respostas.simuladoid, "respostas.email": respostas.email },
          {
            $push: {
              "respostas.$.idquestoes": respostas.questaoId,
              "respostas.$.respostaUsuario": respostas.resposta,
              "respostas.$.idquestoesRespondidas": respostas.questaoId,
              "respostas.$.idquestoesAcertos": respostas.questaoId,
              "respostas.$.respostaUsuario": respostas.resposta,
              respostaUsuario: {
                idquestao: respostas.questaoId,
                respostaUsuario: respostas.resposta,
              },
            },
            $inc: {
              "respostas.$.acertos": 1,
              "respostas.$.total": 1,
              acertos: 1,
              total: 1,
            }, // Incrementa 1 em erros, total e mantém acertos como 0
          }
        );
     
        await User.updateOne(
          { _id: respostas.userid },
          {
            $inc: { totalCertas: 1, total: 1 },
            $push: {
              idquestoesCorretas: respostas.questaoId,
              idquestoesResolvidas: respostas.questaoId,
            },
          }
        );
      await User.updateOne(
        {
          _id: respostas.userid,
          "simulados._id": respostas.simuladoid,
        },
        {
          $push: {
            "simulados.$.respostas.0.idquestoes": respostas.questaoId,
            "simulados.$.respostas.0.respostaUsuario": respostas.resposta,
            "simulados.$.respostas.0.idquestoesRespondidas":
              respostas.questaoId,
            "simulados.$.respostas.0.idquestoesCertas": respostas.questaoId,
            "simulados.$.respostaUsuario": {
              idquestao: respostas.questaoId,
              respostaUsuario: respostas.resposta,
            },
          },
          $inc: { "simulados.$.acertos": 1, "simulados.$.total": 1 },
        },
        { upsert: true }
      );

      const estatisticaUser = await User.findOne({
        "simulados.estatisticas.assunto": respostas.assunto,
        "simulados._id": respostas.simuladoid,
      });

      if (estatisticaUser) {
        await User.updateOne(
          {
            _id: respostas.userid,
            simulados: {
              $elemMatch: {
                _id: respostas.simuladoid,
                "estatisticas.assunto": respostas.assunto,
              },
            },
          },
          {
            $inc: { "simulados.$.estatisticas.$[elem].questoesAcertadas": 1 },
          },
          {
            arrayFilters: [{ "elem.assunto": respostas.assunto }],
            upsert: true,
          }
        );
      } else {
        await User.updateOne(
          {
            _id: respostas.userid,
            "simulados._id": respostas.simuladoid,
          },
          {
            $push: {
              "simulados.$.estatisticas": {
                disciplina: respostas.disciplina,
                assunto: respostas.assunto,
                questoesAcertadas: 1,
              },
            },
          }
        );
      }

 

      const estatistica = await Estatisticas.findOne({
        assunto: respostas.assunto,
        iduser: userid,
      });

      if (estatistica) {
        await Estatisticas.updateOne(
          { _id: estatistica._id },
          { $inc: { questoesAcertadas: 1 } }
        );
      } else {
        await new Estatisticas({
          disciplina: respostas.disciplina,
          assunto: respostas.assunto,
          questoesAcertadas: 1,
          questoesErradas: 0,
          iduser: userid,
          questaoId: respostas.questaoId,
        }).save();
      }
      res.json("success");
    } catch (err) {
      console.log(err);
      res.json("error");
    }
  }
});
router.get("/getsimuladoregex/:regex/:idsimulado", async (req, res) => {
  const regex = req.params.regex;
  const idsimulado = req.params.idsimulado;
  try {
    const simulados = await Simulado.find({
      _id: idsimulado,
      $or: [{ "respostas.email": { $regex: regex, $options: "i" } }],
    });
    res.json(simulados);
  } catch {
    res.json("error");
  }
});

router.get(
  "/getestatisticasimuladoregex/:regex/:idsimulado/:iduser",
  async (req, res) => {
    const regex = req.params.regex;
    const idsimulado = req.params.idsimulado;
    const iduser = req.params.iduser;

    try {
      const user = await User.findOne({ _id: iduser });

      const simulado = user.simulados.find(
        (simulado) => simulado._id === idsimulado
      );

      const estatisticas = simulado.estatisticas.filter((estatistica) => {
        return (
          estatistica.disciplina.match(new RegExp(regex, "i")) ||
          estatistica.assunto.match(new RegExp(regex, "i"))
        );
      });
      res.json(estatisticas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/getsimuladoregexall/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const mapa = await Simulado.find({
      $or: [
        { nome: { $regex: regex, $options: "i" } },
        { cargo: { $regex: regex, $options: "i" } },
      ],
    });

    res.json(mapa); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});



router.post("/zerarsimulado", async (req, res) => {
  const { _id, tipo, iduser } = req.body;
  
  try {
    switch (tipo) {
      case "total":
        await User.updateOne(
          { _id: iduser, "simulados._id": _id  },
          {
            $set: {
              "simulados.$.respostas[0].idquestoesCertas": [],
              "simulados.$.respostas[0].iduqestoesErradas": [],
              "simulados.$.respostas[0].iduqestoesRespondidas": []


            }
          }
        );

        res.json("success");
        break;

      case "acertos":
        await User.updateOne(
          { _id: iduser, "simulados._id": _id },
          {
            $set: {"simulados.$.respostas[0].idquestoesCertas": [] }
          }
        );

        res.json("success");
        break;

      case "erros":
        await User.updateOne(
          { _id: iduser, "simulados._id": _id },
          {
            $set: { "simulados.$.respostas[0].iduqestoesErradas": [] }
          }
        );

        res.json("success");
        break;
    }
  } catch (err) {
    res.json("error");
  }
});



module.exports = router;
