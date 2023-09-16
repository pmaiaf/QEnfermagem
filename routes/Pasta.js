const express = require("express");
const Pasta = require("../Models/Pastas");
const Cadernos = require("../Models/Cadernos")

require("dotenv").config();

var router = express.Router();

// ---------------------------------- Formação ---------------------------- //

router.post("/newpasta", async (req, res) => {
  const { nome, iduser } = req.body;
  const pasta = new Pasta({
    nome,
    iduser
  });
  try {
    await pasta.save();
    res.json("success");
  } catch {
    res.json("error");
  }
});
router.post("/renamepasta", async (req, res) => {
  const { nome, _id } = req.body;
  try {
    const pasta = await Pasta.findOne({ _id });
    if (!pasta) {
      return res.json("error"); // Pasta não encontrada
    }

    pasta.nome = nome;
    await pasta.save();

    res.json("success");
  } catch {
    res.json("error");
  }
});
router.post("/renamecaderno", async (req, res) => {
  const { nome, _id, iduser } = req.body;
  try {

    
    const existingCaderno = await Cadernos.findOne({ nome: nome, iduser: iduser });
    if (existingCaderno) {
      res.json("existe");
      return;
    }

    const caderno = await Cadernos.findOne({ _id: _id});
    if (!caderno) {
      res.json("error");
      return;
    }else{

      caderno.nome = nome;
      await caderno.save();
  
      res.json("success");
    }

  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.get("/getpasta", async (req, res) => {
  try {
    const pastas = await Pasta.find();

    res.json(pastas); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("err");
  }
});

router.get("/getpastauser/:id", async (req, res) => {
  const id = req.params.id
  try {
    const pastas = await Pasta.find({iduser: id});

    res.json(pastas); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("err");
  }
});

router.get("/getcadernosidpasta/:id", async (req, res) => {
  try {
    const ids = req.params.id.split(',')
    const cadernos = await Cadernos.find({ _id: { $exists: true, $in: ids } });
    res.json(cadernos); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.log(err);
    res.status(500).send("err");
  }
});


router.post("/movercaderno", async (req, res) => {
  const _id = req.body._id;
  const iduser = req.body.iduser
  const nomepastanova = req.body.pasta;
  const nomepastaatual = req.body.nomepasta;

  try {
    // Find the current pasta (folder) and get its _id
    const pastaAtual = await Pasta.findOne({ nome: nomepastaatual, iduser: iduser});
    const pastaAtualId = pastaAtual._id;

    // Find the new pasta and get its _id
    const pastaNova = await Pasta.findOne({ nome: nomepastanova, iduser:iduser});
    const pastaNovaId = pastaNova._id;
  

    // Update the 'pasta' field of the Cadernos (notebook) document with the new pasta _id
    await Cadernos.findOneAndUpdate({ _id: _id }, { $set: { pasta: pastaNovaId } });

    // Remove the Cadernos _id from the current pasta's 'idCaderno' array
    await Pasta.findOneAndUpdate(
      { _id: pastaAtualId },
      { $pull: { idCaderno: _id } },
      { new: true }
    );

    // Add the Cadernos _id to the new pasta's 'idCaderno' array
    await Pasta.findOneAndUpdate(
      { _id: pastaNovaId },
      { $addToSet: { idCaderno: _id } },
      { new: true }
    );

    res.json("success");
  } catch (err) {
    console.log(err);
    res.json("error");
  }
});

router.post("/deletepasta", async (req, res) => {
  const _id = req.body._id;
  try {
    Pasta.deleteOne({ _id: _id }).then((x) => {
      res.json("success");
    });
  } catch {
    res.json("error");
  }
});

router.get("/getpastasregex/:regex/:id", async (req, res) => {
  const id = req.params.id
  const regex = req.params.regex
  try {
    const pasta = await Pasta.find({
      iduser: id,
      $or: [
        { nome: { $regex: regex , $options: "i"}, },
      

      ]
    });
    res.json(pasta);
  } catch {
    res.json("error");
  }
});

module.exports = router;
