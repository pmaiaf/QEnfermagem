const express = require("express");
const Guias = require("../Models/Guias");
const SubGuias = require("../Models/Subguias");
const CadernoGuias = require("../Models/CadernoGuias");
const Question = require("../Models/Questions");
const moment = require("moment");
const Subguias = require("../Models/Subguias");
const Cadernos = require("../Models/Cadernos");
const Pastas = require("../Models/Pastas");

require("dotenv").config();

var router = express.Router();

router.post("/newguia", async (req, res) => {
  const nome = req.body.nome;
  const disciplina = req.body.disciplina;
  const assunto = req.body.assunto;
  const banca = req.body.banca;

  const edital = req.body.edital;
  const editallink = req.body.editallink;

  const date = new Date();

  const guia = await Guias.findOne({ nome: nome });

  const d = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const aa = String(date.getFullYear());
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  const formattedDate = `${d}/${mm}/${aa} ${hh}:${min}`;

  const guias = new Guias({
    nome: nome,
    disciplina: disciplina,
    assunto: assunto,
    banca: banca,
    edital: edital,
    editallink: editallink,
    data: date,
    dataexibir: d + "/" + mm + "/" + aa,
  });

  try {
    if (guia) {
      res.json("existe");
    } else {
      await guias.save();
      res.json("success");
    }
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.post("/newsubguia", async (req, res) => {
  const nome = req.body.nome;
  const detalhamento = req.body.detalhamento;
  const idguia = req.body.idguia;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const subguia = await SubGuias.findOne({ nome: nome });

  const guia = await Guias.findOne({ _id: idguia });

  const subguias = new SubGuias({
    nome: nome,
    detalhamento: detalhamento,
    idguia: idguia,
    idquestoes: 0,
    idcadenrnosguias: 0,
    disciplina: guia.disciplina,
    assunto: guia.assunto,
    data: d + "/" + mm + "/" + aa,
  });

  try {
    if (subguia) {
      res.json("existe");
    } else {
      await subguias.save();
      res.json("success");
    }
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.post("/newcadernoguia", async (req, res) => {
  const { formData } = req.body;
  const nome = formData.nomedocaderno;
  const idguiaSelecionado = formData.idguiaSelecionado;
  const idsubguiaSelecionado = formData.idsubguiaSelecionado;
  const date = new Date();
  const currentDate = moment().format("YYYY-MM-DD HH:mm");

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  // Extrair os valores dos assuntos e as quantidades de questões
  const assuntos = Object.keys(formData).filter(
    (key) =>
      key !== "nomedocaderno" &&
      key !== "idguiaSelecionado" &&
      key !== "idsubguiaSelecionado"
  );
  const quantidades = Object.values(formData).filter(
    (value) => typeof value === "number"
  );

  // Validar se o número de assuntos e quantidades estão corretos
  if (assuntos.length !== quantidades.length) {
    return res
      .status(400)
      .json({ error: "Número de assuntos e quantidades inválidos." });
  }

  const guia = await Guias.findOne({ _id: idguiaSelecionado });

  const cadernos = new CadernoGuias({
    nome: nome,
    idguia: idguiaSelecionado,
    idsubguia: idsubguiaSelecionado,
    disciplina: guia.disciplina,
    assunto: guia.assunto,
    data: currentDate,
    idquestoes: [], // Inicializar o array de IDs de questões vazio
  });
  try {
    for (let i = 0; i < assuntos.length; i++) {
      const assunto = assuntos[i];
      const quantidade = quantidades[i];

      // Fazer a query para buscar questões aleatórias para cada assunto
      const questoes = await Question.aggregate([
        { $match: { assunto: assunto } },
        { $sample: { size: quantidade } },
        { $project: { _id: 1 } },
      ]);

      // Extrair os IDs das questões selecionadas
      const idsQuestoes = questoes.map((q) => q._id);

      // Verificar se os IDs das questões já estão presentes no array do caderno
      for (const idQuestao of idsQuestoes) {
        if (!cadernos.idquestoes.includes(idQuestao)) {
          // Adicionar o ID da questão ao array do caderno
          cadernos.idquestoes.push(idQuestao);
        }
      }
      const tamanho = cadernos.idquestoes.length;
      await cadernos.save();
    }
    const tamanho = cadernos.idquestoes.length;

    await SubGuias.updateOne(
      { _id: idsubguiaSelecionado },
      {
        $inc: {
          idcadenrnosguias: 1,
          idquestoes: tamanho,
        },
      }
    );
    res.json("success");
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.get("/getguias", async (req, res) => {
  try {
    const guias = await Guias.find();
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getguias/:_id", async (req, res) => {
  const _id = req.params._id;
  try {
    const guias = await Guias.find({ _id: _id });
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getguiasregex/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const guias = await Guias.find({
      $or: [
        { nome: { $regex: regex, $options: "i" } },
        { disciplina: { $regex: regex, $options: "i" } },
        { assunto: { $regex: regex, $options: "i" } },
        { banca: { $regex: regex, $options: "i" } },
      ],
    });
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getsubguias/:_id", async (req, res) => {
  const _id = req.params._id;

  try {
    const guias = await SubGuias.find({ idguia: _id });
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getsubguiaspelocaderno/:_id", async (req, res) => {
  const _id = req.params._id;

  try {
    const guias = await SubGuias.find({ _id: _id });
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getcadernosguias/:_id", async (req, res) => {
  const _id = req.params._id;
  try {
    const guias = await CadernoGuias.find({ idsubguia: _id });

    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getcadernoguia", async (req, res) => {
  try {
    const guias = await CadernoGuias.find();
    res.json(guias);
  } catch {
    res.json("error");
  }
});

router.get("/getcadernoguiaregex/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const guias = await Guias.find({
      $or: [
        { nome: { $regex: regex, $options: "i" } },
        { disciplina: { $regex: regex, $options: "i" } },
        { assunto: { $regex: regex, $options: "i" } },
        { banca: { $regex: regex, $options: "i" } },
      ],
    });
    res.json(guias); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deleteguia", async (req, res) => {
  const _id = req.body._id;
  try {
    await Guias.deleteOne({ _id: _id }).then(async (x) => {
      await Subguias.deleteMany({ idguia: _id }).then(async (x) => {
        await CadernoGuias.deleteMany({ idguia: _id }).then(async (x) => {
          res.json("success");
        });
      });
    });
  } catch {
    res.json("error");
  }
});

router.post("/deletesubguia", async (req, res) => {
  const _id = req.body._id;
  try {
    await SubGuias.deleteOne({ _id: _id }).then(async (x) => {
      await CadernoGuias.deleteMany({ idsubguia: _id }).then(async (x) => {
        res.json("success");
      });
    });
  } catch {
    res.json("error");
  }
});

router.post("/deletecadernoguia", async (req, res) => {
  const cadernoId = req.body._id;
  try {
    // Encontre o caderno pelo ID
    const caderno = await CadernoGuias.findOne({ _id: cadernoId });

    if (!caderno) {
      return res.status(404).json({ error: "Caderno não encontrado." });
    }

    // Recupere o ID do subguia do caderno
    const subguiaId = caderno.idsubguia;

    // Recupere a quantidade de questões associadas ao caderno
    const quantidadeQuestoes = caderno.idquestoes.length;

    // Remova a quantidade de questões do subguia
    await SubGuias.updateOne(
      { _id: subguiaId },
      { $inc: { idquestoes: -quantidadeQuestoes, idcadenrnosguias: -1 } }
    );

    // Exclua o caderno
    await CadernoGuias.deleteOne({ _id: cadernoId });

    res.json("success");
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.post("/salvarcaderno", async (req, res) => {
  const iduser = req.body.iduser;
  const nome = req.body.nome;
  const nomeDaPasta = req.body.pasta;
  const idcadernoguia = req.body.idcadernoguia;
  const currentDate = moment().format("YYYY-MM-DD HH:mm");

  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = date.getHours();
  const min = date.getMinutes();
  const cadernoguia = await CadernoGuias.findOne({ _id: idcadernoguia });
  const caderno = await CadernoGuias.findOne({ nome: nome });

  try {
    if (caderno) {
      res.json("existe")
    } else {
      const caderno = new Cadernos({
        iduser: iduser,
        nome: nome,
        pasta: nomeDaPasta,
        idquestoes: cadernoguia.idquestoes,
        dataexibir: d + "/" + mm + "/" + aa + " " + hh + ":" + min,
        data: currentDate,
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

      await caderno.save();

      const _idcaderno = caderno._id;
      const pasta = await Pastas.findOne({ nome: nomeDaPasta, iduser: iduser });
      pasta.idCaderno.push(_idcaderno);
      await pasta.save();
      res.json(_idcaderno);
    }
  } catch (error) {
    console.log(error)
    res.json("error");
  }
});



router.post("/salvarcadernoshare", async (req, res) => {
  const iduser = req.body.iduser;
  const nome = req.body.nome;
  const nomeDaPasta = req.body.pasta; // Renomeie aqui para evitar conflito de nome
  const idcadernoguia = req.body.idcadernoguia;
  const currentDate = moment().format("YYYY-MM-DD HH:mm");

  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = date.getHours();
  const min = date.getMinutes();
  const cadernoguia = await Cadernos.findOne({ _id: idcadernoguia });
  const caderno = await Cadernos.findOne({ nome: nome });

  try {
    if (caderno) {
      res.json("existe")
    } else {
      const caderno = new Cadernos({
        iduser: iduser,
        nome: nome,
        pasta: nomeDaPasta,
        idquestoes: cadernoguia.idquestoes,
        dataexibir: d + "/" + mm + "/" + aa + " " + hh + ":" + min,
        data: currentDate,
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

      await caderno.save();

      const _idcaderno = caderno._id;
      const pasta = await Pastas.findOne({ nome: nomeDaPasta, iduser: iduser });
      pasta.idCaderno.push(_idcaderno);
      await pasta.save()
      res.json(_idcaderno);
    }
  } catch (error) {
    console.log(error)
    res.json("error");
  }
});

module.exports = router;
