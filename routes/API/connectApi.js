const express = require("express");
const mercadopago = require("mercadopago");
const User = require("../../Models/User");
require("dotenv").config();
const moment = require("moment");
const nodemailer = require("nodemailer");
const cardValidator = require("card-validator");

const router = express.Router();

// Configurar as credenciais do Mercado Pago
mercadopago.configure({
  access_token:'APP_USR-c31370e2-6ac7-4307-9d74-a76c5cc8d769',
  public_key: 'APP_USR-4690764933156012-051915-3225a7ac64311fb32bd383044a795e76-274690410',
});

// Rota para criar o card token
router.post("/create_card_token", (req, res) => {
  async function enviarEmailConfirmacaoPagamento(emailUsuario) {
    try {
      // Crie um transporte de e-mail

      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 465, // Porta do servidor SMTP
        secure: true, // Usar SSL/TLS,
        secureConnection: true,
        auth: {
          user: "pedroooo1227@gmail.com",
          pass: "errmvxgfzwgbkrul",
        },
        tls: {
          rejectUnAuthorized: true,
        },
      });

      // Crie um objeto com as informações do e-mail
      const emailOptions = {
        from: "christianvilaca@hotmail.com",
        to: emailUsuario,
        subject: "Confirmação de pagamento",
        html: `
          <h1 style="color: #007BFF;">Confirmação de pagamento</h1>
          <p style="font-size: 16px;">Seu pagamento foi confirmado com sucesso!</p>
          <p style="font-size: 16px;">Clique no botão abaixo para acessar a plataforma:</p>
          <a href="https://qenfermagem.com.br" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #FFF; font-size: 18px; text-decoration: none; border-radius: 5px;">Acessar plataforma</a>
          <p style="font-size: 14px; color: #777;">Caso o botão não funcione, você pode copiar e colar o seguinte link no seu navegador:</p>
          <p style="font-size: 14px; color: #777;">https://qenfermagem.com.br</p>
        `,
      };

      // Envie o e-mail
      const info = await transporter.sendMail(emailOptions);
    } catch (error) {
      console.error("Erro ao enviar o e-mail:", error);
    }
  }
  // Valide os dados do cartão

  const cardNumber = req.body.cardNumber.replace(/\s/g, "");

  const expirationMonth = parseInt(req.body.expirationMonth);
  const expirationYear = parseInt(req.body.expirationYear);
  const cvv = req.body.cvv;

  const cardValidation = cardValidator.number(cardNumber);
  const cvvValidation = cardValidator.cvv(cvv);

  if (cardValidation.isValid && cvvValidation.isValid) {
    const cardTokenPayload = {
      card_number: cardNumber,
      cardholder: {
        name: req.body.cardholderName,
        identification: {
          number: req.body.identificationNumber,
        },
      },
      expiration_month: parseInt(expirationMonth),
      expiration_year: parseInt(expirationYear),
      security_code: req.body.cvv,
    };
    mercadopago.card_token.create(cardTokenPayload).then((response) => {
      const cardTokenId = response.body.id;

      // Aqui você pode prosseguir com a lógica de processamento do pagamento
      // Utilize o cardTokenId para realizar o pagamento ou iniciar uma assinatura

      const paymentPayload = {
        transaction_amount: req.body.plano === "padrao" ? 9.9 : 12.9,
        token: cardTokenId,
        description:
          req.body.plano === "padrao" ? "Plano padrão" : "Plano ilimitado",
        installments: 1,

        payment_method_id: req.body.paymentMethodId,
        payer: {
          email: req.body.cardholderEmail,
        },
      };

      mercadopago.payment
        .create(paymentPayload)

        .then((paymentResponse) => {
          const paymentStatus = paymentResponse.body.status;

          // Aqui você pode tratar a resposta do pagamento e tomar as ações necessárias
          if (paymentStatus === "approved") {
            enviarEmailConfirmacaoPagamento(req.body.cardholderEmail);

            console.log(cardTokenId);
            res.json({
              plano: req.body.plano,
              cardtoken: cardTokenId,
              status: paymentStatus,
            });
          } else {
            // Pagamento não aprovado
            // Trate os casos de pagamento pendente, rejeitado, etc.
            res.json("fail");
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ error: error });
        });
    });
  } else {
    res.json("invalid");
  }
});

// Rota para criar uma assinatura
router.post("/api/criar-assinatura", async (req, res) => {
  const emailUsuario = req.body.emailusuario;
  const plano = req.body.plano;
  const status = req.body.status;
  const card_token_id = req.body.card_token_id;
  const backUrlSuccess = ``;
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);
  
  function formatDate(date) {
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    const day = date.slice(8, 10);
    const time = date.slice(11, 23);
    return `${year}-${month}-${day}T${time}`;
  }

  if (status == "approved") {
    try {
      if (plano === "padrao" || plano === "ilimitado") {
        const assinatura = await mercadopago.preapproval.create({
          preapproval_plan_id:
            plano === "padrao"
              ? "2c938084882d8f91018835967f410241"
              : "2c938084882d8f9101883597103f0242",
          payer_email: emailUsuario,
          external_reference:
            plano === "padrao" ? "Plano Padrao" : "Plano Ilimitado",
          reason:
            plano === "padrao"
              ? "Assinatura do Plano Padrão"
              : "Assinatura do Plano Ilimitado",
          card_token_id: card_token_id,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            start_date:formattedStartDate,
            end_date: formattedEndDate,
            transaction_amount: plano === "padrao" ? 9.9 : 12.9,
            currency_id: "BRL",
          },
          back_url: backUrlSuccess,
          status: "authorized",
        });

        try {
          await User.updateOne(
            { _id: idUsuario },
            {
              $set: {
                plano: plano,
                start_date: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
                end_date: moment()
                  .add(1, "month")
                  .format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
              },
            }
          );
          res.json({ assinaturaId: assinatura.body.id });
        } catch (error) {
          res
            .status(500)
            .json({ error: "Erro ao atualizar os dados do usuário" });
        }
      } else {
        res.json();
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao criar a assinatura" });
    }
  } else {
    res.json("error");
  }
});

// Rota para receber notificações de webhooks
router.post("/webhooks/mp", async (req, res) => {
  const subscriptionId = req.body.id;
  const status = req.body.status;
  const subscription = await mercadopago.subscriptions.get(subscriptionId);

  // Extrair as informações necessárias
  const email = subscription.payer.email;
  const plano = subscription.plan_id;

  // Aqui você pode processar a notificação e atualizar a plataforma com base no status da assinatura

  // Exemplo de atualização na plataforma
  if (status === "cancelled") {
    await User.updateOne(
      { email: email },
      {
        $set: {
          plano: "gratis",
          start_date: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          end_date: moment().add(1, "year").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        },
      }
    );
  } else if (status === "paused") {
    await User.updateOne(
      { email: email },
      {
        $set: {
          plano: gratis,
          start_date: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          end_date: moment().add(1, "year").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        },
      }
    );
  } else if (status === "active") {
    await User.updateOne(
      { email: email },
      {
        $set: {
          plano: plano,
          start_date: moment().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
          end_date: moment().add(1, "year").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        },
      }
    );
  }

  res.sendStatus(200);
});

module.exports = router;
