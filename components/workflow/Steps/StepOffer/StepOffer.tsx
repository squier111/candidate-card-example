import React from 'react';
import { isMobile } from 'react-device-detect';

//components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';

type StepOfferProps = {
	setWorkflowMinimized: (minimized: boolean) => void;
};

export function StepOffer({ setWorkflowMinimized }: StepOfferProps) {
	return (
		<Stack vertical spacing="loose">
			{isMobile ? (
				<Button block type="default" disabled>
					This step is not supported on mobile
				</Button>
			) : (
				<Button
					onClick={() => {
						localStorage.setItem('workflowMinimized', 'false');
						setWorkflowMinimized(false);
					}}
					block
					type="primary"
				>
					Open Workflow
				</Button>
			)}
		</Stack>
	);
}
