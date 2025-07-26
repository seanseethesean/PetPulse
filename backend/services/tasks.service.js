import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from "firebase/firestore";
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
export const createTask = async (task) => {
    const {
      title, type, petId, time, notes,
      userId, date, isRecurring, recurring
    } = task;
  
    const taskCollection = collection(db, "tasks");
  
    const generateRecurringDates = (startDate, recurringType) => {
      const dates = [];
      const current = new Date(startDate);
      const count = recurringType === "daily" ? 30
                  : recurringType === "weekly" ? 4
                  : recurringType === "monthly" ? 12
                  : 1;
  
      for (let i = 0; i < count; i++) {
        dates.push(new Date(current));
        if (recurringType === "daily") current.setDate(current.getDate() + 1);
        if (recurringType === "weekly") current.setDate(current.getDate() + 7);
        if (recurringType === "monthly") current.setMonth(current.getMonth() + 1);
      }
  
      return dates;
    };
  
    const startDate = new Date(date);
    const dates = isRecurring ? generateRecurringDates(startDate, recurring) : [startDate];
    const batch = writeBatch(db);
  
    for (const d of dates) {
      const docRef = doc(taskCollection); // auto-generates ID
      batch.set(docRef, {
        title,
        type,
        petId,
        time,
        notes,
        userId,
        completed: false,
        recurring,
        isRecurring,
        date: d.toISOString().split("T")[0]
      });
    }
  
    await batch.commit();
    return { success: true, message: "Tasks created in batch" };
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