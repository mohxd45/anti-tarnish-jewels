import React from "react";
import { HeartLoader } from "./HeartLoader";

export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-main-bg/20">
      <HeartLoader size="lg" text={text} />
    </div>
  );
}
