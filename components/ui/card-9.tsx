"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SentimentData {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export interface SentimentAnalysisCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  overallSentiment: string;
  overallSentimentIcon?: React.ReactNode;
  data: SentimentData[];
}

const SentimentAnalysisCard = React.forwardRef<
  HTMLDivElement,
  SentimentAnalysisCardProps
>(
  (
    {
      title,
      overallSentiment,
      overallSentimentIcon,
      data,
      className,
      ...props
    },
    ref
  ) => {
    const totalValue = React.useMemo(
      () => data.reduce((acc, curr) => acc + curr.value, 0),
      [data]
    );

    return (
      <div
        ref={ref}
        className={cn(
          "w-full rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
          className
        )}
        aria-labelledby="sentiment-card-title"
        role="region"
        {...props}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            id="sentiment-card-title"
            className="text-lg font-semibold text-card-foreground"
          >
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
            {overallSentimentIcon}
            <span>{overallSentiment}</span>
          </div>
        </div>

        <div
          className="relative mb-4 flex h-4 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label={`Sentiment distribution: ${data
            .map(
              (item) =>
                `${item.label} ${
                  totalValue > 0
                    ? ((item.value / totalValue) * 100).toFixed(0)
                    : 0
                }%`
            )
            .join(", ")}`}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {data.map((item, index) => {
            const percentage =
              totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            return (
              <motion.div
                key={`${item.label}-${index}`}
                className={cn("h-full", item.color)}
                initial={{ width: "0%" }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                  delay: index * 0.1,
                }}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-start gap-6 text-sm text-muted-foreground">
          {data.map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SentimentAnalysisCard.displayName = "SentimentAnalysisCard";

export { SentimentAnalysisCard };
