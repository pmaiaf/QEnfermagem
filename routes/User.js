const express = require("express");
const User = require("../Models/User");
const bcrypt = require('bcrypt');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

var router = express.Router();

router.post("/editusers", async (req, res) => {
  const { id, nome, email, celular, cargo, uf, curriculo } = req.body;

  User.updateOne({ _id: id }, { nome: nome, email: email, celular: celular, cargo: cargo, uf: uf, curriculo: curriculo })
    .then(result => {
      res.json("success");
    })
    .catch(err => {
      res.json("error");
    });
});


router.post("/resetpassword", async (req, res) => {
  const { _id, senhaatual, novasenha, confirmasenha } = req.body;
  try {
    // Encontre o usuário no banco de dados com base no ID
    const user = await User.findOne({ _id: _id });

    // Verifique se a senha atual fornecida coincide com a senha do usuário no banco de dados
    const isPasswordMatch = await bcrypt.compare(senhaatual, user.senha);

    if (!isPasswordMatch) {
      res.json("naomatch")
    }

    // Verifique se as duas novas senhas coincidem
    if (novasenha !== confirmasenha) {
      res.json("incompativeis")
    }

    // Gere um hash da nova senha
    const hashedPassword = await bcrypt.hash(novasenha, 10);

    // Atualize a senha do usuário no banco de dados
    await User.updateOne({ _id: _id }, { senha: hashedPassword });

    res.json("success");
  } catch (error) {
    console.log(error)
  }
});



router.get("/allUsers", async (req, res) => {
  try {
    const user = await User.find();

    res.json(user); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/allUsersid/:id", async (req, res) => {
  const _id = req.params.id
  try {
    const user = await User.findOne({ _id: _id });

    res.json(user); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/usersteachers", async (req, res) => {
  try {
    const user = await User.find({ cargo: 'professor' });

    res.json(user); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});



router.get("/allUsersregex/:regex", async (req, res) => {
  const regex = req.params.regex
  try {
    const users = await User.find({
      $or: [
        { nome: { $regex: regex, $options: "i" } },
        { email: { $regex: regex, $options: "i" } },
        { plano: { $regex: regex, $options: "i" } },
        { celular: { $regex: regex, $options: "i" } }


      ]
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar users.");
  }
});


router.post("/deleteusers", async (req, res) => {
  const _id = req.body._id;

  try {
    await User.deleteOne({ _id: _id });
    res.json("deletada");
  } catch {
    res.json("error");
  }
});


router.post("/deleteusersall", async (req, res) => {
  const _ids = req.body._ids;

  try {
    await User.deleteMany({ _id: { $in: _ids } });
    res.json("deletada");
  } catch {
    res.json("error");
  }
});
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/users');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const newFilename = `${uuidv4()}${ext}`;
    cb(null, newFilename);
  },
});
const upload = multer({ storage });

router.post("/editaruser", upload.single('foto'), async (req, res) => {
  const _id = req.body.iduser;
  const { nome, email, celular, uf } = req.body.formData;
  console.log(req.body.formData)
  console.log(req.file)
  if (req.file) {
    const foto = req.file.filename
    try {
      await User.updateOne({ _id: _id }, { $set: { nome: nome, email: email, celular: celular, uf: uf, foto: foto }, }, { new: true });
      res.json("success");
    } catch (error) {
      console.error(error);
      res.status(500).json("Ocorreu um erro ao atualizar os dados");
    }
  }
  else {
    try {
      await User.updateOne({ _id: _id }, { $set: { nome: nome, email: email, celular: celular, uf: uf }, }, { new: true });
      res.json("success");
    } catch (error) {
      console.error(error);
      res.status(500).json("Ocorreu um erro ao atualizar os dados");
    }
  }
});

module.exports = router;
