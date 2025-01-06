import { Check, ChevronRight } from "lucide-react";

interface StepNavigationProps {
  currentStep: number;
  steps: { title: string; description: string }[];
  onStepClick: (step: number) => void;
  completedSteps: number[];
}

export const StepNavigation = ({
  currentStep,
  steps,
  onStepClick,
  completedSteps,
}: StepNavigationProps) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.title} className="md:flex-1">
            <button
              onClick={() => onStepClick(index + 1)}
              className={`group flex w-full flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 
                ${
                  currentStep === index + 1
                    ? "border-violet-600"
                    : completedSteps.includes(index + 1)
                    ? "border-green-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
            >
              <span className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  {completedSteps.includes(index + 1) ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold
                        ${
                          currentStep === index + 1
                            ? "bg-violet-600 text-white"
                            : "bg-slate-200 text-slate-600 group-hover:bg-slate-300"
                        }`}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={
                      currentStep === index + 1
                        ? "text-violet-600"
                        : completedSteps.includes(index + 1)
                        ? "text-green-600"
                        : "text-slate-600"
                    }
                  >
                    {step.title}
                  </span>
                </span>
              </span>
              <span className="text-sm text-slate-500">{step.description}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};