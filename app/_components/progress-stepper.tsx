import * as React from "react";

export function ProgressStepper({ steps, activeStepIndex }: { steps: string[]; activeStepIndex: number }) {
    return (
        // Step state was previously conveyed by colour alone and exposed nothing to a
        // screen reader; the list semantics and aria-current make the position readable.
        <ol
            className="flex items-start justify-center w-full max-w-2xl mx-auto"
            aria-label={`Step ${activeStepIndex + 1} of ${steps.length}: ${steps[activeStepIndex] ?? ''}`}
        >
            {steps.map((label, i) => {
                const completed = i < activeStepIndex;
                const active = i === activeStepIndex;
                return (
                    <React.Fragment key={label}>
                        <li
                            className="flex flex-col items-center gap-2 flex-shrink-0"
                            aria-current={active ? 'step' : undefined}
                        >
                            <span className="sr-only">
                                {completed ? 'Completed: ' : active ? 'Current step: ' : 'Upcoming step: '}
                            </span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                                ${completed ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                {completed ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight max-w-[80px] ${active ? 'text-blue-600' : completed ? 'text-green-600' : 'text-slate-400'}`}>
                                {label}
                            </span>
                        </li>
                        {i < steps.length - 1 && (
                            <div
                                aria-hidden="true"
                                className={`h-0.5 flex-1 mx-2 mt-4 transition-colors duration-200 ${i < activeStepIndex ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </ol>
    );
}
