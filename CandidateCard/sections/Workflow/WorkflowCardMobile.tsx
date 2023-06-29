import React, { useState, useCallback } from 'react';
import { Affix, Card, Drawer } from 'antd';
import { ShuffleAngular } from 'components/icons';
import { CaretDown, CaretUp } from 'components/icons';

//components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { WorkflowMinimized } from 'components/workflow/WorkflowMinimized';
import { Text } from 'components/common/Typography/Text';
import { WorkflowProgress } from 'components/workflow/WorkflowProgress/WorkflowProgress';
import { UserAvatar } from 'components/user/UserAvatar';
import { Heading } from 'components/common/Typography/Heading';

//helpers
import { orderSteps } from 'components/workflow/helpers';

//hooks
import { useUsers } from 'hooks/angular/users';

//metadata
import { StatusesEnum } from 'metadata/candidate/candidate.meta';

//types
import { StepResource } from 'types/domain/workflow.types';

type WorkflowProps<T> = {
	steps: T[];
	defaultSelectedStepId?: number;
	statusId: number;
};

export default function WorkflowCardMobile<T extends StepResource>({
	steps,
	defaultSelectedStepId,
	statusId
}: WorkflowProps<T>) {
	const [expanded, setExpanded] = useState(false);

	const usersService = useUsers();
	const currentUser = usersService.getCurrent();

	const orderedSteps = orderSteps(steps);

	const currentStepIndex = defaultSelectedStepId
		? orderedSteps.findIndex((step) => step.id === defaultSelectedStepId)
		: orderedSteps.findIndex((step) => step.isCurrentStep);

	const [stepIndex, setStepIndex] = useState<number>(currentStepIndex);
	const selectedStep = orderedSteps[stepIndex];

	const currentStepIndexCallback = useCallback(
		(stepIndex: number) => {
			setStepIndex(stepIndex);
		},
		[stepIndex]
	);

	return (
		<>
			<div onClick={() => setExpanded(true)}>
				<Affix offsetBottom={0}>
					<Card
						size="small"
						style={{ borderRadius: '20px 20px 0 0' }}
						title={
							<Stack wrap={false} distribution="center" alignment="center" spacing="none">
								<Button icon={<CaretUp />} type="text" />
							</Stack>
						}
						bordered={false}
						headStyle={{ borderBottom: 'none', padding: 0 }}
					>
						<Stack distribution="equalSpacing" alignment="center" wrap={false} spacing="tight">
							<Stack.Item>
								{stepIndex < 0 || StatusesEnum[statusId] === 'REJECTED' ? (
									<Stack spacing="tight" alignment="center">
										<ShuffleAngular weight="bold" />
										<Heading level={4}>Workflow</Heading>
									</Stack>
								) : (
									<Stack spacing="tight" alignment="center">
										{selectedStep.assignedTo.find((user) => user.id === currentUser.id) && (
											<UserAvatar size="small" id={currentUser.id} />
										)}
										<Text strong size="medium">
											{selectedStep.name}
										</Text>
									</Stack>
								)}
							</Stack.Item>
							<WorkflowProgress stepIndex={stepIndex} stepSet={orderedSteps} changeSelectedStepIndex={setStepIndex} />
						</Stack>
					</Card>
				</Affix>
			</div>
			<Drawer
				placement="bottom"
				visible={expanded}
				onClose={() => {
					setExpanded(false);
				}}
				style={{ zIndex: 2001 }}
				contentWrapperStyle={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}
				bodyStyle={{ padding: 0 }}
				headerStyle={{ borderBottom: 'none', padding: 0 }}
				height={'auto'}
				width={'100%'}
				title={
					<Stack wrap={false} distribution="center" alignment="center" spacing="tight">
						<Button icon={<CaretDown />} onClick={() => setExpanded(false)} type="text" />
					</Stack>
				}
				closable={false}
			>
				<WorkflowMinimized<T>
					steps={steps}
					isMinimized={true}
					setWorkflowMinimized={() => {}}
					currentStepIndexCallback={(stepIndex) => currentStepIndexCallback(stepIndex)}
				/>
			</Drawer>
		</>
	);
}
