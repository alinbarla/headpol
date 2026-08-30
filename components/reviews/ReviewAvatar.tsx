"use client";

import { useState } from "react";
import Image from "next/image";

export function ReviewAvatar({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <Image
      src={src}
      alt=""
      width={40}
      height={40}
      className="size-10 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}
