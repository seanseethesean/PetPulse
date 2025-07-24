import React from "react";
import { render, screen } from "@testing-library/react";
import { LoadingProvider, useLoading, LoadingContext } from "./LoadingContext";
import userEvent from "@testing-library/user-event";

const TestComponent = () => {
  const { loading, setLoading } = useLoading();

  return (
    <div>
      <div data-testid="loading">{loading ? "true" : "false"}</div>
      <button onClick={() => setLoading(true)}>Start Loading</button>
    </div>
  );
};

describe("LoadingContext", () => {
  it("provides default value false for loading", () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("allows setting loading to true", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );
    userEvent.click(screen.getByText("Start Loading"));
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("renders LoadingProvider with a context consumer", () => {
    render(
      <LoadingProvider>
        <React.Fragment>
          <LoadingContext.Consumer>
            {({ loading }) => (
              <div data-testid="direct">{String(loading)}</div>
            )}
          </LoadingContext.Consumer>
        </React.Fragment>
      </LoadingProvider>
    );
    expect(screen.getByTestId("direct").textContent).toBe("false");
  });

  it("throws if useLoading is used outside provider", () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {}); // suppress expected error

    const BrokenComponent = () => {
      const { loading } = useLoading(); // this will throw
      return <div>{String(loading)}</div>;
    };

    expect(() => render(<BrokenComponent />)).toThrow();

    consoleError.mockRestore();
  });
});