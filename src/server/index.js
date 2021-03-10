const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

let pl = require("./modules/core");
require("./modules/os")(pl);
require("./modules/lists")(pl);

const app = express();
const session = pl.create();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const answer_obj = function (answer) {
  if (pl.type.is_error(answer)) throw answer.args[0].toString();
  else if (answer === false || answer === null) return answer;
  else {
    const out = {};
    if (pl.type.is_substitution(answer)) {
      const dom = answer.domain(true);
      answer = answer.filter(function (id, value) {
        return (
          !pl.type.is_variable(value) ||
          (pl.type.is_variable(value) && answer.has_attributes(id)) ||
          (dom.indexOf(value.id) !== -1 && id !== value.id)
        );
      });
    }
    for (let link in answer.links) {
      if (
        answer.links.hasOwnProperty(link) &&
        !(
          pl.type.is_variable(answer.links[link]) &&
          link === answer.links[link].id
        )
      )
        out[link.toString()] = answer.links[link].toJavaScript();
    }
    return out;
  }
};

app.post("/login", async (req, res, next) => {
  const { body } = req;
  const { username, password } = body.user;

  session.consult(path.join(__dirname, "./prolog/database/users.pl"), {
    success: () => {
      session.query(`user(${username},'${password}',UNAME).`, {
        success: () => {
          session.answer({
            success: (answer) => {
              const result = answer_obj(answer);
              if (!!result && result.UNAME) {
                res.send({ user: { username, name: result.UNAME } });
              }
            },
            fail: () => {
              res.status(404);
              res.send({});
            },
          });
        },
      });
    },
  });
});

app.get("/banks", async (req, res) => {
  let banks = [];
  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query("bank(BANKID,NAME,TEXT,_), getmincredit(BANKID,RATE).", {
        success: () => {
          session.answers(
            (element) => {
              const result = answer_obj(element);
              if (!!result && result.BANKID) {
                banks = [
                  ...banks,
                  {
                    id: result.BANKID,
                    rate: result.RATE,
                    text: result.TEXT,
                    name: result.NAME,
                  },
                ];
              }
            },
            () => res.send({ banks })
          );
        },
      });
    },
  });
});

app.get("/banks/credits", async (req, res) => {
  const { query } = req;
  let credits = [];
  let bankColor = "";
  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `bank(${query.bank},_,_,BANKCOLOR),credit(${query.bank},CREDITRATE,CREDITYEAR, CREDITAMOUNT, CREDITID).`,
        {
          success: () => {
            session.answers(
              (element) => {
                const result = answer_obj(element);
                if (!!result && result.CREDITRATE) {
                  bankColor = result.BANKCOLOR;
                  credits = [
                    ...credits,
                    {
                      id: query.bank,
                      creditId: result.CREDITID,
                      rate: result.CREDITRATE,
                      year: result.CREDITYEAR,
                      amount: result.CREDITAMOUNT,
                    },
                  ];
                }
              },
              () => res.send({ credits, bankColor })
            );
          },
        }
      );
    },
  });
});

app.get("/calc", async (req, res) => {
  const { query } = req;
  const { amount, rate, month } = query;

  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `getmonthamount(${amount}, ${rate}, ${month}, MONTHAMOUNT, CREDITPROCENTAMOUNT).`,
        {
          success: () => {
            session.answer({
              success: (answer) => {
                console.log("@", answer);
                const result = answer_obj(answer);
                if (!!result && result.MONTHAMOUNT) {
                  res.send({
                    monthamount: result.MONTHAMOUNT,
                    credit: result.CREDITPROCENTAMOUNT,
                  });
                }
              },
              fail: () => {
                res.status(404);
                res.send({});
              },
            });
          },
        }
      );
    },
  });
});

app.get("/creditList", async (req, res) => {
  const { query } = req;
  const { id, amount, month } = query;
  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `getOrderAmountList(${id},${amount},${month},ALTERNATIVE).`,
        {
          success: () => {
            session.answer({
              success: (answer) => {
                const result = answer_obj(answer);
                if (!!result && result.ALTERNATIVE) {
                  res.send({ alternative: result.ALTERNATIVE });
                }
              },
              error: function (err) {
                res.send({ err: err.args });
              },
              fail: () => {
                res.status(404);
                res.send({});
              },
            });
          },
          error: (err) => {
            console.log("@@@@", err);
          },
        }
      );
    },
  });
});

app.post("/takeCredit", async (req, res, next) => {
  const { body } = req;
  const {
    username,
    creditId,
    fullCreditAmount,
    monthAmount,
    months,
    date,
  } = body;

  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `creditTake(${username},${creditId},${fullCreditAmount},${monthAmount},${months},'${date}').`,
        {
          success: () => {
            session.answer({
              success: (answer) => {
                res.send({ answer });
              },
              error: function (err) {
                res.send({ err: err.args });
              },
              fail: () => {
                res.status(404);
                res.send({});
              },
            });
          },
          error: (err) => {
            console.log("@@@@", err);
          },
        }
      );
    },
  });
});

app.get("/getCredits", async (req, res, next) => {
  const { query } = req;
  const { username } = query;
  let credits = [];
  let length = 0;

  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `history(${username},CREDIT_ID,FULL_AMOUNT,MONTH_AMOUNT,MONTHS_,CREDIT_DATE,INDEX_HISTORY).`,
        {
          success: () => {
            session.answers(
              (element) => {
                const result = answer_obj(element);
                if (result.CREDIT_ID) {
                  length = result.HISTORY_LENGHT;
                  credits = [...credits, result];
                }
              },
              () => res.send({ credits, length })
            );
          },
        }
      );
    },
    error: (err) => res.send({ err }),
  });
});

app.get("/getHistoryLenght", async (req, res, next) => {
  const { query } = req;
  const { username } = query;

  session.consult(path.join(__dirname, "./prolog/database/banks.pl"), {
    success: () => {
      session.query(
        `getHistoryLenght(${username},HISTORY_LENGHT).`,
        {
          success: () => {
            session.answer({
              success: (answer) => {
                const result = answer_obj(answer);
                if (!!result && result.HISTORY_LENGHT) {
                  res.send({ historyLenght: result.HISTORY_LENGHT });
                }
              },
              error: function (err) {
                res.send({ err: err.args });
              },
              fail: () => {
                res.status(404);
                res.send({});
              },
            });
          }
        }
      );
    },
  });
});

app.listen(2000);
