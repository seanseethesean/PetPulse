import * as yup from "yup"

export async function validateRequestData(
  data,
  schema
) {
  try {
    const validData = await schema.validate(data, { abortEarly: false })
    return validData
  } catch (error) {
    console.error("Validation error:", error)
    throw new Error(
      error
    )
  }
}