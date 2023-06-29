import * as React from 'react';
import { useState, useEffect } from 'react';

// common components
import { WorkflowProgress } from 'components/workflow/WorkflowProgress/WorkflowProgress';
import { StepInfo } from './Steps/components/StepInfo';
import { Stack } from 'components/common/Stack/Stack';
import { Text } from 'components/common/Typography/Text';

//helpers
import { orderSteps } from 'components/workflow/helpers'

// types
import { StepResource } from 'types/domain/workflow.types';

// local components
import { StepOverview } from './StepOverview';

// styled
import * as S from './Workflow.styled';
import { StepTag } from './Steps/components/StepTag';

export type WorkflowMinimizedProps<T> = {
	steps: T[];
	defaultSelectedStepId?: number;
	isMinimized: boolean;
	setWorkflowMinimized: (minimized: boolean) => void;
	currentStepIndexCallback?: (stepIndex: number) => void;
};

export function WorkflowMinimized<T extends StepResource>({
	steps,
	defaultSelectedStepId,
	isMinimized,
	setWorkflowMinimized,
	currentStepIndexCallback
}: WorkflowMinimizedProps<T>) {
	const orderedSteps = orderSteps(steps);
	const [stepIndex, setStepIndex] = useState<number>(0);
	const selectedStep = orderedSteps[stepIndex];

	useEffect(() => {
		const currentStepIndex = defaultSelectedStepId
			? orderedSteps.findIndex((step) => step.id === defaultSelectedStepId)
			: orderedSteps.findIndex((step) => step.isCurrentStep);
		setStepIndex(currentStepIndex);
	}, [steps]);

	useEffect(() => {
		if (currentStepIndexCallback) {
			currentStepIndexCallback(stepIndex);
		}
	}, [stepIndex]);

	return (
		<>
			<WorkflowProgress
				stepSet={orderedSteps}
				stepIndex={stepIndex}
				changeSelectedStepIndex={setStepIndex}
				isNavigation
			/>
			{stepIndex >= 0 ? (
				<S.WorkflowMinimized completed={selectedStep.isCompleted}>
					<Stack vertical spacing="tight">
						<StepInfo isMinimized={isMinimized} step={selectedStep} />
						{/* FIX THIS TS WORKAROUND */}
						<StepTag step={selectedStep as any} isMinimized={isMinimized} />
						<StepOverview
							steps={orderedSteps}
							selectedStepIndex={stepIndex}
							setWorkflowMinimized={setWorkflowMinimized}
						/>
					</Stack>
				</S.WorkflowMinimized>
			) : (
				<S.WorkflowMinimized completed>
					<Stack distribution="leading" alignment="center" spacing="tight">
						<Text size="medium" type="secondary">
							No step selected
						</Text>
					</Stack>
				</S.WorkflowMinimized>
			)}
		</>
	);
}
