import * as React from "react";

export function ProgressStepper({ steps, activeStepIndex, onStepClick }: {
    steps: string[];
    activeStepIndex: number;
    /**
     * Jumps to an already-completed step. Supplying it makes those steps clickable, so
     * changing the file after reaching the options no longer means pressing Back repeatedly
     * or reloading the tool.
     */
    onStepClick?: (index: number) => void;
}) {
    return (
        // Step state was previously conveyed by colour alone and exposed nothing to a
        // screen reader; the list semantics and aria-current make the position readable.
        <ol
            className="flex items-center justify-center w-full max-w-2xl mx-auto"
            aria-label={`Step ${activeStepIndex + 1} of ${steps.length}: ${steps[activeStepIndex] ?? ''}`}
        >
            {steps.map((label, i) => {
                const completed = i < activeStepIndex;
                const active = i === activeStepIndex;
                return (
                    <React.Fragment key={label}>
                        <li
                            className="relative flex items-center gap-1.5 flex-shrink-0"
                            aria-current={active ? 'step' : undefined}
                        >
                            {/* Only completed steps are navigable: jumping forward would skip
                                choices the later steps depend on. */}
                            {completed && onStepClick ? (
                                <button
                                    type="button"
                                    onClick={() => onStepClick(i)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label={`Go back to: ${label}`}
                                />
                            ) : null}
                            <span className="sr-only">
                                {completed ? 'Completed: ' : active ? 'Current step: ' : 'Upcoming step: '}
                            </span>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200
                                ${completed ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-2 ring-blue-100 dark:ring-blue-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                {completed ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : i + 1}
                            </div>
                            <span className={`hidden sm:inline text-xs font-medium leading-none whitespace-nowrap ${active ? 'text-blue-600 dark:text-blue-400' : completed ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                {label}
                            </span>
                        </li>
                        {i < steps.length - 1 && (
                            <div
                                aria-hidden="true"
                                className={`h-px flex-1 mx-2 transition-colors duration-200 ${i < activeStepIndex ? 'bg-green-400' : 'bg-slate-200 dark:bg-slate-700'}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </ol>
    );
}
