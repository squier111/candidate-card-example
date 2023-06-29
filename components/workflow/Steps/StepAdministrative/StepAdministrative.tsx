import React, { useState } from 'react';
import { Input } from 'antd';

//types
import { CandidateStepResource, StepAssigneeResource } from 'types/domain/workflow.types';

// components
import { Stack } from 'components/common/Stack/Stack';
import { Button } from 'components/common/Button/Button';
import { ActOnBehalf } from '../components/ActOnBehalf';
import { Text } from 'components/common/Typography/Text';

// metadata
import { UserActionEnum } from 'metadata/candidate/workflow.meta';

//hooks
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { useCandidates } from 'hooks/angular/candidates/useCandidates.hook';
import { useUndoStepCallback } from 'hooks/workflow/useUndoStepCallback';
import { useCompleteStepCallback } from 'hooks/workflow/useCompleteStepCallback';

type StepAdministrativeProps = {
	step: CandidateStepResource;
};

export function StepAdministrative({ step }: StepAdministrativeProps) {
	const { types } = useRequisitionsStepStatic();
	const { candidateId, id, stepType, forStep } = step;

	const undoStep = useUndoStepCallback(candidateId, id, stepType, forStep);

	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();

	const [comment, setComment] = useState('');
	const [actingOnBehalf, setActingOnBehalf] = useState<undefined | StepAssigneeResource['candidateStepId']>();

	const actOfBehalfHandler = (candidateStepId: StepAssigneeResource['candidateStepId']) => {
		setActingOnBehalf(candidateStepId);
	};

	const completeStep = useCompleteStepCallback(step);

	const mustActOnBehalf =
		currentCandidate.userPermissions.fillOnBehalf &&
		types[step.stepType].allowOnBehalf &&
		step.userAction === UserActionEnum.DO_NOTHING;

	const canExecuteStep = step.userAction === UserActionEnum.EXECUTE_STEP;

	return (
		<Stack vertical spacing="loose">
			<Text medium size="medium">
				{step.focus}
			</Text>
			{step.isCompleted ? (
				<>
					{step.canUndo && (
						<Button block onClick={undoStep} type="default">
							Undo Step
						</Button>
					)}
				</>
			) : (
				<>
					{step.isCurrentStep && (
						<Stack vertical spacing="loose">
							{mustActOnBehalf && (
								<>
									{actingOnBehalf ? (
										<Button block type="default" onClick={() => setActingOnBehalf(undefined)}>
											Cancel on behalf
										</Button>
									) : (
										<ActOnBehalf step={step} onAct={actOfBehalfHandler} />
									)}
								</>
							)}
							{(canExecuteStep || actingOnBehalf) && (
								<Stack vertical spacing="loose">
									<Input
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										placeholder="Write a comment..."
									/>
									<Button
										onClick={() => completeStep({ furtherReview: comment, forStep: actingOnBehalf, proceed: true })}
										block
										type="primary"
									>
										Mark as Completed
									</Button>
								</Stack>
							)}
						</Stack>
					)}
				</>
			)}
		</Stack>
	);
}
