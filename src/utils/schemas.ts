import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

export const CustomerSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .required("Phone is required"),
  address: Yup.string().optional(),
});

export const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  base_price: Yup.number().positive("Must be positive").required("Required"),
  variants: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Variant name is required"),
        price: Yup.number().positive("Must be positive").required("Required"),
      })
    )
    .optional(),
});
