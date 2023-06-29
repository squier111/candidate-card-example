import React from 'react';
import { Typography } from 'antd';

// types
import { ActivityEventCandidateStep } from 'types/domain/activity.types';

// metadata
import { StepTypesEnum } from 'metadata/candidate/workflow.meta';

// hooks
import { useCandidates } from 'hooks/angular/candidates';

// components
import { CandidateStepResultInterview } from 'components/candidate/CandidateStepResult/CandidateStepResultInterview';
import {CandidateStepResultGoNoGo} from 'components/candidate/CandidateStepResult/CandidateStepResultGoNoGo';
import { CandidateStepResultAdministrative } from 'components/candidate/CandidateStepResult/CandidateStepResultAdministrative';
import { CandidateStepResultAssessment } from 'components/candidate/CandidateStepResult/CandidateStepResultAssessment';

// styled
import * as S from '../../ActivityEvent.styled';

const { Text } = Typography;

type ActivityEventCandidateStepProps = {
	event: ActivityEventCandidateStep;
};

export default function ActivityEventCandidateStep({ event }: ActivityEventCandidateStepProps) {
	const candidatesService = useCandidates();
	const currentCandidate = candidatesService.getCurrent();

	const { stepType } = event;
  const {INTERVIEW, GONOGO, ADMINISTRATIVE, ASSESSMENT} = StepTypesEnum;

	return (
		<S.ActivityEventBox>
			{stepType === INTERVIEW && <CandidateStepResultInterview event={event} undoStepId={currentCandidate._.stepCanUndoId} />}

			{stepType === GONOGO && <CandidateStepResultGoNoGo event={event} undoStepId={currentCandidate._.stepCanUndoId} />}

			{stepType === ADMINISTRATIVE && <CandidateStepResultAdministrative event={event} undoStepId={currentCandidate._.stepCanUndoId} />}

			{stepType === ASSESSMENT && <CandidateStepResultAssessment event={event} />}

      {![INTERVIEW, GONOGO, ADMINISTRATIVE, ASSESSMENT].includes(stepType) && <Text>No Renderer for Step Type {StepTypesEnum[stepType]}</Text>}
		</S.ActivityEventBox>
	);
}
