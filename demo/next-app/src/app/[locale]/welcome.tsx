'use client';

import WelcomeChild from "./welcome-child";

export default function Welcome() {
  return (
    <span>
      Welcome to Replexica!
      <WelcomeChild />
    </span>
  );
}