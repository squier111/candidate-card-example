import * as React from 'react';
import { Fragment } from 'react';
import { Tooltip } from 'antd';

//components
import { Tag } from 'components/common/Tag/Tag';
import { Stack } from 'components/common/Stack/Stack';
import { useCandidateSteps } from 'hooks/angular/candidate-steps';
import { useAssessments } from 'hooks/angular/assessments';
import { Check } from 'components/icons';
import { use$location } from 'hooks/angular/location';

//types
import { CandidateStepResource } from 'types/domain/workflow.types';
import { StepTypesEnum, StepStatusEnum, AutoSchedulingInvitationStatusEnum } from 'metadata/candidate/workflow.meta';
import { InterviewMethodIcon } from './InterviewMethodIcon';

type StepInfoProps<T> = {
	step: T;
	isMinimized: boolean;
};

const UPCOMING_INTERVIEW_URL_PARAMETER = 'upcoming-interview-step';

export function StepTag<T extends CandidateStepResource>({ step, isMinimized }: StepInfoProps<T>) {
	const candidateStepsService = useCandidateSteps();
	const assessmentsService = useAssessments();
	const locationService = use$location();

	let upcomingInterviewStepId;
	const {
		id,
		stepType,
		status: stepStatus,
		method: interviewMethod,
		isRequired,
		timeScheduled,
		timeCompleted,
		assessmentData,
		candidateSchedulingStatus
	} = step;

	// move all this logic to hook
	const urlParams = locationService.search();
	const upcomingInterviewUrlParameterValue = urlParams[UPCOMING_INTERVIEW_URL_PARAMETER];

	if (upcomingInterviewUrlParameterValue !== undefined) {
		upcomingInterviewStepId = parseInt(upcomingInterviewUrlParameterValue, 10);
		locationService.search(UPCOMING_INTERVIEW_URL_PARAMETER, null);
	}

	const sentToCandidate = candidateSchedulingStatus === AutoSchedulingInvitationStatusEnum.SENT_TO_CANDIDATE;
	const scheduledByCandidate = candidateSchedulingStatus === AutoSchedulingInvitationStatusEnum.SCHEDULED_BY_CANDIDATE;

	const assessmentSent = assessmentData?.status === assessmentsService.assessmentStatus.enumId.SEND;
	const assessmentCompleted = assessmentData?.status === assessmentsService.assessmentStatus.enumId.COMPLETED;

	return (
		<Stack
			alignment="leading"
			distribution={isMinimized ? 'trailing' : 'leading'}
			vertical={isMinimized}
			spacing={isMinimized ? 'tight' : 'extraTight'}
		>
			{/* timeCompleted only exist on candidateStep, always undefined for positionStep */}
			{isRequired && !timeCompleted && <Tag color="blue">Required to hire</Tag>}

			{stepType === StepTypesEnum.INTERVIEW && [
				timeCompleted ? (
					<Tag key="interview-status" icon={<Check />}>
						Interview {moment(timeCompleted).format('lll')}
					</Tag>
				) : (
					timeScheduled && (
						<Fragment key="interview-scheduled">
							{stepStatus === StepStatusEnum.PASSED ? (
								<Tag color="red">Due {moment(timeScheduled).format('lll')}</Tag>
							) : (
								<Tag color="blue" icon={<InterviewMethodIcon status={interviewMethod} />}>
									{moment(timeScheduled).format('lll')}
								</Tag>
							)}
						</Fragment>
					)
				),
				timeScheduled && upcomingInterviewStepId === id && (
					<Tag key="next-interview" color="blue">
						Your next interview
					</Tag>
				),
				sentToCandidate && (
					<Tag key="interview-candidate-invited-to-select-time" color="blue">
						Candidate invited to select time
					</Tag>
				),
				scheduledByCandidate && (
					<Tag key="interview-candidate-selected-time" color="blue">
						Scheduled by candidate
					</Tag>
				)
			]}

			{assessmentData && (assessmentSent || assessmentCompleted) && (
				<>
					{timeCompleted ? (
						<Tooltip placement="top" title={timeCompleted ? moment(timeCompleted).format('lll') : null}>
							<Tag>
								{assessmentData.partnerStatus || assessmentsService.assessmentStatus.data[assessmentData.status].name}
							</Tag>
						</Tooltip>
					) : (
						<Tag color="blue">Sent {moment(assessmentData.timeSentToPartner).format('lll')}</Tag>
					)}
				</>
			)}

			{!assessmentData && (
				<>
					{timeCompleted ? (
						<Tooltip placement="top" title={moment(timeCompleted).format('lll')}>
							<Tag>{candidateStepsService.statuses[stepStatus].name}</Tag>
						</Tooltip>
					) : (
						<>
							{candidateStepsService.statuses[stepStatus].showBigWell && (
								<Tag>{candidateStepsService.statuses[stepStatus].name}</Tag>
							)}
						</>
					)}
				</>
			)}
		</Stack>
	);
}
