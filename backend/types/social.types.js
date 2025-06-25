import * as yup from "yup";


export const createForumPostSchema = yup.object().shape({
 userId: yup.string().required("User ID is required"),
 title: yup.string().required("Post title is required"),
 category: yup.string().default("general"),
 content: yup.string().required("Post content is required"),
 createdAt: yup.string().optional()
});

