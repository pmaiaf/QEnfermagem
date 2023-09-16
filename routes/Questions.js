const express = require("express");
const Questions = require("../Models/Questions");
const User = require("../Models/User");
const Estatisticas = require("../Models/Estatisticas");
const Comentarios = require("../Models/Coments");
const Filtros = require("../Models/Filtros");
const multer = require("multer");
const xlsx = require("xlsx");
const moment = require("moment");

require("dotenv").config();
const upload = multer({ dest: "uploads/" });

var router = express.Router();

router.post("/newquestions", async (req, res) => {
  const {
    tipoDeQuestao,
    textoassociado,
    enunciado,
    alternativas,
    gabarito,
    situacaoQuestao,
    disciplina,
    assunto,
    subassunto,
    banca,
    orgao,
    cargo,
    ano,
    area,
    escolaridade,
    formacao,
    explicacao,
    professor,
  } = req.body;

  const user = User.findOne({ _id: professor });
  const date = new Date();

  const d = date.getDate();
  const mm = date.getMonth() + 1; // Lembre-se que os meses em JavaScript são indexados em 0, portanto, precisamos adicionar 1 para obter o mês correto
  const aa = date.getFullYear();

  const question = new Questions({
    tipoDeQuestao,
    textoassociado,
    enunciado,
    alternativas,
    gabarito,
    situacaoQuestao,
    disciplina,
    assunto,
    subassunto,
    banca,
    orgao,
    cargo,
    ano,
    area,
    justificativa: {
      explicacao: explicacao,
      professor: user.nome,
      curriculo: user.curriculo,
    },
    escolaridade,
    formacao,
    date: d + "/" + mm + "/" + aa,
    erros: 0,
    acertos: 0,
    total: 0,
    favoritada: false,
    respostas: [],
  });
  try {
    await question.save();
    res.json("Questão cadastrada com sucesso");
  } catch (error) {
    res.json("Houve um erro ao cadastrar");
  }
});
router.get("/filterregex/:regex/:_id", async (req, res) => {
  const regex = req.params.regex;
  const _id = req.params._id;

  try {
    const users = await User.find(
      { _id: _id, "filtros.nome": { $regex: regex, $options: "i" } },
      { "filtros.$": 100.0 } // Isso é uma projeção que retorna apenas o primeiro elemento em 'filtros' que corresponde à consulta
    );

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar os usuários.");
  }
});

router.post("/savefilters", async (req, res) => {
  const {
    disciplina,
    nome,
    assunto,
    subassunto,
    ano,
    area,
    banca,
    cargo,
    escolaridade,
    formacao,
    orgao,
    opcao,
    userid,
  } = req.body;

  try {
    await User.updateOne(
      { _id: userid },
      {
        $push: {
          filtros: {
            nome: nome,
            disciplina: disciplina,
            assunto: assunto,
            subassunto: subassunto,
            ano: ano,
            area: area,
            banca: banca,
            cargo: cargo,
            escolaridade: escolaridade,
            formacao: formacao,
            orgao: orgao,
            opcao: opcao,
          },
        },
      }
    );
    res.json("success");
  } catch (error) {
    console.log(error);
  }
});

router.post("/editquestion", async (req, res) => {
  const {
    _id, // Adicione o campo _id ao seu req.body
    textoassociado,
    enunciado,
    alternativas,
    gabarito,
    situacaoQuestao,
    disciplina,
    assunto,
    subassunto,
    banca,
    orgao,
    cargo,
    ano,
    area,
    escolaridade,
    formacao,
    explicacao,
    professor,
  } = req.body;
  try {
    const user = await User.findOne({ _id: professor });
    // Encontre a questão existente pelo _id e atualize seus campos
    await Questions.findByIdAndUpdate(_id, {
      textoassociado,
      enunciado,
      alternativas,
      gabarito,
      situacaoQuestao,
      disciplina,
      assunto,
      subassunto,
      banca,
      orgao,
      cargo,
      ano,
      area,
      justificativa: {
        explicacao: explicacao,
        professor: user.nome,
        curriculo: user.curriculo,
      },
      escolaridade,
      formacao,
    });

    res.json("success");
  } catch (error) {
    console.log(error);
    res.json("error");
  }
});

router.get("/allquestions", async (req, res) => {
  try {
    const questions = await Questions.find();
    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});
router.get("/allquestionsids", async (req, res) => {
  try {
    const dados = req.query.dados.split(",");
    const questions = await Questions.find({ _id: { $in: dados } });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/questionid/:_id", async (req, res) => {
  const _id = req.params._id;
  try {
    const questionall = await Questions.findOne({ _id: _id });
    res.json(questionall);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/allquestionswith/:regex", async (req, res) => {
  const regex = req.params.regex;
  try {
    const questions = await Questions.find({
      $or: [
        { textoassociado: { $regex: regex, $options: "i" } },
        { enunciado: { $regex: regex, $options: "i" } },
      ],
    });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/allquestions/:tipoDeQuestao", async (req, res) => {
  const tipodeQuestao = req.params.tipoDeQuestao;

  try {
    const questions = await Questions.find({ tipoDeQuestao: tipodeQuestao });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/allquestions/:disciplina", async (req, res) => {
  const disciplina = req.params.disciplina;
  try {
    const questions = await Questions.find({ disciplina: disciplina });

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get(
  "/allquestionsfilter/:disciplina?/:assunto?/:subassunto?/:ano?/:area?/:banca?/:cargo?/:escolaridade?/:formacao?/:orgao?/:opcao?/:_id?",
  async (req, res) => {
    const {
      disciplina,
      assunto,
      subassunto,
      ano,
      area,
      banca,
      cargo,
      escolaridade,
      formacao,
      orgao,
      opcao,
      _id,
    } = req.params;

    const filtro = {};
    const query = {};

    const user = await User.findOne({ _id: _id });

    if (disciplina != "undefined") {
      filtro.disciplina = { $in: disciplina.split(",") };
      query.disciplina = filtro.disciplina;
    }
    if (assunto != "undefined") {
      filtro.assunto = { $in: assunto.split(",") };
      query.assunto = filtro.assunto;
    }

    if (subassunto != "undefined") {
      filtro.subassunto = { $in: subassunto.split(",") };
      query.subassunto = filtro.subassunto;
    }
    if (ano != "undefined") {
      filtro.ano = { $in: ano.split(",") };
      query.ano = filtro.ano;
    }
    if (area != "undefined") {
      filtro.area = { $in: area.split(",") };
      query.area = filtro.area;
    }
    if (banca != "undefined") {
      filtro.banca = { $in: banca.split(",") };
      query.banca = filtro.banca;
    }
    if (cargo != "undefined") {
      filtro.cargo = { $in: cargo.split(",") };
      query.cargo = filtro.cargo;
    }
    if (escolaridade != "undefined") {
      filtro.escolaridade = { $in: escolaridade.split(",") };
      query.escolaridade = filtro.escolaridade;
    }
    if (formacao != "undefined") {
      filtro.formacao = { $in: formacao.split(",") };
      query.formacao = filtro.formacao;
    }
    if (orgao != "undefined") {
      filtro.orgao = { $in: orgao.split(",") };
      query.orgao = filtro.orgao;
    }

    if (opcao == "undefined" || null || "") {
      try {
        const questions = await Questions.find(query);
        res.json(questions);
      } catch (error) {
        res.status(500).json({ error: "Erro ao obter as questões" });
      }
    } else {
      filtro.opcao = opcao.split(","); // Convert to an array of values
      let result = []; // Empty array to store the result
      let insertedIds = []; // Empty array to store the inserted IDs

      if (filtro.opcao.includes("Dificuldade facil")) {
        let questionsFacil = [];
        if (query !== undefined) {
          questionsFacil = await Questions.find(query);
        } else {
          questionsFacil = await Questions.find();
        }
        for (const question of questionsFacil) {
          if (question.acertos > question.erros) {
            result.push(question);
          }
        }
      }

      if (filtro.opcao.includes("Dificuldade média")) {
        let questionsMedia = [];
        if (query !== undefined) {
          questionsMedia = await Questions.find(query);
        } else {
          questionsMedia = await Questions.find();
        }
        for (const question of questionsMedia) {
          if (question.acertos === question.erros) {
            result.push(question);
          }
        }
      }

      if (filtro.opcao.includes("Dificuldade difícil")) {
        const questionsDificil = await Questions.find(query);
        for (const question of questionsDificil) {
          if (question.acertos < question.erros) {
            result.push(question);
          }
        }
      }

      if (filtro.opcao.includes("Que resolvi")) {
        const idquestoesResolvidas = user.idquestoesResolvidas;

        const questoesResolvidas = await Questions.find({
          _id: { $in: idquestoesResolvidas },
        });

        result.push(...questoesResolvidas); // Expand and insert individual objects
      }

      if (filtro.opcao.includes("Que não resolvi")) {
        const idquestoesResolvidas = user.idquestoesResolvidas;

        const questoesNaoResolvidas = await Questions.find({
          _id: { $nin: idquestoesResolvidas },
        });

        result.push(...questoesNaoResolvidas); // Expand and insert individual objects
      }

      if (filtro.opcao.includes("Que errei")) {
        const idquestoesErradas = user.idquestoesErradas;

        const questoesErradas = await Questions.find({
          _id: { $in: idquestoesErradas },
        });

        result.push(...questoesErradas); // Expand and insert individual objects
      }

      if (filtro.opcao.includes("Que acertei")) {
        const idquestoesCorretas = user.idquestoesCorretas;

        const questoesCorretas = await Questions.find({
          _id: { $in: idquestoesCorretas },
        });

        result.push(...questoesCorretas); // Expand and insert individual objects
      }

      if (filtro.opcao.includes("Anuladas")) {
        const questionsAlternativas = await Questions.find({
          ...query,
          situacaoQuestao: "Anulada",
        });
        for (const question of questionsAlternativas) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Desatualizadas")) {
        const questionsAlternativas = await Questions.find({
          ...query,
          situacaoQuestao: "Desatualizada",
        });
        for (const question of questionsAlternativas) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Modalidade múltipla escolha")) {
        const questionsAlternativas = await Questions.find({
          ...query,
          tipoDeQuestao: "Alternativas",
        });
        for (const question of questionsAlternativas) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Modalidade Certo e Errado")) {
        const questionsCertoErrado = await Questions.find({
          ...query,
          tipoDeQuestao: "VerdadeiroFalso",
        });
        for (const question of questionsCertoErrado) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Não comentadas pelos usuários")) {
        // Buscar todos os ids de questões presentes na tabela de Comments
        const comments = await Comentarios.find({}, { idquestao: 1 });
        const questoesComComentarios = comments.map((comment) => comment.idquestao);
      
        // Buscar todas as questões do tipo "VerdadeiroFalso" que NÃO estão na lista de questões com comentários
        const questionsNaoComentadas = await Questions.find({
          ...query,
          _id: { $nin: questoesComComentarios },
        });
      
        for (const question of questionsNaoComentadas) {
          result.push(question);
        }
      }
      
      if (filtro.opcao.includes("Não comentadas pelos professores")) {
        const questionsJustificativa = await Questions.find({
          ...query,
          justificativa: [],
        });
        for (const question of questionsJustificativa) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Sem classificação por assunto")) {
        const questionsComClassificacao = await Questions.find({
          ...query,
          assunto: { $ne: "Sem classificação" },
        });
      
        for (const question of questionsComClassificacao) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Sem classificação por assunto")) {
        const questionsComClassificacao = await Questions.find({
          ...query,
          banca: { $ne: "Qenf Literal" },
        });
      
        for (const question of questionsComClassificacao) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Com gabarito certo")) {
        const questionsComGabaritoCerto = await Questions.find({
          ...query,
          tipoDeQuestao:  "VerdadeiroFalso" ,
          gabarito: "A"

        });
      
        for (const question of questionsComGabaritoCerto) {
          result.push(question);
        }
      }
      if (filtro.opcao.includes("Com gabarito errado")) {
        const questionsComGabaritoErrado = await Questions.find({
          ...query,
          tipoDeQuestao:  "VerdadeiroFalso" ,
          gabarito: "B"
        });
      
        for (const question of questionsComGabaritoErrado) {
          result.push(question);
        }
      }

      res.json(result); // Send the response with the result as a single array with multiple objects
    }
  }
);

router.post("/deletefilter", async (req, res) => {
  const _id = req.body._id;
  const iduser = req.body.iduser;
  try {
    await Filtros.deleteOne({ _id: _id });
    await User.findOneAndUpdate(
      { _id: iduser },
      { $pull: { filtros: { _id: _id } } },
      { new: true }
    );
    res.json("success");
  } catch {
    res.json("error");
  }
});

router.post("/deletequestions", async (req, res) => {
  const _id = req.body._id;

  try {
    await Questions.deleteOne({ _id: _id });
    res.json("Questao deletada");
  } catch {
    res.json("Erro ao deletar");
  }
});

router.post("/deletequestionsall", async (req, res) => {
  const _ids = req.body._ids;

  try {
    await Questions.deleteMany({ _id: { $in: _ids } });
    res.json("success");
  } catch (error) {
    console.log(error)
    console.error("Erro ao deletar questões:", error);
    res.status(500).json("Erro ao deletar questões");
  }
});

router.get(
  "/allquestionsfiltersolo/:disciplina?/:assunto?/:ano?/:area?/:banca?/:cargo?/:escolaridade?/:formacao?/:orgao?/:opcao?/:_id?",
  async (req, res) => {
    const {
      disciplina,
      assunto,
      ano,
      area,
      banca,
      cargo,
      escolaridade,
      formacao,
      orgao,
    } = req.params;

    const filtro = {};
    const query = {};

    if (disciplina != "undefined") {
      filtro.disciplina = { $in: disciplina.split(",") };
      query.disciplina = filtro.disciplina;
    }
    if (assunto != "undefined") {
      filtro.assunto = { $in: assunto.split(",") };
      query.assunto = filtro.assunto;
    }
    if (ano != "undefined") {
      filtro.ano = { $in: ano.split(",") };
      query.ano = filtro.ano;
    }
    if (area != "undefined") {
      filtro.area = { $in: area.split(",") };
      query.area = filtro.area;
    }
    if (banca != "undefined") {
      filtro.banca = { $in: banca.split(",") };
      query.banca = filtro.banca;
    }
    if (cargo != "undefined") {
      filtro.cargo = { $in: cargo.split(",") };
      query.cargo = filtro.cargo;
    }
    if (escolaridade != "undefined") {
      filtro.escolaridade = { $in: escolaridade.split(",") };
      query.escolaridade = filtro.escolaridade;
    }
    if (formacao != "undefined") {
      filtro.formacao = { $in: formacao.split(",") };
      query.formacao = filtro.formacao;
    }
    if (orgao != "undefined") {
      filtro.orgao = { $in: orgao.split(",") };
      query.orgao = filtro.orgao;
    }

    try {
      const questions = await Questions.find(query);

      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter as questões" });
    }
  }
);

router.post("/deletequestions", async (req, res) => {
  const _id = req.body._id;

  try {
    await Questions.deleteOne({ _id: _id });
    res.json("Questao deletada");
  } catch {
    res.json("Erro ao deletar");
  }
});

router.post("/upload-excel", upload.single("excelFile"), async  (req, res) => {
  const workbook = xlsx.readFile(req.file.path);
  const sheet_name_list = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  let errorRow = null; // Variável para armazenar a linha com erro
  let errorColumn = null; // Variável para armazenar a coluna com erro

  // Processar os dados para tratar os arrays
  const processedData = await Promise.all(data.map(async (row, rowIndex) => {
    // Validar se alguma coluna está vazia
    Object.keys(row).forEach((column) => {
      if (!row[column]) {
        errorRow = rowIndex + 1;
        errorColumn = column;
      }
    });
    const currentDate = moment().format("YYYY-MM-DD HH:mm");
    row.date =  currentDate 

  
    row.justificativa = []; // Inicialize como um array vazio
  
    if (row.explicacao && row.professor) {
      // Se explicacao e professor estiverem definidos, crie um objeto justificativa
      const user = await User.findOne({ email: row.professor });
      if (user) {
        row.justificativa.push({
          explicacao: row.explicacao,
          professor: user.nome,
          curriculo: user.curriculo,
          iduser: user._id
        });
      }
    }

  
    row.respostas = [];
  
    // Dividir a string da coluna "alternativas" em um array
    const alternativasString = row.alternativas;
  
    const alternativasArray = alternativasString
      .split(";")
      .map((item) => item.trim());
  
    // Validar e converter o valor da coluna "planilha"
    const planilha = parseInt(row.situacaoQuestao);
    if (planilha === 1) {
      row.situacaoQuestao = "Ativada";
    } else if (planilha === 2) {
      row.situacaoQuestao = "Anulada";
    } else if (planilha === 3) {
      row.situacaoQuestao = "Desativada";
    }
  
    // Verificar se o tipo de questão é "VerdadeiroFalso"
    if (row.tipodequestao === "VerdadeiroFalso") {
      // Limitar o array de alternativas a somente "Certo" e "Errado"
      row.alternativas = ["Certo", "Errado"];
    } else {
      // Para outros tipos de questão, manter o array de alternativas como estava
      row.alternativas = alternativasArray;
    }
  
    return row;
  }));
  
  // Salvar os dados no MongoDB
  Questions.insertMany(processedData)
    .then(function () {
      res.json("success");
    })
    .catch(function (error) {
      console.log(error);
      res.json("error");
    });
});

router.get("/getestatistic/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const estatistica = await Estatisticas.find({ iduser: id });

    res.json(estatistica);
  } catch (err) {
    res.json("error");
  }
});
router.get("/getestatisticregex/:id", async (req, res) => {
  const id = req.params.id;
  const regex = req.query.regex;

  try {
    const questions = await Estatisticas.find({
      iduser: id,
      $or: [
        { disciplina: { $regex: regex, $options: "i" } },
        { assunto: { $regex: regex, $options: "i" } },
      ],
    });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});

router.get("/getquestion/:dados", async (req, res) => {
  const dados = req.params.dados.split(","); // recebe uma string com ids separados por vírgula e converte em array
  try {
    const questions = await Questions.find({ _id: { $in: dados } });
    res.json(questions);
  } catch (err) {
    res.json("error");
  }
});

router.post("/zerar", async (req, res) => {
  const id = req.body.id;

  try {
    const estatisticas = await Estatisticas.findOne({ _id: id }); // busca as estatísticas pelo id
    const usuario = await User.findOne({ _id: estatisticas.iduser }); // busca o usuário associado às estatísticas

    const totalQuestoesAcertadas =
      usuario.totalQuestoes - estatisticas.questoesAcertadas; // subtrai as questões acertadas e erradas do total de questões do usuário
    const totalQuestoes = totalQuestoesAcertadas - estatisticas.questoesErradas;
    const totalCertas = usuario.totalCertas - estatisticas.questoesAcertadas; // subtrai as questões acertadas das questões corretas do usuário
    const totalErradas = usuario.totalErradas - estatisticas.questoesErradas; // subtrai as questões erradas das questões incorretas do usuário

    await Estatisticas.updateOne(
      { _id: id },
      { $set: { questoesAcertadas: 0, questoesErradas: 0 } }
    ); // atualiza as estatísticas para zerar as questões acertadas e erradas
    await User.updateOne(
      { _id: usuario._id },
      { $set: { totalQuestoes, totalCertas, totalErradas } }
    ); // atualiza o total de questões, questões corretas e questões incorretas do usuário

    res.json("success"); // retorna um json de sucesso
  } catch (err) {
    res.json("error"); // retorna um json de erro
  }
});

router.post("/favoritada", async (req, res) => {
  const { _id, cadernoid, questaoid } = req.body;
  if (respostas.acertou == false) {
    try {
      await Questao.updateOne(
        { _id: respostas.questaoId },
        { $inc: { erros: 1, total: 1 } }
      );
      await Caderno.updateOne(
        { _id: respostas.cadernoId },
        {
          $push: {
            idquestoesErradas: respostas.questaoId,
            idquestoesRespondidas: respostas.questaoId,
          },
          $inc: { questoesErradas: 1, total: 1 },
          resposta: respostas.resposta,
        }
      );
      await User.updateOne(
        { _id: respostas.userid },
        { $inc: { questoesErradas: 1, total: 1 } }
      );
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
          },
          $inc: { questoesAcertadas: 1, total: 1 },
          resposta: respostas.resposta,
        }
      );
      await User.updateOne(
        { _id: respostas.userid },
        { $inc: { questoesCertas: 1, total: 1 } }
      );
      res.json("success");
    } catch {
      res.json("error");
    }
  }
});

router.get("/allquestions", async (req, res) => {
  try {
    const questions = await Questions.find();

    res.json(questions); // retorna um json com as perguntas encontradas
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar as perguntas.");
  }
});
router.post("/favoritar", async (req, res) => {
  const userid = req.body.userid;
  const questaoid = req.body.questaoid;
  const nome = req.body.nome;

  try {
    const user = await User.findOne({ _id: userid });

    const favorito = user.questoesFavoritas.find(
      (favorito) => favorito.nome === nome
    );

    if (favorito) {
      await User.findOneAndUpdate(
        { _id: userid, "questoesFavoritas.nome": nome },
        { $push: { "questoesFavoritas.$.idquestoesfavoritas": questaoid } }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: userid },
        {
          $push: {
            questoesFavoritas: { nome: nome, idquestoesfavoritas: [questaoid] },
          },
        }
      );
    }

    res.json("success"); // Retorna um JSON de sucesso
  } catch (err) {
    console.log(err);
  }
});

router.post("/likeordeslike", async (req, res) => {
  const tipo = req.body.tipo;
  const idcomentario = req.body.idcomentario;
  const iduser = req.body.iduser;
  try {
    if (tipo === "like") {
      await Comentarios.findOneAndUpdate(
        { _id: idcomentario },
        { $inc: { likes: 1 } }
      );
      res.json("success"); // Retorna um JSON de sucesso
    } else if (tipo === "deslike") {
      await Comentarios.findOneAndUpdate(
        { _id: idcomentario },
        { $inc: { deslikes: 1 } }
      );
      res.json("success"); // Retorna um JSON de sucesso
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/favoritarregex/:regex/:userid", async (req, res) => {
  const userid = req.params.userid;
  const regex = req.params.regex;
  try {
    const user = await User.findOne({ _id: userid });
    const favoritedQuestionIds = user.idquestoesFavoritas; // Obtém os IDs das questões favoritadas

    // Filtra as questões favoritadas baseado na condição desejada (nesse caso, a pesquisa por regex)
    const questions = await Questions.find({
      _id: { $in: favoritedQuestionIds },
      $or: [
        { disciplina: { $regex: regex, $options: "i" } },
        { assunto: { $regex: regex, $options: "i" } },
        { enunciado: { $regex: regex, $options: "i" } },
        { alternativas: { $regex: regex, $options: "i" } },
      ],
    });
    res.json(questions); // retorna um json de sucesso
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

router.get("/favoritarpastaregex/:regex/:userid", async (req, res) => {
  const userid = req.params.userid;
  const regex = req.params.regex;
  try {
    const user = await User.findOne({ _id: userid });
    const favoritedQuestionIds = user.questoesFavoritas; // Obtém os IDs das questões favoritadas

    const regexPattern = new RegExp(regex, "i"); // i é para case insensitive

    // Filtrar as questões favoritadas baseado no regex
    const filteredQuestions = favoritedQuestionIds.filter((question) =>
      regexPattern.test(question.nome)
    );

    res.json(filteredQuestions); // retorna um json de sucesso
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});
module.exports = router;
