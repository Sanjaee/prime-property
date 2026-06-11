import { NextApiRequest, NextApiResponse } from "next";

// Cache in memory so the dummy data doesn't jump around on every render/fetch
let cachedVisitors: any = null;
let lastGeneratedDate: string | null = null;

function generateDummyVisitors() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // If we already generated data today, return it
  if (cachedVisitors && lastGeneratedDate === todayStr) {
    return cachedVisitors;
  }

  const data = [];
  
  // Seed for pseudo-random consistency during generation
  let seed = today.getTime();
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // Generate 365 days of data backwards from today
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Add some random variance, but keep desktop/mobile somewhat correlated
    // We add a trend component to make it look like growth
    const trend = i < 90 ? (90 - i) * 2 : 0; // slight upward trend recently
    
    // Weekend logic (lower visitors on weekends)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const weekendMultiplier = isWeekend ? 0.6 : 1.0;

    const baseDesktop = Math.floor((100 + random() * 200 + trend) * weekendMultiplier);
    const baseMobile = Math.floor((150 + random() * 250 + trend * 1.5) * weekendMultiplier);

    data.push({
      date: d.toISOString().split("T")[0],
      desktop: baseDesktop,
      mobile: baseMobile,
    });
  }

  cachedVisitors = data;
  lastGeneratedDate = todayStr;
  return data;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = generateDummyVisitors();
    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error("Error generating visitor data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
