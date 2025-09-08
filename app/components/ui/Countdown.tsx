"use client"; // if you're using Next.js App Router

import { useEffect, useState } from "react";

type TimeLeft = {
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    weeks: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Midnight today
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Target = midnight today + 6 weeks (42 days)
    const targetDate = new Date(midnight.getTime() + 42 * 24 * 60 * 60 * 1000);

    const updateCountdown = () => {
      const currentTime = new Date();
      const diff = targetDate.getTime() - currentTime.getTime();

      if (diff <= 0) {
        setTimeLeft({ weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(totalDays / 7);
      const remainingDays = totalDays % 7;

      setTimeLeft({
        weeks: weeks,
        days: remainingDays,
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    // Initial call + every second
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
 <div className="text-center p-4 rounded-2xl bg-black/100 text-white shadow-lg">
  <h3 className="text-2xl font-semibold mb-4">
    Voting Closes In
  </h3>

  <div className="flex justify-center gap-4 text-3xl font-mono">
    <div className="flex flex-col items-center">
      <span>{timeLeft.weeks}</span>
      <span className="text-sm text-gray-400">Weeks</span>
    </div>
    <div className="flex flex-col items-center">
      <span>{timeLeft.days}</span>
      <span className="text-sm text-gray-400">Days</span>
    </div>
    <div className="flex flex-col items-center">
      <span>{timeLeft.hours}</span>
      <span className="text-sm text-gray-400">Hours</span>
    </div>
    <div className="flex flex-col items-center">
      <span>{timeLeft.minutes}</span>
      <span className="text-sm text-gray-400">Minutes</span>
    </div>
    <div className="flex flex-col items-center">
      <span>{timeLeft.seconds}</span>
      <span className="text-sm text-gray-400">Seconds</span>
    </div>
  </div>

  <p className="mt-6 text-gray-300 text-sm max-w-md mx-auto">
    At the end of the countdown, only contestants with <span className="font-semibold text-green-400">3,000 votes or more</span> will qualify as winners.
  </p>
</div>

  );
}