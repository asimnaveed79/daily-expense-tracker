import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";

const categories = [
  "Savings", "Pakistan", "Others", "Misc.", "Food", "Grocery", "Taxi & Transport", "Car lease",
  "House rent", "Toll & Parking", "Utilities & Housing", "General Shopping", "Online shopping",
  "Fuel", "Travel & Entertainment", "Credit Card Repayment"
];

const paymentMethods = [
  "ENBD Direct Debit", "ENBD Credit Card", "ADCB Credit Card", "ADCB Debit Card", "FAB Credit Card"
];

const CREDIT_CARD_LIMITS = {
  "ENBD Credit Card": 114900,
  "ADCB Credit Card": 38333,
  "FAB Credit Card": 7500,
};

export default function DailyExpensesTracker() {
  const [expenses, setExpenses] = useState([]);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
    });
    return () => unsubscribe();
  }, []);

  const creditCardBalances = {
    "ENBD Credit Card": -expenses
      .filter(exp => exp.paymentMethod === "ENBD Credit Card")
      .reduce((sum, exp) => sum + exp.amount, 0)
      + expenses.filter(exp => exp.category === "Credit Card Repayment" && exp.item === "ENBD Credit Card")
               .reduce((sum, exp) => sum + exp.amount, 0),

    "ADCB Credit Card": -expenses
      .filter(exp => exp.paymentMethod === "ADCB Credit Card")
      .reduce((sum, exp) => sum + exp.amount, 0)
      + expenses.filter(exp => exp.category === "Credit Card Repayment" && exp.item === "ADCB Credit Card")
               .reduce((sum, exp) => sum + exp.amount, 0),

    "FAB Credit Card": -expenses
      .filter(exp => exp.paymentMethod === "FAB Credit Card")
      .reduce((sum, exp) => sum + exp.amount, 0)
      + expenses.filter(exp => exp.category === "Credit Card Repayment" && exp.item === "FAB Credit Card")
               .reduce((sum, exp) => sum + exp.amount, 0),
  };

  useEffect(() => {
    const newAlerts = [];
    Object.entries(creditCardBalances).forEach(([card, balance]) => {
      const limit = CREDIT_CARD_LIMITS[card];
      if (limit !== undefined && -balance > limit) {
        newAlerts.push(`${card} has exceeded the limit of ${limit.toLocaleString()} AED.`);
      }
    });
    setAlerts(newAlerts);
  }, [expenses]);

  const addExpense = async () => {
    if (!item || !amount || isNaN(amount) || !category || (!paymentMethod && category !== "Credit Card Repayment")) return;

    const newExpense = {
      item,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      date: Timestamp.now()
    };

    try {
      await addDoc(collection(db, "expenses"), newExpense);
      console.log("✅ Expense successfully saved to Firebase.");
    } catch (error) {
      console.error("❌ Firebase write error:", error.message);
    }

    setItem("");
    setAmount("");
    setCategory("");
    setPaymentMethod("");
  };

  const filteredExpenses = expenses.filter(exp => {
    return (
      (!filterCategory || exp.category === filterCategory) &&
      (!filterPayment || exp.paymentMethod === filterPayment)
    );
  });

  const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daily Expense Tracker</h1>
      <div className="mb-4 border rounded p-4 space-y-2">
        <div>
          <label className="block font-semibold mb-1">Item</label>
          <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Coffee or ENBD Credit Card (for repayment)" className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Amount (AED)</label>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 12.5" type="number" className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">Select a category</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {category !== "Credit Card Repayment" && (
          <div>
            <label className="block font-semibold mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="">Select a payment method</option>
              {paymentMethods.map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>
          </div>
        )}
        <button onClick={addExpense} className="w-full bg-blue-600 text-white py-2 rounded">Add Expense</button>
      </div>

      <div className="mb-4 border rounded p-4 space-y-2">
        <h2 className="text-xl font-semibold">Filter Expenses</h2>
        <div>
          <label className="block font-semibold mb-1">Filter by Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Filter by Payment Method</label>
          <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="">All Payment Methods</option>
            {paymentMethods.map((method, index) => (
              <option key={index} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded p-4 space-y-2">
        <h2 className="text-xl font-semibold">Filtered Expenses</h2>
        <ul className="space-y-1">
          {filteredExpenses.map((exp, index) => (
            <li key={index} className="flex justify-between border-b pb-1">
              <div>
                <span className="font-semibold">{exp.item}</span> ({exp.category}, {exp.paymentMethod || "-"}, {new Date(exp.date.seconds * 1000).toLocaleDateString()})
              </div>
              <span>{exp.amount.toFixed(2)} AED</span>
            </li>
          ))}
        </ul>
        <div className="font-bold text-right">Total: {total} AED</div>
      </div>

      <div className="mt-4 border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Credit Card Balances</h2>
        <ul className="space-y-1">
          <li>ENBD Credit Card: {creditCardBalances["ENBD Credit Card"].toFixed(2)} AED</li>
          <li>ADCB Credit Card: {creditCardBalances["ADCB Credit Card"].toFixed(2)} AED</li>
          <li>FAB Credit Card: {creditCardBalances["FAB Credit Card"].toFixed(2)} AED</li>
        </ul>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 bg-red-100 border border-red-400 p-4 rounded">
          <h2 className="text-xl font-semibold text-red-700">Alerts</h2>
          <ul className="list-disc list-inside text-red-700">
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
