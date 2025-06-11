import * as yup from "yup";

export const createTaskSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  type: yup.string().required("Type is required"),
  petId: yup.string().required("Pet ID is required"),
  time: yup.string().optional(),
  date: yup.string().required("Date is required"),
  userId: yup.string().required("User ID is required"),
  notes: yup.string().optional(),
  recurring: yup.string().optional(),
  completed: yup.boolean().optional(),
  isRecurring: yup.boolean().optional(),
  recurringType: yup.string().optional()
});

export const updateTaskSchema = yup.object().shape({
  title: yup.string().optional(),
  type: yup.string().optional(),
  time: yup.string().optional(),
  notes: yup.string().optional(),
  recurring: yup.string().optional(),
  completed: yup.boolean().optional(),
  date: yup.string().optional(),
  petId: yup.string().optional(),
  userId: yup.string().optional(),
  isRecurring: yup.boolean().optional(),
  recurringType: yup.string().optional()
});