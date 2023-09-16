const express = require("express");
const Mapa = require("../Models/Mapa")
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Disciplina = require('../Models/Discplina')
require("dotenv").config();

var router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const newFilename = `${uuidv4()}${ext}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage });


router.post('/newmapa', upload.single('foto'), async (req, res) => {
  const { disciplina, assunto, subassunto } = req.body;

  // Salvar a URL do mapa mental no banco de dados
  const mapaMentalName = req.file.filename;
  const mapa = new Mapa({ disciplina, assunto, subassunto, mapaMental: mapaMentalName });
  

   const assuntoMapa = await Mapa.findOne({subassunto: subassunto})

   if(assuntoMapa){
   return res.json("existe")
  
   }
  try {
    await mapa.save();
    res.json('success');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post("/deletemapa", async (req, res) => {
  const _id = req.body._id;
  try {
    const mapa = await Mapa.deleteOne({ _id: _id });
     fs.unlink(`oConcursos-Back-End/upload/${mapa.mapaMental}`, (err) => {
       if (err) throw err;
     });
     res.json("sucess");
   } catch {
     res.json("Erro ao deletar");
   }
});

router.get("/getmapa", async (req,res)=>{
  try{
  const mapa = await Mapa.find()
   res.json(mapa)
  }catch{  
    res.json("error")
  }
})


router.get("/getmapadisciplina/:disciplina", async (req,res)=>{
  const disciplina = req.params.disciplina

  try{
  const mapa = await Mapa.find({disciplina: disciplina})
   res.json(mapa)
  }catch{  
    res.json("error")
  }
})

router.get("/getmaparegex/:regex", async (req,res)=>{
  const regex = req.params.regex
  try {
    const mapa = await Disciplina.find({
      $or: [
        { disciplina: { $regex: regex , $options: "i"} },


      ]
    });

    res.json(mapa); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
})


router.get("/getmapa/:assunto", async (req,res)=>{
  try{
   const assunto =  req.params.assunto
  const mapa = await Mapa.find( {assunto: assunto})
   res.json(mapa)
  }catch{  
    res.json("error")
  }
})



router.get('/download/:id', async (req, res) => {
  try {
    const mapa = await Mapa.findById(req.params.id);
    const filename = mapa.mapaMental;
    const filepath = path.join(__dirname, '..', 'uploads', filename);
    
    res.download(filepath);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
