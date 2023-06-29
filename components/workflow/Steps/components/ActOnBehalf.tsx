import React from 'react';
import { Menu, Dropdown } from 'antd';

//components
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { UserAvatar } from 'components/user/UserAvatar';
import { Stack } from 'components/common/Stack/Stack';
import { MenuItemEllipsis } from 'components/common/Menu/MenuItemEllipsis.styled';

//types
import { StepResource } from 'types/domain/workflow.types';
import { StepAssigneeResource } from 'types/domain/workflow.types';
import { UserResource } from 'types/domain/user.types';

type ActOnBehalfProps = {
	step: StepResource;
	onAct: (id: StepAssigneeResource['candidateStepId']) => void;
	isMinimized?: boolean;
};

export function ActOnBehalf({ step, onAct, isMinimized }: ActOnBehalfProps) {
	if (step.assignedTo.length === 1) {
		return (
			<Button block type="default" onClick={() => onAct(step.assignedTo[0].candidateStepId)}>
				Act on Behalf {step.assignedTo[0].firstName}
			</Button>
		);
	}

	return (
		<div style={{ position: 'relative' }}>
			<Dropdown
				trigger={['click']}
				overlay={renderParticipantsMenu(step.assignedTo, onAct)}
				placement="bottom"
				getPopupContainer={(trigger) => trigger.parentElement as HTMLElement}
				overlayStyle={{ width: '100%' }}
			>
				<Button disclosure block={!isMinimized} type="default">
					Act on Behalf
				</Button>
			</Dropdown>
		</div>
	);
}

function renderParticipantsMenu(assignedTo: StepAssigneeResource[], actOfBehalfCallback: (id: number) => void) {
	return (
		<Menu>
			<Menu.Item style={{cursor: 'auto'}} disabled key={Math.random()}>
				<Text size="small" type="secondary">
					Act on Behalf of
				</Text>
			</Menu.Item>
			<Menu.Divider />
			{assignedTo.map((assignee) => {
				return (
					<MenuItemEllipsis key={assignee.id} onClick={() => actOfBehalfCallback(assignee.candidateStepId)}>
						<Stack spacing="tight" alignment="center" wrap={false}>
							<UserAvatar shape="square" id={assignee.id} size="small" />
							<Stack.Item fill={true}>
								<Text ellipsis>{assignee.fullName}</Text>
							</Stack.Item>
						</Stack>
					</MenuItemEllipsis>
				);
			})}
		</Menu>
	);
}
