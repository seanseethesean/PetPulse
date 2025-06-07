import express from "express";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { createPetSchema } from "../types/pets.js";
import { validateRequestData } from "../request-validation.js";

const router=  express.Router();
