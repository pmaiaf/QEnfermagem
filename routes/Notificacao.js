const express = require("express");
const Notificacao = require("../Models/Notificacao");
const User = require("../Models/User");
const ErrorNotificacao = require("../Models/ErrorNotificacao")
const moment = require('moment');

require("dotenv").config();

var router = express.Router();

router.post("/newnotificacao", async (req, res) => {
  const { assunto, mensagem, tiponotificacao, usuario, feedback, uf } = req.body;

  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const currentDate = moment().format('YYYY-MM-DD HH:mm');

  const notificacao = new Notificacao({
    assunto,
    mensagem,
    tiponotificacao,
    usuario,
    feedback,
    data: currentDate,
    dataexibir: d + "/" + mm + "/" + aa ,
    visto: false,
  });
  try {
  if (usuario === "todos") {
    await notificacao.save();
    await User.updateMany(
      {},
      {
        $push: {
          notificacao: {
            notificacaoid: notificacao._id,
            assunto: assunto,
            mensagem: mensagem,
            tiponotificacao: tiponotificacao,
            usuario: usuario,
            feedback: feedback,
            data: currentDate,
            dataexibir: d + "/" + mm + "/" + aa,

            visto: false,
            dataexibir: d + "/" + mm + "/" + aa,
            _id: notificacao._id
          },
        },
      }
    );
    if(uf != '' || undefined){
      await User.updateMany(
        {uf: uf},
        {
          $push: {
            notificacao: {
              assunto: assunto,
              mensagem: mensagem,
              tiponotificacao: tiponotificacao,
              usuario: usuario,
              feedback: feedback,
              data:currentDate ,
              dataexibir: d + "/" + mm + "/" + aa,

              visto: false,
              _id: notificacao._id,
              dataexibir: d + "/" + mm + "/" + aa,
            },
          },
        }
      );
    }
      res.json("success");
    } else {
      await notificacao.save();

      await User.updateOne(
        { _id: usuario },
        {
          $push: {
            notificacao: {
              assunto: assunto,
              mensagem: mensagem,
              tiponotificacao: tiponotificacao,
              usuario: usuario,
              feedback: feedback,
              data:currentDate ,
              dataexibir: d + "/" + mm + "/" + aa,
              visto: false,
              _id: notificacao._id

            },
          },
        }
      );

      if(uf != '' || undefined){
        await User.updateMany(
          {uf: uf},
          {
            $push: {
              notificacao: {
                assunto: assunto,
                mensagem: mensagem,
                tiponotificacao: tiponotificacao,
                usuario: usuario,
                feedback: feedback,
                data: currentDate,
                dataexibir: d + "/" + mm + "/" + aa,

                visto: false,
                dataexibir: d + "/" + mm + "/" + aa,
                _id: notificacao._id

              },
            },
          }
        );
      }
      res.json("success");
    }
  } catch (error) {
    console.log(error);
    res.json("error");
  }
});

router.post("/deletenotificacao", async (req, res) => {
  const _id = req.body._id;
  const iduser = req.body.iduser;

  try {
    // Excluir a notificação pelo ID
    await Notificacao.deleteOne({ _id: _id });

    // Remover a notificação do usuário correspondente
    await User.findOneAndUpdate(
      { _id: iduser },
      { $pull: { notificacao: { _id: _id } } },
      { new: true }
    );

    res.json("success");
  } catch (error) {
    console.error(error);
    res.json("Erro ao deletar");
  }
});


router.post("/deletenotificacaoall", async (req, res) => {
  const _ids = req.body._ids;
  const iduser = req.body.iduser;

  try {
    // Excluir as notificações pelos IDs
    await Notificacao.deleteMany({ _id: { $in: _ids } });

    // Remover as notificações do usuário correspondente
    await User.findOneAndUpdate(
      { _id: iduser },
      { $pull: { notificacao: { _id: { $in: _ids } } } },
      { new: true }
    );

    res.json("success");
  } catch (error) {
    console.error(error);
    res.json("Erro ao deletar");
  }
});




router.get("/getnotificacao", async (req, res) => {
  try {
    const notificacao = await Notificacao.find().sort({ data: -1 })

    res.json(notificacao); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});


router.get("/getnotificacaoregex/:regex", async (req, res) => {
  const regex = req.params.regex
  try {
    const notificacao = await Notificacao.find({
      $or: [
        { assunto: { $regex: regex , $options: "i"} },
        { mensagem: { $regex: regex, $options: "i" } },
        { tiponotificacao: { $regex: regex , $options: "i"} },
        { usuario: { $regex: regex, $options: "i" } },
        { data: { $regex: regex, $options: "i" } },


      ]
    });
   
    res.json(notificacao); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getnotificacaouser/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const notificacoes = await User.aggregate([
      { $match: { _id: user._id } },
      { $unwind: "$notificacao" },
      { $sort: { "notificacao.data": -1 } },
      {
        $project: {
          _id: "$notificacao._id",
          assunto: "$notificacao.assunto",
          mensagem: "$notificacao.mensagem",
          tiponotificacao: "$notificacao.tiponotificacao",
          usuario: "$notificacao.usuario",
          feedback: "$notificacao.feedback",
          data: "$notificacao.data",
          dataexibir: "$notificacao.dataexibir",
          visto: "$notificacao.visto"
        }
      }
    ]);

    res.json(notificacoes);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar as notificações.");
  }
});




router.get("/getnotificacaoespecifica", async (req, res) => {
  const { id, iduser } = req.query;
  try {
    const user = await User.findById(iduser);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const notificacao = user.notificacao.find((notificacao) => notificacao._id.toString() === id.toString());
    if (!notificacao) {
      return res.status(404).json({ message: "Notificação não encontrada" });
    }

    res.json(notificacao);
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao buscar a notificação.");
  }
});





router.post("/vistnotificationtrue", async (req, res) => {
  const { id, iduser } = req.body;

  try {
    await User.updateOne(
      { _id: iduser, "notificacao._id": id },
      { $set: { "notificacao.$.visto": true } }
    );
    res.json("success");
  } catch (error) {
    console.log(error);
    res.json("error");
  }
});





  
router.post("/reporterror", async (req, res) => {
  const {
    tipo,
    resumo,
    idquestao,
    iduser,
  } = req.body;

  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // O mês é indexado em 0, então adicionamos 1 e usamos o método padStart() para adicionar um zero à esquerda, se necessário
  const day = String(date.getDate()).padStart(2, "0");
  
  const data = `${year}-${month}-${day}`;
  
  

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const errornotificacao = new ErrorNotificacao({
    tipo: tipo,
    resumo:resumo ,
    idquestao: idquestao,
    iduser:iduser ,
    data:data,
    feito: false,
    dataexibir: d + "/" + mm + "/" + aa + "-" + hh + ':' + min

  });
  try {
    await errornotificacao.save();
    res.json("success");
  } catch (error) {
    res.json("error");
  }
});

router.get("/reporterrors", async (req, res) => {
  try {
    const errors = await ErrorNotificacao.find().sort({ data: -1 });
    res.json(errors);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter os erros", error: error.message });
  }
});

router.post("/deleteerror/:_id", async (req, res) => {
  const _id = req.body._id;
  try {
    await ErrorNotificacao.deleteOne({ _id: _id });
    res.json("success");
  } catch {
    res.json("error");
  }
});
router.post("/deleteerrorall/", async (req, res) => {
  const _ids = req.body._ids;
  console.log(_ids)
  try {
    await ErrorNotificacao.deleteMany({ _id: { $in: _ids } });;
    res.json("success");
  } catch {
    res.json("error");
  }
});



router.get("/getnoficationerror/:regex", async (req, res) => {
  const regex = req.params.regex
  try {
    const notificacao = await ErrorNotificacao.find({
      $or: [
        { tipo: { $regex: regex , $options: "i"} },
        { resumo: { $regex: regex, $options: "i" } },
        { idquestao: { $regex: regex , $options: "i"} },



      ]
    }).sort({data: -1})
   
    res.json(notificacao); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});


module.exports = router;
