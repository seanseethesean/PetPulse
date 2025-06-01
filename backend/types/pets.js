import * as yup from "yup"

export const createPetSchema = yup.object().shape({
  name: yup.string().required("Pet name is required"),
  breed: yup.string().required("Pet breed is required"),
  birthday: yup.string().optional(),
  animalType: yup.string().required("Animal type is required")
})