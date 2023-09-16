const express = require("express");
const Disciplina = require("../Models/Discplina");
const Assunto = require("../Models/Assunto");
const Banca = require("../Models/Banca");
const Orgao = require("../Models/Orgao");
const Cargo = require("../Models/Cargo");
const Ano = require("../Models/Ano");
const Area = require("../Models/Area");
const Escolaridade = require("../Models/Escolaridade");
const Formacao = require("../Models/Formacao");
const SubAssunto = require("../Models/SubAssunto");
const Estatisticas = require("../Models/Estatisticas");

require("dotenv").config();

var router = express.Router();

router.post("/newdisciplina", async (req, res) => {
  const { disciplina } = req.body;

  const discp = new Disciplina({
    disciplina,
  });
  try {
    const quantidade = await Disciplina.find({ disciplina: disciplina });
    const quantidadeLenght = quantidade.length;
    if (quantidadeLenght != 0) {
      res.json("existe");
    } else {
      await discp.save();
      res.json("success");
    }
  } catch {}
});

router.post("/newassunto", async (req, res) => {
  const { disciplina, assunto } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const ass = new Assunto({
    disciplina,
    assunto,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await ass.save();
    res.json("success");
  } catch {
    res.json("error");
  }
});

router.post("/newsubassunto", async (req, res) => {
  const { disciplina, assunto, subassunto } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const subassuntosave = new SubAssunto({
    disciplina,
    assunto,
    subassunto,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await subassuntosave.save();
    res.json("success");
  } catch {
    res.json("error");
  }
});

router.get("/getsubassunto", async (req, res) => {
  try {
    const subassunto = await SubAssunto.find();
    res.json(subassunto);
  } catch {
    res.json("error");
  }
});

router.get("/getdisciplina", async (req, res) => {
  try {
    const disciplinas = await Disciplina.find();
    res.json(disciplinas);
  } catch {
    res.json("error");
  }
});

router.get("/getassunto", async (req, res) => {
  try {
    const assunto = await Assunto.find();

    res.json(assunto); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getsubassunto/:assunto", async (req, res) => {
  const assunto = req.params.assunto;
  try {
    const subassunto = await SubAssunto.find({ assunto: assunto });

    res.json(subassunto); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getassunto/:disciplina", async (req, res) => {
  const disciplina = req.params.disciplina;
  try {
    const assunto = await Assunto.find({ disciplina: disciplina });

    res.json(assunto); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getassuntofiltrado/:disciplinas?", async (req, res) => {
  const disciplinas = req.params.disciplinas
    ? req.params.disciplinas.split(",")
    : [];

  try {
    const assuntos = await Assunto.find({ disciplina: { $in: disciplinas } });
    res.json(assuntos); // retorna um json com os assuntos encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os assuntos.");
  }
});


router.get("/getsubassuntofiltradodisciplina/:disciplina?", async (req, res) => {
  const disciplina = req.params.disciplina ? req.params.disciplina.split(",") : [];

  try {
    const subassuntos = await SubAssunto.find({ disciplina: { $in: disciplina } });
    res.json(subassuntos); // retorna um json com os assuntos encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os assuntos.");
  }
});

router.get("/getsubassuntofiltrado/:assuntos?", async (req, res) => {
  const subassunto = req.params.assuntos ? req.params.assuntos.split(",") : [];

  try {
    const subassuntos = await SubAssunto.find({ assunto: { $in: subassunto } });
    res.json(subassuntos); // retorna um json com os assuntos encontrados
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os assuntos.");
  }
});

// ------------------------------------------------------------------------------------------------------
router.post("/deletedisciplina", async (req, res) => {
  const id = req.body.id;
  try {
    Disciplina.deleteOne({ _id: id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("Erro ao deletar");
  }
});

router.post("/deleteassunto", async (req, res) => {
  const id = req.body.id;
  try {
    Assunto.deleteOne({ _id: id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("Erro ao deletar");
  }
});

router.post("/deletesubassunto", async (req, res) => {
  const id = req.body.id;
  try {
    SubAssunto.deleteOne({ _id: id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("Erro ao deletar");
  }
});

router.post("/newbanca", async (req, res) => {
  const { disciplina, banca } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const ass = new Banca({
    disciplina,
    banca,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await ass.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getbanca", async (req, res) => {
  try {
    const banca = await Banca.find();

    res.json(banca); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deletebanca", async (req, res) => {
  const id = req.body.id;
  try {
    Banca.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deletebancasall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Banca.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});

// ---------------------------------- Orgao ---------------------------- //

router.post("/neworgao", async (req, res) => {
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const { nome } = req.body;
  const org = new Orgao({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await org.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getorgao", async (req, res) => {
  try {
    const org = await Orgao.find();

    res.json(org); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deleteorgao", async (req, res) => {
  const id = req.body.id;
  try {
    Orgao.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deleteorgaosall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Orgao.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});

// ---------------------------------- Cargo ---------------------------- //

router.post("/newcargo", async (req, res) => {
  const { nome } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const carg = new Cargo({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await carg.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getcargo", async (req, res) => {
  try {
    const carg = await Cargo.find();

    res.json(carg); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deletecargo", async (req, res) => {
  const id = req.body.id;
  try {
    Cargo.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deletecargosall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Cargo.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});

// ---------------------------------- Ano ---------------------------- //

router.post("/newano", async (req, res) => {
  const { nome } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const carg = new Ano({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await carg.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getano", async (req, res) => {
  try {
    const carg = await Ano.find();

    res.json(carg); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deleteano", async (req, res) => {
  const id = req.body.id;
  try {
    Ano.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});


router.post("/deleteanoall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Ano.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});

// ---------------------------------- Area ---------------------------- //

router.post("/newarea", async (req, res) => {
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const { nome } = req.body;
  const area = new Area({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await area.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getarea", async (req, res) => {
  try {
    const area = await Area.find();

    res.json(area); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deletearea", async (req, res) => {
  const id = req.body.id;
  try {
    Area.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deleteareaall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Area.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});


// ---------------------------------- Escolaridade ---------------------------- //

router.post("/newescolaridade", async (req, res) => {
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const { nome } = req.body;
  const esc = new Escolaridade({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await esc.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getescolaridade", async (req, res) => {
  try {
    const area = await Escolaridade.find();

    res.json(area); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});
router.post("/deleteescolaridade", async (req, res) => {
  const id = req.body.id;
  try {
    Escolaridade.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deleteescolaridadesall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Escolaridade.deleteMany({ _id: { $in: _ids }}).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
// ---------------------------------- Formação ---------------------------- //

router.post("/newformacao", async (req, res) => {
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const { nome } = req.body;
  const form = new Formacao({
    nome,
    data: d + "/" + mm + "/" + aa,
  });
  try {
    await form.save();
    res.json("Inserido");
  } catch {
    res.json("error");
  }
});

router.get("/getformacao", async (req, res) => {
  try {
    const form = await Formacao.find();

    res.json(form); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deleteformacao", async (req, res) => {
  const id = req.body.id;
  try {
    Formacao.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deleteformacaosall", async (req, res) => {
  const _ids = req.body._ids;
  try {
    Formacao.deleteMany({ _id: { $in: _ids } }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deletarestatistica", async (req, res) => {
  const id = req.body.id;
  try {
    Estatisticas.deleteOne({ _id: id }).then((x) => {
      res.json("deletado");
    });
  } catch {
    res.json("error");
  }
});

// ------------------------------------------------------------------------------ Regex ---------------------------------------------------------------------------------------- //

router.get("/getano/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Ano.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getarea/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Area.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getbanca/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Banca.find({
      $or: [
        { disciplina: { $regex: regex, $options: "i" } },
        { banca: { $regex: regex, $options: "i" } },
      ],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getcargo/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Cargo.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getdisciplina/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Disciplina.find({
      $or: [{ disciplina: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getescolaridade/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Escolaridade.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getformacao/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Formacao.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getorgao/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Orgao.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

module.exports = router;
