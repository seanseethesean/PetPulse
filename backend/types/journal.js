import * as yup from "yup"

export const createPetSchema = yup.object().shape({
  Date: yup.string().required("Date is required"),
  Title: yup.string().required("Title is required"),
  Mood: yup.string().optional(),
  Activities: yup.string().optional(),
  Content: yup.string().optional()
}) 
