import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"
import { BrowserRouter } from "react-router-dom"
import Login from "./Login"

// Mock navigate
const mockNavigate = jest.fn()
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate
}))

// Mock authService
const mockSignup = jest.fn(() => Promise.resolve())
const mockLogin = jest.fn(() => Promise.resolve())
const mockVerifyGoogleToken = jest.fn(() => Promise.resolve())
jest.mock("../utils/auth.js", () => ({
  signup: (...args) => mockSignup(...args),
  login: (...args) => mockLogin(...args),
  verifyGoogleToken: (...args) => mockVerifyGoogleToken(...args)
}))

// Mock Firebase Auth
const mockSignInWithPopup = jest.fn()
jest.mock("firebase/auth", () => {
  const actual = jest.requireActual("firebase/auth")
  return {
    ...actual,
    getAuth: jest.fn(() => ({})),
    GoogleAuthProvider: jest.fn(),
    signInWithPopup: (...args) => mockSignInWithPopup(...args)
  }
})

import authService from "../utils/auth"
import { signInWithPopup } from "firebase/auth"

describe("Login Page", () => {
  const renderLogin = () =>
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders email and password fields", () => {
    renderLogin()
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
  })

  test("renders submit and Google buttons", () => {
    renderLogin()
    expect(screen.getByText("Submit")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /sign up with google/i })
    ).toBeInTheDocument()
  })

  test("shows error when email/password login fails", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"))

    renderLogin()
    fireEvent.click(screen.getAllByText("Login").pop())
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "bad@example.com" }
    })
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" }
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })

  test("navigates to forgot-password page when clicked", () => {
    renderLogin()
    fireEvent.click(screen.getAllByText("Login").pop())
    fireEvent.click(screen.getByText("Click Here!"))
    expect(mockNavigate).toHaveBeenCalledWith("/forgot-password")
  })

  test("calls authService.signup and navigates on success", async () => {
    renderLogin()

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "signup@example.com" }
    })
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "signup123" }
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith("signup@example.com", "signup123")
      expect(mockNavigate).toHaveBeenCalledWith("/petmgm")
    })
  })

  test("calls authService.login and navigates on success", async () => {
    renderLogin()
    fireEvent.click(screen.getAllByText("Login").pop())

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "login@example.com" }
    })
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "login123" }
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("login@example.com", "login123")
      expect(mockNavigate).toHaveBeenCalledWith("/petmgm")
    })
  })

  test("shows error on failed Google sign-in", async () => {
    mockSignInWithPopup.mockRejectedValueOnce(new Error("Google error"))

    renderLogin()
    fireEvent.click(
      screen.getByRole("button", { name: /sign up with google/i })
    )

    await waitFor(() => {
      expect(screen.getByText(/Google error/i)).toBeInTheDocument()
    })
  })

  test("calls verifyGoogleToken and navigates on successful Google sign-in", async () => {
    const fakeUser = { getIdToken: jest.fn(() => Promise.resolve("abc.token")) }
    mockSignInWithPopup.mockResolvedValueOnce({ user: fakeUser })

    renderLogin()
    fireEvent.click(
      screen.getByRole("button", { name: /sign up with google/i })
    )

    await waitFor(() => {
      expect(mockVerifyGoogleToken).toHaveBeenCalledWith("abc.token")
      expect(mockNavigate).toHaveBeenCalledWith("/petmgm")
    })
  })

  test("prevents submission with empty email/password", async () => {
    renderLogin()
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(mockSignup).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  test("clears error between attempts", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Wrong password"))
    renderLogin()

    // Switch to login mode
    fireEvent.click(screen.getAllByText("Login").pop())

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" }
    })
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" }
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(screen.getByText("Wrong password")).toBeInTheDocument()
    })

    // Try again with valid password
    mockLogin.mockResolvedValueOnce()
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "correctpass" }
    })
    fireEvent.click(screen.getByText("Submit"))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "correctpass")
      expect(mockNavigate).toHaveBeenCalledWith("/petmgm")
    })
  })
})