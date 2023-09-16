const express = require("express");
const Coments = require("../Models/Coments");


require("dotenv").config();

var router = express.Router();




router.post("/deletecoments", async (req, res) => {
  const _id = req.body._id;
  try {
    await Coments.deleteOne({ _id: _id });
    res.json("sucess");
  } catch {
    res.json("Erro ao deletar");
  }
});



router.post("/deletecomentsall", async (req, res) => {
  const _ids = req.body._ids;
  console.log(_ids)
  try {
    await Coments.deleteMany({ _id: { $in: _ids } });
    res.json("sucess");
  } catch {
    res.json("Erro ao deletar");
  }
});


router.post("/newcomments", async (req, res) => {
  const {
    comentario,
    idquestao,
    iduser,
    nomeuser,
    foto
  
  } = req.body;
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1;
  const aa = date.getFullYear();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  const coments = new Coments({
    comentario,
    idquestao,
    iduser,
    nomeuser,
    data: d + "/" + mm + "/" + aa + " " + h + ":" + m + ":" + s ,
    likes: 0,
    deslikes:0,
    foto,


  });
  try {
    await coments.save();
    res.json("success");
  } catch (error) {
    console.log(error)
    res.json("error");
  }
});

router.get("/getcoments", async (req, res) => {
  try {
    const coments = await Coments.find();
    
    res.json(coments); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});



router.get("/getcoments/:_id", async (req, res) => {
  const _id = req.params._id 
  try {
    const coments = await Coments.find({idquestao: _id});
    res.json(coments); // r etorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});




router.get("/getcomentsregex/:regex", async (req, res) => {
  const regex = req.params.regex
  try {
    const questions = await Coments.find({
      $or: [
        { questionid: { $regex: regex , $options: "i"} },
        { nomeuser: { $regex: regex, $options: "i" } },
        { comentario: { $regex: regex , $options: "i"} }

      ]
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

module.exports = router;
