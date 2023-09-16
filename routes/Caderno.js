const express = require("express");
const Caderno = require("../Models/Cadernos");
const Questao = require("../Models/Questions");
const Pastas = require("../Models/Pastas");
const User = require("../Models/User");
const Estatisticas = require("../Models/Estatisticas");
const UltimoCaderno = require("../Models/UltimoCaderno");

const moment = require("moment");

require("dotenv").config();

var router = express.Router();

router.post("/newcaderno", async (req, res) => {
  const { dados } = req.body;
  const iduser = dados.iduser;
  const nomedocaderno = dados.nomedocaderno;
  const nomedapasta = dados.nomedapasta;
  let filtros = [];

  if (dados.filtroClassificar) {
    filtros = {
      disciplina: dados.filtroClassificar.disciplina,
      assunto: dados.filtroClassificar.assunto,
      subassunto: dados.filtroClassificar.subassunto,
      ano: dados.filtroClassificar.ano,
      area: dados.filtroClassificar.area,
      banca: dados.filtroClassificar.banca,
      cargo: dados.filtroClassificar.cargo,
      escolaridade: dados.filtroClassificar.escolaridade,
      formacao: dados.filtroClassificar.formacao,
      orgao: dados.filtroClassificar.orgao,
      opcao: dados.filtroClassificar.opcao,
      _id: dados.filtroClassificar._id,
    };
  }
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  // Extrair os valores dos assuntos e as quantidades de questões
// Extrair os valores dos assuntos e as quantidades de questões
const assuntos = Object.keys(dados).filter(
  (key) =>
    key !== "nomedocaderno" && key !== "nomedapasta" && key !== "iduser" && key !== "filtroClassificar"
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

  const existe = await Caderno.findOne({ nome: nomedocaderno, iduser: iduser });

  if (existe) {
    res.json("existe");
    return;
  }

  const caderno = new Caderno({
    iduser: iduser,
    nome: nomedocaderno,
    pasta: nomedapasta,
    idquestoes: [],
    dataexibir: d + "/" + mm + "/" + aa,
    data: currentDate,
    questoesAcertadas: 0,
    questoesErradas: 0,
    total: 0,
    respostas: [],
    idquestoesCertas: [],
    idquestoesErradas: [],
    idquestoesRespondidas: [],
    filtros: filtros,
    idquestoesFavoritas: [],
    resposta: "",
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
      // Adicionar os IDs das questões ao array do caderno
      caderno.idquestoes.push(...idsQuestoes);
    }
    await caderno.save();

    const idCaderno = caderno._id;
    const pasta = await Pastas.findOne({ nome: nomedapasta, iduser: iduser });
    pasta.idCaderno.push(idCaderno);
    await pasta.save();
    const resposta = {
      mensagem: "success",
      idCaderno: idCaderno
    };
    res.json(resposta);
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});





router.post("/newcadernodesempenho", async (req, res) => {
  const { dados } = req.body;
  const iduser = dados.iduser;
  const nomedocaderno = dados.nomedocaderno;
  const nomedapasta = dados.nomedapasta;
  const idquestoes = dados.idquestoes;
  const date = new Date();
  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = date.getHours();
  const min = date.getMinutes();
  const ss = date.getSeconds();
  const currentDate = moment().format("YYYY-MM-DD HH:mm");

  const existe = await Caderno.findOne({ nome: nomedocaderno });

  if (existe) {
    res.json("existe");
    return;
  }

  const caderno = new Caderno({
    iduser: iduser,
    nome: nomedocaderno,
    pasta: nomedapasta,
    idquestoes: idquestoes,
    data: currentDate,
    dataexibir: d + "/" + mm + "/" + aa + " " + hh + ":" + min + ":" + ss,
    questoesAcertadas: 0,
    questoesErradas: 0,
    total: 0,
    respostas: [],
    idquestoesCertas: [],
    idquestoesErradas: [],
    idquestoesRespondidas: [],
    idquestoesFavoritas: [],
    resposta: "",
  });

  try {
    await caderno.save();

    const idCaderno = caderno._id;

    const pasta = await Pastas.findOne({ _id: nomedapasta, iduser: iduser });
    pasta.idCaderno.push(idCaderno);
    await pasta.save();

    res.json(idCaderno);
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.post("/favoritarcadernos", async (req, res) => {
  const iduser = req.body.userid;
  const questaoid = req.body.questaoid;
  const cadernoid = req.body.cadernoid;

  try {
    await User.updateOne(
      { _id: iduser },
      { $push: { idquestoesFavoritas: questaoid } }
    );
    await Caderno.updateOne(
      { _id: cadernoid, iduser: iduser },
      { $push: { idquestoesFavoritas: questaoid } }
    );

    res.json("success"); // retorna um json de sucesso
  } catch (err) {
    res.json(err);
  }
});

router.post("/salvarultimocadernoaberto", async (req, res) => {
  const cadernoId = req.body.cadernoid;
  const userId = req.body._id;

  const caderno = await Caderno.findOne({ _id: cadernoId, iduser: userId });

  try {
    const ultimoCaderno = new UltimoCaderno({
      nome: caderno.nome,
      idcaderno: cadernoId,
      data: Date.now(),
    });

    await ultimoCaderno.save();

    await User.updateOne(
      { _id: userId },
      { $push: { ultimocaderno: ultimoCaderno } }
    );

    res.json("success"); // retorna um json de sucesso
  } catch (err) {
    res.json(err);
  }
});

router.get("/getcadernosuser/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const cadernos = await Caderno.find({ iduser: id });

    res.json(cadernos); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

router.get("/getcadernos/:_id", async (req, res) => {
  const _id = req.params._id;
  try {
    const cadernos = await Caderno.find({ _id: _id });

    res.json(cadernos); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});


router.get("/getatualizacaoquestao/:assunto/:idcaderno", async (req, res) => {
  const assunto = req.params.assunto;
  const idcaderno = req.params.idcaderno;
  try {
    // Obtém a data do caderno associado
    const caderno = await Caderno.findById(idcaderno);
    const dataCaderno = caderno.data;

    // Busca questões com data maior que a data do caderno
    const questoesNovas = await Questao.find({
      assunto: assunto,
      date: { $gt: dataCaderno }
    });
    // Calcula a quantidade de questões novas
    const quantidadeQuestoesNovas = questoesNovas.length;

    res.json({ quantidadeQuestoesNovas }); // Retorna a quantidade de questões novas
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

router.post("/atualizarcaderno", async (req, res) => {
  const assunto = req.body.assunto;
  const quantidadeQuestoes = req.body.quantidadeQuestoes;
  const cadernoId = req.body.cadernoid;

  try {
    // Encontre o caderno com base no ID e no usuário
    const caderno = await Caderno.findOne({ _id: cadernoId});

    if (!caderno) {
      return res.status(404).json({ message: "Caderno não encontrado" });
    }

    const dataDoCaderno = caderno.data;

    // Faça uma consulta para buscar questões posteriores à data do caderno e correspondentes ao assunto
    const questoesAtualizadas = await Questao.find({
      assunto: assunto,
      date: { $gt: dataDoCaderno }, // Filtra questões com data maior do que a do caderno
    })
      .limit(quantidadeQuestoes) // Limite a quantidade de questões retornadas
      .exec();
  
      // Crie um array com os IDs das questões encontradas
      const idsDasQuestoes = questoesAtualizadas.map(questao => questao._id);

      // Adicione os IDs das questões ao campo caderno.idQuestoes
      caderno.idquestoes.push(...idsDasQuestoes);
  
      // Salve as alterações no caderno
      await caderno.save();
      // Agora você tem as questões atualizadas que correspondem aos critérios
  
  
    res.json("success");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar questões atualizadas" });
  }
});


router.post("/verifyresponse", async (req, res) => {
  const date = new Date();
  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = date.getHours();
  const min = date.getMinutes();
  const ss = date.getSeconds();

  let respostas = req.body.resposta;
  // verifique se `respostas` é um array
  if (!Array.isArray(respostas)) {
    // se não for, coloque em um array
    respostas = respostas;
  }
  const userid = respostas.userid;

  const novaResposta = {
  idquestao: respostas.questaoId,
  idusuario: userid,
  respostaUsuario: respostas.resposta,
  dataResposta: d + "/" + mm + "/" + aa + " " + hh + ":" + min + ":" + ss ,
};
  if (respostas.acertou == false) {
    try {
      await Questao.updateOne(
        { _id: respostas.questaoId },
        { $inc: { erros: 1, total: 1 },
        $push: { respostas: novaResposta } // Adiciona a nova resposta à array 'respostas'
      }
      );

      const estatisticasuser = await Caderno.findOne({
        _id: respostas.cadernoId,
        "estatisticas.assunto": respostas.assunto,
      });

      if (estatisticasuser) {
        await Caderno.updateOne(
          {
            _id: respostas.cadernoId,
            "estatisticas.assunto": respostas.assunto,
          },
          {
            $inc: { "estatisticas.$.questoesErradas": 1 },
          }
        );
      } else {
        await Caderno.updateOne(
          {
            _id: respostas.cadernoId,
          },
          {
            $push: {
              estatisticas: {
                disciplina: respostas.disciplina,
                assunto: respostas.assunto,
                questoesErradas: 1,
              },
            },
          }
        );
      }

      await Caderno.updateOne(
        { _id: respostas.cadernoId },
        {
          $push: {
            idquestoesErradas: respostas.questaoId,
            idquestoesRespondidas: respostas.questaoId,
            respostas: {
              idquestao: respostas.questaoId,
              respostaUsuario: respostas.resposta,
              dataResposta: d + "/" + mm + "/" + aa + " " + hh + ":" + min + ":" + ss ,

            },
          },
          $inc: { questoesErradas: 1, total: 1 },
        }
      );
      await User.updateOne(
        { _id: respostas.userid },
        {
          $inc: { totalErradas: 1, totalQuestoes: 1 },
          $push: {
            idquestoesErradas: respostas.questaoId,
            idquestoesResolvidas: respostas.questaoId,
          },
        }
      );

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
      await Caderno.updateOne(
        { _id: respostas.cadernoId },
        {
          $push: {
            idquestoesCertas: respostas.questaoId,
            idquestoesRespondidas: respostas.questaoId,
            respostas: {
              idquestao: respostas.questaoId,
              respostaUsuario: respostas.resposta,
              dataResposta: d + "/" + mm + "/" + aa + " " + hh + ":" + min + ":" + ss ,
            },
          },
          $inc: { questoesAcertadas: 1, totalQuestoes: 1 },
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

      const estatisticasuser = await Caderno.findOne({
        _id: respostas.cadernoId,
        "estatisticas.assunto": respostas.assunto,
      });

      if (estatisticasuser) {
        await Caderno.updateOne(
          {
            _id: respostas.cadernoId,
            "estatisticas.assunto": respostas.assunto,
          },
          {
            $inc: { "estatisticas.$.questoesAcertadas": 1 },
          }
        );
      } else {
        await Caderno.updateOne(
          {
            _id: respostas.cadernoId,
          },
          {
            $push: {
              estatisticas: {
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
    } catch {
      res.json("error");
    }
  }
});

router.post("/verifyresponseunica", async (req, res) => {
  let respostas = req.body.resposta;
  // verifique se `respostas` é um array
  if (!Array.isArray(respostas)) {
    // se não for, coloque em um array
    respostas = respostas;
  }
  const date = new Date();
  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = date.getHours();
  const min = date.getMinutes();
  const ss = date.getSeconds();

  const userid = respostas.userid;
  
  const novaResposta = {
    idquestao: respostas.questaoId,
    idusuario: userid,
    respostaUsuario: respostas.resposta,
    dataResposta: d + "/" + mm + "/" + aa + " " + hh + ":" + min + ":" + ss ,
  };
  if (respostas.acertou == false) {
    try {
      await Questao.updateOne(
        { _id: respostas.questaoId },
        { $inc: { erros: 1, total: 1 },
        $push: { respostas: novaResposta } // Adiciona a nova resposta à array 'respostas'
      }
      );
      await User.updateOne(
        { _id: respostas.userid },
        {
          $inc: { totalErradas: 1, totalQuestoes: 1 },
          $push: {
            idquestoesErradas: respostas.questaoId,
            idquestoesResolvidas: respostas.questaoId,
          },
        }
      );

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
        { $inc: { acertos: 1, total: 1 } ,
        $push: { respostas: novaResposta } // Adiciona a nova resposta à array 'respostas'
      }
      );

      await User.updateOne(
        { _id: respostas.userid },
        {
          $inc: { totalCertas: 1, totalQuestoes: 1 },
          $push: {
            idquestoesCorretas: respostas.questaoId,
            idquestoesResolvidas: respostas.questaoId,
          },
        }
      );

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
    } catch {
      res.json("error");
    }
  }
});

router.post("/verifyresponsecaderno", async (req, res) => {
  let respostas = req.body.resposta;
  // verifique se `respostas` é um array
  if (!Array.isArray(respostas)) {
    // se não for, coloque em um array
    respostas = [respostas];
  }

  const promises = respostas.map(async (resposta) => {
    const { userid, acertou, disciplina, assunto, cadernoid, idquestoes } =
      resposta;

    let totalCertas = 0;
    let totalErradas = 0;

    const updates = [];

    for (let i = 0; i < acertou.length; i++) {
      if (acertou[i] === false) {
        totalErradas++;
        const estatistica = await Estatisticas.findOne({
          assunto: { $in: assunto[i] },
          iduser: userid,
        });

        if (estatistica) {
          updates.push(
            Estatisticas.updateOne(
              { _id: estatistica._id },
              { $inc: { questoesErradas: 1 } }
            )
          );
        } else {
          updates.push(
            new Estatisticas({
              disciplina: disciplina[i],
              assunto: assunto[i],
              questoesAcertadas: 0,
              questoesErradas: 1,
              iduser: userid,
            }).save()
          );
        }

        updates.push(
          Caderno.updateOne(
            { _id: cadernoid },
            {
              $set: { questoesErradas: totalErradas },
              $push: {
                idquestoesErradas: idquestoes[i],
                idquestoesRespondidas: idquestoes[i],
              },
            }
          )
        );

        updates.push(
          User.findByIdAndUpdate(
            { _id: userid },
            { $inc: { totalQuestoes: 1, totalErradas: 1 } },
            { new: true }
          )
        );

        await Questao.updateOne(
          { _id: respostas.questaoId },
          { $inc: { erros: 1, total: 1 } }
        );
      } else if (acertou[i] === true) {
        totalCertas++;

        const estatistica = await Estatisticas.findOne({
          assunto: { $in: assunto[i] },
          iduser: userid,
        });

        if (estatistica) {
          updates.push(
            Estatisticas.updateOne(
              { _id: estatistica._id },
              { $inc: { questoesAcertadas: 1 } }
            )
          );
        } else {
          updates.push(
            new Estatisticas({
              disciplina: disciplina[i],
              assunto: assunto[i],
              questoesAcertadas: 1,
              questoesErradas: 0,
              iduser: userid,
            }).save()
          );
        }

        updates.push(
          Caderno.updateOne(
            { _id: cadernoid },
            {
              $set: { questoesAcertadas: totalCertas },
              $push: {
                idquestoesCertas: idquestoes[i],
                idquestoesRespondidas: idquestoes[i],
              },
            }
          )
        );
        await Questao.updateOne(
          { _id: respostas.questaoId },
          { $inc: { acertos: 1, total: 1 } }
        );

        updates.push(
          User.findByIdAndUpdate(
            { _id: userid },
            { $inc: { totalQuestoes: 1, totalCertas: 1 } },
            { new: true }
          )
        );
      }
    }

    return Promise.all(updates);
  });

  try {
    await Promise.all(promises);
    res.json("success");
  } catch (err) {
    res.json("Erro ao processar as respostas.");
  }
});

router.post("/deletecadernos", async (req, res) => {
  const _id = req.body._id;
  try {
    Caderno.deleteOne({ _id: _id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("error");
  }
});

router.post("/restartcadernos", async (req, res) => {
  const _id = req.body._id;
  try {
    Caderno.findByIdAndUpdate(
      { _id: _id },
      { questoesAcertadas: 0, questoesErradas: 0 },
      { new: true }
    ).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("error");
  }
});

router.post("/zerarcaderno", async (req, res) => {
  const { _id, tipo } = req.body;

  try {
    const caderno = await Caderno.findOne({ _id: _id });
    switch (tipo) {
      case "total":
        await Caderno.updateOne(
          { _id: _id },
          { $set: { total: 0, questoesErradas: 0, questoesAcertadas: 0 } }
        );
        caderno.idquestoesCertas = [];
        caderno.idquestoesErradas = [];
        caderno.idquestoesRespondidas = [];
        caderno.respostas = [];
        await caderno.save();

        res.json("success"); // retorna um json de sucesso
        break;

      case "acertos":
        await Caderno.updateOne(
          { _id: _id },
          {
            $inc: { total: -caderno.questoesAcertadas },
            $set: { questoesAcertadas: 0, idquestoesCertas: [], respostas: [] },
          }
        );

        // Remover idquestoesErradas de idquestoesResolvidas
        await Caderno.updateOne(
          { _id: _id },
          { $pullAll: { idquestoesRespondidas: caderno.idquestoesCertas } }
        );

        // Remover documentos das respostas correspondentes às questões erradas
        await caderno.save();

        res.json("success"); // retorna um json de sucesso
        break;

      case "erros":
        await Caderno.updateOne(
          { _id: _id },
          {
            $inc: { total: -caderno.questoesErradas },
            $set: { questoesErradas: 0, idquestoesErradas: [], respostas: [] },
          }
        );

        // Remover idquestoesErradas de idquestoesResolvidas
        await Caderno.updateOne(
          { _id: _id },
          { $pullAll: { idquestoesRespondidas: caderno.idquestoesErradas } }
        );

        // Remover documentos das respostas correspondentes às questões erradas
        await caderno.save();

        res.json("success"); // retorna um json de sucesso
        break;
    }
  } catch (err) {
    res.json("error");
  }
});
module.exports = router;
