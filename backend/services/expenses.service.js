import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.js";

jest.mock("../firebase");

// Fetch expenses for a user (optionally filtered by petId)
export const getExpenses = async (userId, petId) => {
  const expensesRef = collection(db, "expenses");
  let q;

  if (petId && petId !== "all") {
    q = query(
      expensesRef,
      where("userId", "==", userId),
      where("petId", "==", petId),
      orderBy("date", "desc")
    );
  } else {
    q = query(
      expensesRef,
      where("userId", "==", userId),
      orderBy("date", "desc")
    );
  }

  const querySnapshot = await getDocs(q);
  const expenses = [];
  querySnapshot.forEach((docSnap) => {
    expenses.push({ id: docSnap.id, ...docSnap.data() });
  });

  return expenses;
};

// Create a new expense
export const createExpense = async (expenseData) => {
  const data = {
    ...expenseData,
    amount: parseFloat(expenseData.amount)
  };

  const docRef = await addDoc(collection(db, "expenses"), data);
  return {
    id: docRef.id,
    ...data
  };
};

// Update an existing expense
export const updateExpense = async (id, updateData) => {
  if (updateData.amount !== undefined) {
    updateData.amount = parseFloat(updateData.amount);
  }

  const expenseRef = doc(db, "expenses", id);
  await updateDoc(expenseRef, updateData);

  return {
    id,
    ...updateData
  };
};

// Delete an expense
export const deleteExpense = async (id) => {
  const expenseRef = doc(db, "expenses", id);
  await deleteDoc(expenseRef);
};