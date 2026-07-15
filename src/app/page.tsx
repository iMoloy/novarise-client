import HomeClient from "./HomeClient";

// Revalidate every 60 seconds
export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default async function HomePage() {
  let serializedCampaigns = [];

  try {
    const res = await fetch(`${API_URL}/api/campaigns`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      serializedCampaigns = data.campaigns || [];
    }
  } catch (error) {
    console.error("Failed to fetch campaigns in Server Component:", error);
  }

  return <HomeClient topCampaigns={serializedCampaigns} />;
}
