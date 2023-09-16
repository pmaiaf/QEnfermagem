const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

require("dotenv").config();

const router = express.Router();
const Pasta = require("../Models/Pastas");


// Rota para obter um usuário por ID
router.get("/getuserbyid/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.find({ _id: id });

    res.json(user); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
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

router.post("/register",  upload.single('foto'), async (req, res) => {
  const { nome, email, senha, celular, uf } = req.body;

  try {
    // Verifica o email
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.json("Usuário já existe");
    }
    // Criando a senha
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(senha, salt);
    const date = new Date();
    const d = date.getDate();
    const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
    const aa = date.getFullYear();
  
    const hh = date.getHours();
    const min = date.getMinutes();
    const ss = date.getSeconds();
    if(req.file){
      const foto = req.file.filename;
    }


    const token = jwt.sign({ email }, 'segredo_do_token');

    // Criando usuário
    const user = new User({
      nome,
      email,
      senha: passwordHash,
      celular,
      uf, 
      plano: "gratis",
      cargo: "user",
      notificacao: [], 
      questoesFavoritas: [], 
      filtros: [],
      dataExibir: d + "/" + mm + "/" + aa + " ",
      dataCadastro: new Date(),
      confirmacaoToken: token,
      confirmacaoExpiracao: Date.now() + 10 * 60 * 1000, // 10 minutos
      ativo: false,
      aprovedd: '',
      external: '',
      curriculo: '',
      foto: foto

    });

    await user.save();
    const pasta = new Pasta({
     nome: "Sem classificação",
     iduser: user._id
    });
      await pasta.save();


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465, // Porta do servidor SMTP
      secure: true, // Usar SSL/TLS,
      logger: true,
      debug:true,
      secureConnection: true,
      auth: {
        user: 'pedroooo1227@gmail.com',
        pass: 'errmvxgfzwgbkrul',
      },
     tls:{
      rejectUnAuthorized: true
     }
    });  
    
    

      const activationLink = `http://localhost:4200/activate-account?token=${token}`;

    const mailOptions = {
      from: "pedroooo1227@gmail.com",
      to: user.email,
      subject: "Ativação de Conta",
      html: `Clique <a href="${activationLink}">aqui</a> para ativar sua conta.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("E-mail de ativação enviado:", info.response);
      }
    });

    res.json("Enviado");
  } catch (error) {
    console.log(error)
    res.json("Houve um erro ao cadastrar o usuário");
  }
});

router.post("/activate-account", async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ confirmacaoToken: token });
    if (!user) {
      return res.status(404).json("Token de ativação inválido");
    }

    // Verificar se o token de ativação expirou
    if (new Date() > user.confirmacaoExpiracao) {
      return res.json("Token de ativação expirado");
    }

    // Ativar a conta do usuário
    user.ativo = true;
    user.confirmacaoToken = undefined;
    user.confirmacaoExpiracao = undefined;

    await user.save();

    res.json("Conta ativada com sucesso");
  } catch (error) {
    res.status(500).json("Erro ao ativar a conta");
  }
});


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const user = await User.findOne({ email: email });

  if (!user || !user._id) {
    res.json('Usuário não encontrado');
    return;
  }

  const checkPassword = await bcrypt.compare(senha, user.senha);
  if (!checkPassword) {
    res.json('Senha inválida');
    return;
  }

  if (!user.ativo) {
    // Gerar novo código de ativação
    const token = jwt.sign({ email }, 'JAFWRIJFÇRLKWJIF813OJFIAÇRWFALWJ1398UE3891YFHAW98FHRAOLU1J91', {
      expiresIn: '10m',
    });

    // Atualizar o código de ativação do usuário no banco de dados
    user.confirmacaoToken = token;
    user.confirmacaoExpiracao = Date.now() + 10 * 60 * 1000; // 10 minutos
    await user.save();

    // Enviar e-mail de ativação
   
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465, // Porta do servidor SMTP
      secure: true, // Usar SSL/TLS,
      logger: true,
      debug:true,
      secureConnection: true,
      auth: {
        user: 'pedroooo1227@gmail.com',
        pass: 'errmvxgfzwgbkrul',
      },
     tls:{
      rejectUnAuthorized: true
     }
    });  
    const activationLink = `http://localhost:4200/activate-account?token=${token}`;

    const mailOptions = {
      from: 'christianvilaca@hotmail.com',
      to: user.email,
      subject: 'Ativação de Conta',
      html: `Clique <a href="${activationLink}">aqui</a> para ativar sua conta.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail de ativação enviado:', info.response);
      }
    });

    res.json('Desativada');
    return;
  }else{
    try {
      const secret ='JAFWRIJFÇRLKWJIF813OJFIAÇRWFALWJ1398UE3891YFHAW98FHRAOLU1J91';
     
  
      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: '24h',
      });
  
  
      res.json({ jwt: token, user: user._id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Erro ao fazer login' });
    }
  }

});

router.post('/reset-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json('Usuário não encontrado');
    }

    const token = jwt.sign({ userId: user._id }, 'JAFWRIJFÇRLKWJIF813OJFIAÇRWFALWJ1398UE3891YFHAW98FHRAOLU1J91', {
      expiresIn: '30m',
    });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutos

    await user.save();

    const resetLink = `http://localhost:4200/reset-password/${token}`;

   
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465, // Porta do servidor SMTP
      secure: true, // Usar SSL/TLS,
      logger: true,
      debug:true,
      secureConnection: true,
      auth: {
        user: 'pedroooo1227@gmail.com',
        pass: 'errmvxgfzwgbkrul',
      },
     tls:{
      rejectUnAuthorized: true
     }
    });  
    const mailOptions = {
      from: 'christianvilaca@hotmail.com ',
      to: user.email,
      subject: 'Redefinir Senha',
      html: `Clique <a href="${resetLink}">aqui</a> para redefinir sua senha.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('E-mail de redefinição de senha enviado:', info.response);
      }
    });

    res.json('Enviado');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erro ao solicitar redefinição de senha' });
  }
});



router.post('/reset-password-final-step', async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;

  try {
    // Verificar se o token é válido e ainda está dentro do prazo de validade
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json('expirado');
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar a senha do usuário com a senha criptografada
    user.senha = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json('success');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Erro ao atualizar a senha' });
  }
});


module.exports = router;
