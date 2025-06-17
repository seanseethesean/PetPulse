import * as yup from "yup";

// Valid expense categories
const validCategories = [
  'Food',
  'Grooming', 
  'Vet',
  'Medicine',
  'Training',
  'Toys',
  'Accessories',
  'Others'
];

export const createExpenseSchema = yup.object().shape({
  description: yup.string().required("Description is required").trim(),
  amount: yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .test('decimal-places', 'Amount can have at most 2 decimal places', 
      value => value === undefined || Number(value.toFixed(2)) === value),
  category: yup.string()
    .required("Category is required")
    .oneOf(validCategories, `Category must be one of: ${validCategories.join(', ')}`),
  date: yup.string()
    .required("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  petId: yup.string().required("Pet ID is required"),
  petName: yup.string().required("Pet name is required"),
  userId: yup.string().required("User ID is required"),
  notes: yup.string().optional().trim()
});

export const updateExpenseSchema = yup.object().shape({
  description: yup.string().optional().trim(),
  amount: yup.number()
    .optional()
    .positive("Amount must be positive")
    .test('decimal-places', 'Amount can have at most 2 decimal places', 
      value => value === undefined || Number(value.toFixed(2)) === value),
  category: yup.string()
    .optional()
    .oneOf(validCategories, `Category must be one of: ${validCategories.join(', ')}`),
  date: yup.string()
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  petId: yup.string().optional(),
  petName: yup.string().optional(),
  userId: yup.string().optional(),
  notes: yup.string().optional().trim()
});