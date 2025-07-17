import * as yup from "yup";

// Schema to validate incoming request to /api/nearby-services
export const nearbySearchSchema = yup.object().shape({
  lat: yup
    .number()
    .required("Latitude is required")
    .typeError("Latitude must be a number"),
  lon: yup
    .number()
    .required("Longitude is required")
    .typeError("Longitude must be a number"),
});

// Middleware to validate request using yup
export async function validateNearbyRequest(req, res, next) {
  try {
    await nearbySearchSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (err) {
    const errors = err.inner?.map(e => e.message) || [err.message];
    res.status(400).json({ success: false, error: "Invalid request", details: errors });
  }
}