import React from 'react';

//components
import {
	StepGoNoGo,
	StepInterview,
	StepAdministrative,
	StepSendNotification,
	StepOffer,
	StepAssessment
} from './Steps';

//meta
import { StepTypesEnum } from 'metadata/candidate/workflow.meta';

//types
import { StepResource} from 'types/domain/workflow.types';


export type StepOverviewProps<T> = {
	steps: T[];
	selectedStepIndex: number;
	setWorkflowMinimized: (minimized: boolean) => void;
};

const StepTypesMap: { [key in StepTypesEnum]: any } = {
	[StepTypesEnum.GONOGO]: StepGoNoGo,
	[StepTypesEnum.INTERVIEW]: StepInterview,
	[StepTypesEnum.ADMINISTRATIVE]: StepAdministrative,
	[StepTypesEnum.DUPLICATION_CHECK]: StepGoNoGo,
	[StepTypesEnum.SEND_EMAIL]: StepSendNotification,
	[StepTypesEnum.PROCEED]: StepGoNoGo,
	[StepTypesEnum.ASSESSMENT]: StepAssessment,
	[StepTypesEnum.OFFER]: StepOffer
};

export function StepOverview<T extends StepResource>({
	steps,
	selectedStepIndex,
	setWorkflowMinimized
}: StepOverviewProps<T>) {
	const step = steps[selectedStepIndex];
	const StepComponent = StepTypesMap[step.stepType];

	return <StepComponent allSteps={steps} step={step} setWorkflowMinimized={setWorkflowMinimized} />;
}
