import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";

// Get tasks by date and user
export const getTasks = async (date, userId) => {
  const tasksRef = collection(db, "tasks");
  const q = query(
    tasksRef,
    where("date", "==", date),
    where("userId", "==", userId),
    orderBy("time", "asc")
  );

  const snapshot = await getDocs(q);
  const tasks = [];
  snapshot.forEach((docSnap) => {
    tasks.push({ id: docSnap.id, ...docSnap.data() });
  });

  return tasks;
};

// Create a new task
export const createTask = async (taskData) => {
  const data = {
    ...taskData,
    completed: taskData.completed || false
  };

  const docRef = await addDoc(collection(db, "tasks"), data);
  return {
    id: docRef.id,
    ...data
  };
};

// Update an existing task
export const updateTask = async (id, updateData) => {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, updateData);

  return {
    id,
    ...updateData
  };
};

// Delete a task
export const deleteTask = async (id) => {
  const taskRef = doc(db, "tasks", id);
  await deleteDoc(taskRef);
};

// Toggle completion status
export const toggleTaskCompletion = async (id, completed) => {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, { completed });

  return {
    id,
    completed
  };
};  