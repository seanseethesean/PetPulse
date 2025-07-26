import { io } from "socket.io-client"

import { getSocket } from "./socket"

jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }))
}))

describe("getSocket", () => {
  const originalEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.resetModules() // clear module cache (resets singleton + env)
    process.env.NODE_ENV = originalEnv
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  test("returns dummy socket in test mode", () => {
    process.env.NODE_ENV = "test"

    // re-import after setting env
    const { getSocket } = require("./socket")
    const socket = getSocket()

    expect(socket).toHaveProperty("on")
    expect(socket).toHaveProperty("off")
    expect(socket).toHaveProperty("emit")
  })

  test("creates and caches real socket in non-test mode", () => {
    process.env.NODE_ENV = "development"

    const mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    }

    // mock io before importing socket module
    jest.mock("socket.io-client", () => ({
      io: jest.fn(() => mockSocket)
    }))

    const { io } = require("socket.io-client")
    const { getSocket } = require("./socket")

    const socket1 = getSocket()
    const socket2 = getSocket()

    expect(io).toHaveBeenCalledTimes(1) // called once
    expect(socket1).toBe(socket2) // same cached instance
  })
})