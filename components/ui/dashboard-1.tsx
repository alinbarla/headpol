"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Filter, Users, Clock, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent } from "@/components/shadcn/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ActivityStat {
  label: string;
  value: number;
  color: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface MarketingDashboardProps {
  title?: string;
  teamActivities: {
    totalHours: number;
    stats: ActivityStat[];
    unitLabel?: string;
  };
  team: {
    memberCount: number;
    members: TeamMember[];
    unitLabel?: string;
  };
  cta: {
    text: string;
    buttonText: string;
    onButtonClick: () => void;
  };
  onFilterClick?: () => void;
  className?: string;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest * 10) / 10);

  React.useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export const MarketingDashboard = React.forwardRef<
  HTMLDivElement,
  MarketingDashboardProps
>(
  (
    {
      title = "Marketing Activities",
      teamActivities,
      team,
      cta,
      onFilterClick,
      className,
    },
    ref
  ) => {
    const containerVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const hoverTransition = { type: "spring" as const, stiffness: 300, damping: 15 };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border bg-card p-6 text-card-foreground",
          className
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 flex items-center justify-between"
        >
          <h2 className="text-2xl font-bold">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            aria-label="Filter activities"
          >
            <Filter />
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={hoverTransition}
          >
            <Card className="h-full overflow-hidden rounded-xl p-4">
              <CardContent className="p-2">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium text-muted-foreground">
                    Team Activities
                  </p>
                  <Clock className="size-5 text-muted-foreground" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    <AnimatedNumber value={teamActivities.totalHours} />
                  </span>
                  <span className="ml-1 text-muted-foreground">
                    {teamActivities.unitLabel ?? "hours"}
                  </span>
                </div>
                <div className="mb-2 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  {teamActivities.stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      className={cn("h-full", stat.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  {teamActivities.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center gap-1.5">
                      <span className={cn("size-2 rounded-full", stat.color)} />
                      <span>{stat.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={hoverTransition}
          >
            <Card className="h-full overflow-hidden rounded-xl border-lime-200 bg-lime-50 p-4 dark:border-lime-800 dark:bg-lime-900/30">
              <CardContent className="p-2">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium text-lime-900 dark:text-lime-200">
                    Team
                  </p>
                  <Users className="size-5 text-lime-900 dark:text-lime-200" />
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-lime-950 dark:text-lime-50">
                    <AnimatedNumber value={team.memberCount} />
                  </span>
                  <span className="ml-1 text-lime-800 dark:text-lime-300">
                    {team.unitLabel ?? "members"}
                  </span>
                </div>
                <div className="flex -space-x-2">
                  {team.members.slice(0, 4).map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.2, zIndex: 10, y: -2 }}
                    >
                      <Avatar className="border-2 border-lime-100 dark:border-lime-900">
                        <AvatarImage src={member.avatarUrl} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={hoverTransition}
          className="mt-4"
        >
          <div className="flex items-center justify-between rounded-xl bg-muted/60 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-background p-2">
                <Zap className="size-5 text-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {cta.text}
              </p>
            </div>
            <Button onClick={cta.onButtonClick} className="shrink-0">
              {cta.buttonText}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

MarketingDashboard.displayName = "MarketingDashboard";
