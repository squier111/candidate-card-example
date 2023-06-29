import React, { useState, useCallback } from 'react';

//components
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { Stack } from 'components/common/Stack/Stack';

import { ActionButtons } from './views/ActionButtons';
import { ActOnBehalf } from '../components/ActOnBehalf';

// metadata
import { UserActionEnum } from 'metadata/candidate/workflow.meta';

//types
import { CandidateStepResource, StepAssigneeResource } from 'types/domain/workflow.types';

//hooks
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { useCandidates } from 'hooks/angular/candidates';
import { UserResource } from 'types/domain/user.types';
import { useUndoStepCallback } from 'hooks/workflow/useUndoStepCallback';

type StepGoNoGoProps = {
	step: CandidateStepResource;
};

export function StepGoNoGo({ step }: StepGoNoGoProps) {
	const { types } = useRequisitionsStepStatic(); // normally this is just WorkflowStepTypes
	const [actingOnBehalf, setActingOnBehalf] = useState<undefined | StepAssigneeResource['candidateStepId']>();

	const { candidateId, id, stepType, forStep } = step;

	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();

	const undoStep = useUndoStepCallback(candidateId, id, stepType, forStep);



	// old check: && (userActions[step.userAction]?.allowSelectOnBehalfOf || !step.userAction);

	const mustActOnBehalf =
		currentCandidate.userPermissions.fillOnBehalf &&
		types[step.stepType].allowOnBehalf &&
		step.userAction === UserActionEnum.DO_NOTHING;

	const actOfBehalfHandler = useCallback((id: StepAssigneeResource['candidateStepId']) => {
		setActingOnBehalf(id);
	}, []);

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
							{(actingOnBehalf || canExecuteStep) && <ActionButtons step={step} actingOnBehalf={actingOnBehalf} />}
						</Stack>
					)}
				</>
			)}
		</Stack>
	);
}
