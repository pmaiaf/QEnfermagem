const express = require("express");
const Grupo = require("../Models/Grupo");
require("dotenv").config();

var router = express.Router();

// ---------------------------------- Formação ---------------------------- //

router.post("/newgrupo", async (req, res) => {
  const { nome, cargo, linkwhats, linktelegram } = req.body;
  const form = new Grupo({
    nome,
    cargo,
    linkwhats,
    linktelegram,
  });
  try {
    await form.save();
    res.json("success");
  } catch {
    res.json("error");
  }
});

router.get("/getgrupo", async (req, res) => {
  try {
    const form = await Grupo.find();

    res.json(form); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.post("/deletegrupo", async (req, res) => {
  const _id = req.body._id;
  try {
    Grupo.deleteOne({ _id: _id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("error");
  }
});
router.post("/deletegruposall", async (req, res) => {
  const _ids = req.body._ids;

  try {
    await Grupo.deleteMany({ _id: { $in: _ids } });
    res.json("success");
  } catch (error) {
    console.error("Erro ao deletar grupos:", error);
    res.status(500).json("Erro ao deletar grupos");
  }
});
router.get("/getgruporegex/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const grupo = await Grupo.find({
      $or: [{ nome: { $regex: regex, $options: "i" } }],
    });
    
    res.json(grupo);
  } catch (err) {
    console.log(err);

    res.json("error");
  }
});

module.exports = router;
