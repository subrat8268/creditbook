import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password too short")
    .required("Password is required"),
});

export const SignUpSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, "Name is too short")
    .required("Full name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

export const CustomerSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, "Invalid phone number")
    .required("Phone is required"),
  address: Yup.string().optional(),
  openingBalance: Yup.number()
    .min(0, "Opening balance cannot be negative")
    .optional(),
});

export const ProductSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  base_price: Yup.number().positive("Must be positive").required("Required"),
  variants: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required("Variant name is required"),
        price: Yup.number().positive("Must be positive").required("Required"),
      }),
    )
    .optional(),
});

export const SupplierSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Name too short")
    .required("Supplier name is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit number")
    .optional(),
  address: Yup.string().optional(),
  basket_mark: Yup.string().optional(),
  bank_name: Yup.string().optional(),
  account_number: Yup.string().optional(),
  ifsc_code: Yup.string().optional(),
  upi: Yup.string().optional(),
});
