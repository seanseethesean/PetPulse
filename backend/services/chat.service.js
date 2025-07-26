import { db } from "../firebase.js";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy
} from "firebase/firestore";

jest.mock("../firebase");

export const getMessages = async (chatId) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const q = query(messagesRef, orderBy("timestamp"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const sendMessage = async (chatId, message) => {
  const msgRef = doc(collection(db, `chats/${chatId}/messages`));
  await setDoc(msgRef, message);
  return msgRef.id;
};