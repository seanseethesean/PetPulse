import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ForgotPassword from "./ForgotPassword";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { sendPasswordResetEmail } from "firebase/auth";

// Mock firebase
jest.mock("firebase/auth", () => ({
  sendPasswordResetEmail: jest.fn()
}));

// Mock firebase config
jest.mock("../firebase/firebase.js", () => ({
  auth: {}
}));

// Wrap component in router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("ForgotPassword Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the reset password form", () => {
    renderWithRouter(<ForgotPassword />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
  });

  it("shows error if email is empty on submit", async () => {
    renderWithRouter(<ForgotPassword />);
    fireEvent.click(screen.getByText(/send reset email/i));
    expect(await screen.findByText(/please enter your email address/i)).toBeInTheDocument();
  });

  it("shows success message on successful reset", async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();
    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "test@example.com" }
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() =>
      expect(
        screen.getByText(/password reset email sent!/i)
      ).toBeInTheDocument()
    );
  });

  it("shows user-not-found error", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce({ code: "auth/user-not-found" });
    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "notfound@example.com" }
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() =>
      expect(screen.getByText(/no account found/i)).toBeInTheDocument()
    );
  });

  it("shows invalid-email error", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce({ code: "auth/invalid-email" });
    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "invalidemail" }
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() =>
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    );
  });

  it("shows network error message", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce({ code: "auth/network-request-failed" });
    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "net@example.com" }
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() =>
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    );
  });

  it("shows generic error for unknown failures", async () => {
    sendPasswordResetEmail.mockRejectedValueOnce({ code: "auth/something-weird" });
    renderWithRouter(<ForgotPassword />);
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: "other@example.com" }
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() =>
      expect(screen.getByText(/failed to send reset email/i)).toBeInTheDocument()
    );
  });
});