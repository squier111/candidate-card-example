import React from 'react';
import { Card } from 'antd';

//components
import { ShuffleAngular, ArrowsOutSimple, ArrowsInSimple } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import { WorkflowCardUnlockPipeline } from './WorkflowCardUnlockPipeline';

//types
import { CandidateStepResource } from 'types/domain/workflow.types';

type WorkflowProps = {
	isMinimized?: boolean;
	onToggleMinimize: () => void;
	stepSet: CandidateStepResource[];
};

export default function WorkflowCard({
	isMinimized,
	onToggleMinimize,
	children
}: React.PropsWithChildren<WorkflowProps>) {
	return (
		<Card
			size="small"
			bodyStyle={{ padding: '0px' }}
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					<ShuffleAngular weight="bold" />
					<Heading level={4}>Workflow</Heading>
					<WorkflowCardUnlockPipeline />
				</Stack>
			}
			extra={
				<Button
					neutral
					type="link"
					onClick={() => onToggleMinimize()}
					icon={isMinimized ? <ArrowsOutSimple /> : <ArrowsInSimple />}
				>
					{isMinimized ? 'Expand' : 'Minimize'}
				</Button>
			}
			bordered={false}
		>
			{children}
		</Card>
	);
}
