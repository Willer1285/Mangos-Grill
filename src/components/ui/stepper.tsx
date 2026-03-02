"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  isCompleted && "bg-terracotta-500 text-white",
                  isActive && "bg-terracotta-500 text-white ring-4 ring-terracotta-500/20",
                  !isActive && !isCompleted && "border-2 border-cream-300 text-brown-500"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isActive ? "text-brown-900" : "text-brown-500"
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-0.5 w-16 sm:w-24",
                  stepNumber < currentStep ? "bg-terracotta-500" : "bg-cream-300"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { Stepper };
export type { Step };
