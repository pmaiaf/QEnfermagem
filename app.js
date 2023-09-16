const express = require('express')
var path = require('path');
var bodyParser = require('body-parser');
var cors = require('cors');
const QuestionsRouter = require('./routes/Questions')
const AuthRouter = require('./routes/Auth')
const NotificacaoRouter = require('./routes/Notificacao')
const ComentsRouter = require('./routes/Coments')
const EspecificacoesRouter = require('./routes/Especificacoes')
const UsersRouter = require('./routes/User')
const GrupoRouter = require("./routes/Grupo")
const MapaRouter = require("./routes/Mapa")
const PastaRouter = require("./routes/Pasta")
const CadernoRouter = require("./routes/Caderno")
const GuiasRouter= require("./routes/Guias")
const app = express()
const mongoose = require('mongoose')
const ConnectApiRouter = require("./routes/API/connectApi")
const SimuladosRouter = require("./routes/Simulado")

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Configurar rota para servir fotos estáticas
app.use('/uploads/users', express.static(path.join(__dirname, 'uploads', 'users')));

// ... Outras configurações e rotas ...



/// Configurar as opções de CORS
const corsOptions = {
  origin: '*', // Ou especifique o domínio permitido aqui
  methods: 'GET, POST, PUT, DELETE',
  allowedHeaders: 'Content-Type, Authorization, Access-Control-Allow-Origin', // Adicione 'Access-Control-Allow-Origin' aos cabeçalhos permitidos
};

// Aplicar o middleware de CORS
app.use(cors(corsOptions));

  

mongoose.connect(
    `mongodb+srv://user:pass@cluster0.ulvafzb.mongodb.net/Oconcursos?retryWrites=true&w=majority`
     ).then(() => {
       console.log("Conectado")
     })

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true 
}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',AuthRouter, QuestionsRouter, EspecificacoesRouter,UsersRouter,ComentsRouter, NotificacaoRouter,GrupoRouter,MapaRouter, PastaRouter, CadernoRouter, GuiasRouter, ConnectApiRouter, SimuladosRouter )

app.listen(3000, () =>{
    console.log("Rodando")
})

