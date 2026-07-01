const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🧠 base de datos en memoria (después será real)
let transactions = [];

// 💸 agregar movimiento
app.post("/transaction", (req, res) => {
  const { type, amount, category, description } = req.body;

  const newTx = {
    id: Date.now(),
    type, // expense | income
    amount: Number(amount),
    category,
    description,
    date: new Date()
  };

  transactions.push(newTx);

  res.json({ ok: true, transaction: newTx });
});

// 📊 obtener movimientos
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// 💰 resumen general
app.get("/summary", (req, res) => {
  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    income,
    expense,
    balance: income - expense
  });
});

app.listen(3001, () => {
  console.log("🚀 API corriendo en http://localhost:3001");
});