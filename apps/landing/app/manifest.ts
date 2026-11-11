import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DAJEM Group | Orbital, Homes & Farms",
    short_name: "DAJEM",
    description:
      "Unified mobile & web platform for DAJEM Orbital (Survey Plan & Geomatics), DAJEM Homes (Verified Property Listings), and DAJEM Farms (Agro E-Commerce).",
    start_url: "/app",
    display: "standalone",
    background_color: "#040812",
    theme_color: "#06b6d4",
    orientation: "portrait",
    categories: ["business", "shopping", "navigation", "productivity"],
    icons: [
      {
        src: "/images/dajem-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
