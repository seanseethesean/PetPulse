import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import NearbyServices from "./NearbyServices"
import NearbyService from "../utils/nearby"
import "@testing-library/jest-dom"

jest.mock("../utils/nearby")

jest.mock("../components/Navbar", () => () => (
  <div data-testid="navbar">Navbar</div>
))

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "mockUserId" }
  }))
}))

const mockPanTo = jest.fn();
const mockSetZoom = jest.fn();
const mockMapInstance = {
  panTo: mockPanTo,
  setZoom: mockSetZoom,
};

jest.mock("@react-google-maps/api", () => ({
  GoogleMap: ({ onLoad, children }) => {
    onLoad(mockMapInstance);
    return <div data-testid="map">{children}</div>;
  },
  Marker: () => <div data-testid="marker" />,
  useJsApiLoader: () => ({ isLoaded: true }),
}));

beforeAll(() => {
  global.window.google = {
    maps: {
      Size: function (width, height) {
        return { width, height }
      }
    }
  }
})

describe("NearbyServices", () => {
  const mockLocation = {
    coords: {
      latitude: 1.3521,
      longitude: 103.8198
    }
  }

  beforeEach(() => {
    // Mock geolocation success
    global.navigator.geolocation = {
      getCurrentPosition: jest.fn((success) => success(mockLocation))
    }

    NearbyService.getNearbyServices.mockResolvedValue([
      {
        displayName: { text: "PetVet Clinic" },
        formattedAddress: "123 Pet Street",
        type: "VETERINARY_CARE",
        location: {
          latitude: 1.353,
          longitude: 103.82
        }
      }
    ])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("renders loading state initially", async () => {
    render(<NearbyServices />)
    expect(screen.getByText("Loading nearby services...")).toBeInTheDocument()
  })

  it("displays map and services after successful fetch", async () => {
    await act(async () => {
      render(<NearbyServices />)
    })

    await waitFor(() => {
      expect(screen.getByTestId("map")).toBeInTheDocument()
      expect(screen.getByText("PetVet Clinic")).toBeInTheDocument()
      expect(screen.getByText("123 Pet Street")).toBeInTheDocument()
      expect(screen.getByText("VETERINARY CARE")).toBeInTheDocument()
    })
  })

  it("displays error message when geolocation fails", async () => {
    global.navigator.geolocation.getCurrentPosition = jest.fn((_, error) =>
      error()
    )

    await act(async () => {
      render(<NearbyServices />);
    });
    await waitFor(() => {
      expect(
        screen.getByText(
          "Location permission denied. Try entering your address."
        )
      ).toBeInTheDocument()
    })
  })

  it("displays error message when fetching services fails", async () => {
    NearbyService.getNearbyServices.mockRejectedValueOnce(
      new Error("API failed")
    )

    render(<NearbyServices />)

    await waitFor(() => {
      expect(screen.getByText("API failed")).toBeInTheDocument()
    })
  })

  it("renders fallback values when name and type are missing", async () => {
    NearbyService.getNearbyServices.mockResolvedValueOnce([
      {
        formattedAddress: "456 Unknown Ave",
        location: { latitude: 1.354, longitude: 103.821 }
      }
    ]);
  
    render(<NearbyServices />);
    expect(await screen.findByText("Unnamed Place")).toBeInTheDocument();
    expect(screen.getByText("456 Unknown Ave")).toBeInTheDocument();
    expect(screen.getByText("pet service")).toBeInTheDocument();
  });
  
  it("calls panTo and setZoom when service card is clicked", async () => {
    render(<NearbyServices />);
    await screen.findByText("PetVet Clinic");
  
    screen.getByText("PetVet Clinic").closest(".service-card").click();
  
    expect(mockPanTo).toHaveBeenCalledWith({ lat: 1.353, lng: 103.82 });
    expect(mockSetZoom).toHaveBeenCalledWith(16);
  });
  
})