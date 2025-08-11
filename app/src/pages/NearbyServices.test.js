import React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";
import NearbyServices from "./NearbyServices";
import NearbyService from "../utils/nearby";
import "@testing-library/jest-dom";

// Mock Navbar
jest.mock("../components/Navbar", () => () => <div data-testid="navbar">Navbar</div>);

// Mock Google Maps API
const mockPanTo = jest.fn();
const mockSetZoom = jest.fn();
const mockMapInstance = { panTo: mockPanTo, setZoom: mockSetZoom };

jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ onLoad, children }) => {
    onLoad(mockMapInstance);
    return <div data-testid="map">{children}</div>;
  },
  Marker: () => <div data-testid="marker" />,
  useJsApiLoader: () => ({ isLoaded: true }),
}));

// Mock NearbyService
jest.mock("../utils/nearby");

beforeAll(() => {
  // mock google.maps.Size
  global.window.google = {
    maps: {
      Size: function (width, height) {
        return { width, height };
      },
    },
  };
});

describe("NearbyServices", () => {
  const mockLocation = {
    coords: {
      latitude: 1.3521,
      longitude: 103.8198,
    },
  };

  beforeEach(() => {
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn((success) => success(mockLocation)),
    };

    NearbyService.getNearbyServices.mockResolvedValue([
      {
        displayName: { text: "PetVet Clinic" },
        formattedAddress: "123 Pet Street",
        type: "veterinary_care",
        location: { latitude: 1.353, longitude: 103.82 },
      },
      {
        displayName: { text: "PetMart" },
        formattedAddress: "456 Pet Ave",
        type: "store",
        location: { latitude: 1.354, longitude: 103.821 },
      },
    ]);
  });

  afterEach(() => jest.clearAllMocks());

  it("renders map and pet services after successful fetch", async () => {
    await act(async () => {
      render(<NearbyServices />);
    });

    expect(await screen.findByTestId("map")).toBeInTheDocument();
    expect(await screen.findByText("PetVet Clinic")).toBeInTheDocument();
    expect(screen.getByText("123 Pet Street")).toBeInTheDocument();
    expect(screen.getByText("Veterinary Care")).toBeInTheDocument();

    expect(screen.getByText("PetMart")).toBeInTheDocument();
    expect(screen.getByText("456 Pet Ave")).toBeInTheDocument();
    expect(screen.getByText("Pet Store")).toBeInTheDocument();
  });

  it("displays error message when location is denied", async () => {
    global.navigator.geolocation.getCurrentPosition = jest.fn((_, error) => error());

    await act(async () => {
      render(<NearbyServices />);
    });

    expect(
      await screen.findByText("Location permission denied. Try entering your address.")
    ).toBeInTheDocument();
  });

  it("shows error if NearbyService fails", async () => {
    NearbyService.getNearbyServices.mockRejectedValueOnce(
      new Error("Failed to fetch")
    );

    await act(async () => {
      render(<NearbyServices />);
    });

    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument();
  });

  it("renders fallback for unnamed services", async () => {
    NearbyService.getNearbyServices.mockResolvedValueOnce([
      {
        formattedAddress: "789 Unknown Road",
        type: "store",
        location: { latitude: 1.355, longitude: 103.822 },
      },
    ]);

    await act(async () => {
      render(<NearbyServices />);
    });

    expect(await screen.findByText("Unnamed Place")).toBeInTheDocument();
    expect(screen.getByText("789 Unknown Road")).toBeInTheDocument();
  });

  it("pans and zooms on service card click", async () => {
    await act(async () => {
      render(<NearbyServices />);
    });

    const card = await screen.findByText("PetVet Clinic");
    fireEvent.click(card.closest(".service-card"));

    expect(mockPanTo).toHaveBeenCalledWith({ lat: 1.353, lng: 103.82 });
    expect(mockSetZoom).toHaveBeenCalledWith(16);
  });
});