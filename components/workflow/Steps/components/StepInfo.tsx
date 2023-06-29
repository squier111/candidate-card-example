import * as React from 'react'
import { useMemo } from 'react';
import { Badge } from 'antd';
import orderBy from 'lodash/orderBy';

//components
import { ActOnBehalf } from './ActOnBehalf';
import { Eye } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { Check } from 'components/icons';
import { Tag } from 'components/common/Tag/Tag';
import { Stack } from 'components/common/Stack/Stack';
import { UserAvatarGroup } from 'components/user/UserAvatarGroup';
import { UserAvatar } from 'components/user/UserAvatar';
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';

//types
import { StepResource, StepAssigneeResource } from 'types/domain/workflow.types';

type StepInfoProps<T> = {
	step: T;
	isMinimized: boolean;
};

export function StepInfo<T extends StepResource>({ step, isMinimized }: StepInfoProps<T>) {
	const { types } = useRequisitionsStepStatic();

	const orderedStepAssignees = useMemo(() => orderBy(step.assignedTo, 'interviewSubmitted', 'desc'), [step]);

	const actOfBehalfHandler = (candidateStepId: StepAssigneeResource['candidateStepId']) => {
		console.log(candidateStepId);
	};

	return (
		<>
			<Stack fill distribution="equalSpacing">
				<Stack alignment={isMinimized ? 'center' : 'leading'} distribution={isMinimized ? 'equalSpacing' : 'leading'}>
					<Stack spacing={isMinimized ? 'extraTight' : 'tight'} alignment="leading" vertical={isMinimized}>
						<Text strong size="medium">
							{step.name}
						</Text>
						<Text size="medium" type="secondary">
							{types[step.stepType].name}
						</Text>
					</Stack>
					<UserAvatarGroup maxCount={3} size="small">
						{orderedStepAssignees.map((assignee) => (
							/* when 0 is in count it is not displayed */
							<Badge
								key={assignee.id}
								count={assignee.interviewSubmitted ? <Tag size="small" color="blue" icon={<Check />} /> : 0}
							>
								<UserAvatar id={assignee.id} />
							</Badge>
						))}
					</UserAvatarGroup>
				</Stack>
				{!isMinimized && (
					<Stack distribution="trailing">
						<Button type="default" icon={<Eye />} />
						<ActOnBehalf isMinimized={isMinimized} step={step} onAct={actOfBehalfHandler} />
					</Stack>
				)}
			</Stack>
		</>
	);
}
