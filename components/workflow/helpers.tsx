import { StepResource } from "types/domain/workflow.types";

const PROCEED_CANDIDATE = 'Proceed with candidate?';

export function orderSteps(stepSet: StepResource[]) {
	const notCompletedSteps: StepResource[] = [];
	const completedSteps: StepResource[] = [];
	const proceedSteps: StepResource[] = [];

	stepSet.forEach((step) => {
		if (step.displayName === PROCEED_CANDIDATE) {
			proceedSteps.push(step);
		}
		else {
			if (step.isCompleted) {
				completedSteps.push(step);
			}
			if (!step.isCompleted) {
				notCompletedSteps.push(step);
			}
		}
	})

	return [...completedSteps, ...proceedSteps, ...notCompletedSteps]
};