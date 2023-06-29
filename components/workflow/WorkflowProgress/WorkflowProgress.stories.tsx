// MyComponent.stories.js
import { WorkflowProgress as WorkflowProgressComponent } from './WorkflowProgress';
import { Story } from '@storybook/react';

import React, { useEffect, useState } from 'react';

//types
import { CandidateStepResource } from 'types/domain/workflow.types';

type WorkflowProgressProps = {
	isNavigation: boolean;
};

export default {
	title: 'Components/Common/WorkflowProgress',
	component: WorkflowProgressComponent,
	argTypes: {
		isNavigation: { control: 'boolean', defaultValue: true }
	}
};

const steps: any = [];

new Array(10).fill(0).forEach((item, i) => {
	steps.push({
		id: i,
		index: i,
		name: `${i} - Some Name`,
		proceed: null,
		interview: null,
		stepType: 1,
		isCompleted: i < 4 ? true : false,
		isCurrentStep: i === 4 ? true : false
	});
});

export const WorkflowProgress: Story<WorkflowProgressProps> = (args): JSX.Element => {
	const [stepIndex, setStepIndex] = useState<number>(0);

	useEffect(() => {
		const currentStep = steps.filter((step: CandidateStepResource) => step.isCurrentStep);
		setStepIndex(currentStep[0].index);
	}, [steps]);

	return (
		<WorkflowProgressComponent
			stepSet={steps}
			stepIndex={stepIndex}
			changeSelectedStepIndex={setStepIndex}
			isNavigation={args.isNavigation && true}
		/>
	);
};
