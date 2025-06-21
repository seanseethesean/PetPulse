import * as yup from "yup"

// Valid journal categories
const validCategories = [
    'Date',
    'Title', 
    'Mood',
    'Activities',
    'Content'
  ];

  export const createJournalSchema = yup.object().shape({
    title: yup.string().required("Title is required"),
    content: yup.string().optional(),
    mood: yup.string().required("Mood is required"),
    activities: yup.array().of(yup.string()).optional(),
    date: yup.string().required("Date is required"),
    petName: yup.string().required("Pet name is required"),
    userId: yup.string().required("User ID is required"),
    createdAt: yup.string().optional()
  })
  
  export const updateJournalSchema = yup.object().shape({
    title: yup.string().optional(),
    content: yup.string().optional(),
    mood: yup.string().optional(),
    activities: yup.array().of(yup.string()).optional(),
    date: yup.string().optional(),
    petName: yup.string().optional(),
    userId: yup.string().optional(),
    updatedAt: yup.string().optional()
  });