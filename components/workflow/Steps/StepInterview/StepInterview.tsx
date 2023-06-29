import React, { useState } from 'react';

//components
import { Schedule } from './components/Schedule';
import { ActOnBehalf } from '../components/ActOnBehalf';
import { Button } from 'components/common/Button/Button';
import { Text } from 'components/common/Typography/Text';
import { Stack } from 'components/common/Stack/Stack';
import { Modal } from 'antd';

//types
import { CandidateStepResource} from 'types/domain/workflow.types';

//hooks
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { UserActionEnum } from 'metadata/candidate/workflow.meta';
import { useUndoStepCallback } from 'hooks/workflow/useUndoStepCallback';
import { useUsers } from 'hooks/angular/users';
import { useInterviews } from 'hooks/angular/interviews';
import { useCandidates } from 'hooks/angular/candidates';
import { useErrorsNotifications } from 'hooks/angular/error-notifications';
import { useCandidateSteps } from 'hooks/angular/candidate-steps';
import { use$state } from 'hooks/angular/state';

const { confirm } = Modal;

type StepInterviewProps = {
	step: CandidateStepResource;
};

const notSubmittedInterviewers =
	'Other interviewers have not submitted their evaluations yet, you can wait for them or close the interview without their feedback.';

export function StepInterview({ step }: StepInterviewProps) {
	const { candidateId, id, stepType, forStep } = step;

	const userService = useUsers();
	const { types } = useRequisitionsStepStatic();

	const undoStep = useUndoStepCallback(candidateId, id, stepType, forStep);
	const { alertError } = useErrorsNotifications();

	const currentUser = userService.getCurrent();

	const $stateService = use$state();
	const interviewsService = useInterviews();

	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();
	const candidateStepsService = useCandidateSteps();
	const [startingOrCompletingInterview, setStartingOrCompletingInterview] = useState(false);

	const mustActOnBehalf =
		(step.isCurrentStep || step.timeScheduled) &&
		currentCandidate.userPermissions.fillOnBehalf &&
		types[step.stepType].allowOnBehalf &&
		step.userAction === UserActionEnum.DO_NOTHING;
	// (userActions[step.userAction]?.allowSelectOnBehalfOf || !step.userAction);

	const stepCanBeFinishedWithoutWaitingForOtherAssigneeInterviews =
		!step.isCompleted && step.isAnyCompleted && step.interview?.isCompleted;

	const interviewMustBeStarted = !step.isCompleted && !step.interview?.id; /*  && !step.interview?.isCompleted */

	/* Previously was : const interviewMustBeCompleted = step.interview?.id && !step.interview?.isCompleted; */
	const currentUserInStepAssignees = step.assignedTo.find((assignee) => assignee.id === currentUser.id);

	const interviewMustBeCompleted =
		currentUserInStepAssignees?.interviewStarted && currentUserInStepAssignees?.interviewSubmitted === false;

	const interviewMustBeCompletedOnBehalf = step.interview?.id && !step.interview?.isCompleted;

	const interviewCanBeStartedOrContinued =
		interviewMustBeStarted || interviewMustBeCompleted || interviewMustBeCompletedOnBehalf;
	// previously was || step._.isIntererviewStartedNotCompleted

	/*
	step.userAction === UserActionEnum.EXECUTE_STEP || step.userAction === UserActionEnum.ON_BEHALF_STARTED;  is same as  userActions[step.userAction].isCurrentStep
	*/

	/* previously was
	const canExecuteStep = userActions[step.userAction].isCurrentStep || step._.isIntererviewStartedNotCompleted

	Viktor think that "step._.isIntererviewStartedNotCompleted" is same as "(step.isCompleted && !step.interview?.isCompleted)"
	*/
	const canExecuteStep =
		step.userAction === UserActionEnum.EXECUTE_STEP || step.userAction === UserActionEnum.ON_BEHALF_STARTED;

	function completeInterviewFinishedByOneOfAssignees() {
		setStartingOrCompletingInterview(true);
		const submitData = {
			proceed: true,
			furtherReview: ''
		};

		candidateStepsService
			.forceComplete({ parentId: step.candidateId, id: step.id }, submitData)
			.$promise.then((data) => {
				setStartingOrCompletingInterview(false);
				// Trigger for update component will be here
			})
			.catch(function (error) {
				alertError(error);
			});
	}

	function createInterview(actingOnBehalfUserId?: number) {
		interviewsService
			.createInterview(
				{ candidateId: currentCandidate.id, stepId: step.id, forStep: actingOnBehalfUserId },
				{ forStep: actingOnBehalfUserId }
			)
			.$promise.then((data) => {
				setStartingOrCompletingInterview(false);
				$stateService.go('interview', {
					interviewId: data.id,
					fromState: $stateService.current?.name,
					fromStatus: $stateService.params?.status
				});
			})
			.catch((err) => alertError(err));
	}

	function startOrContinueInterview(actingOnBehalfUserId?: number) {
		setStartingOrCompletingInterview(true);
		const currentAssignee = step.assignedTo.find(assignee => assignee.candidateStepId === actingOnBehalfUserId);

		if (interviewMustBeStarted) {
			 if (
					currentAssignee &&
					currentAssignee.interviewLastUpdated &&
					moment(currentAssignee.interviewLastUpdated).isAfter(moment().subtract(5, 'minute'))
				) {
					showEvaluatingByOtherUserModal(
						`Can’t take over: ' ${currentAssignee.fullName} + ' is currently evaluating ' + ${currentCandidate.fullName}`
					);
					return;
				}

				if (
					!step.timeCompleted &&
					step.interview &&
					currentAssignee?.interviewStarted &&
					!currentAssignee?.interviewSubmitted
				) {
					showInterviewHasAlreadyStartedModal(currentAssignee.fullName, () => createInterview(actingOnBehalfUserId));
				} else {
					createInterview(actingOnBehalfUserId);
				}
			return;
		}

		if (interviewMustBeCompleted || interviewMustBeCompletedOnBehalf) {
			setStartingOrCompletingInterview(false);
			$stateService.go('interview', {
				interviewId: step.interview?.id,
				fromState: $stateService.current?.name,
				fromStatus: $stateService.params?.status
			});
			return;
		}
	}

	return (
		<Stack vertical spacing="loose">
			{(step.focus || stepCanBeFinishedWithoutWaitingForOtherAssigneeInterviews) && (
				<Text medium size="medium">
					{stepCanBeFinishedWithoutWaitingForOtherAssigneeInterviews ? notSubmittedInterviewers : step.focus}
				</Text>
			)}
			{step.isCompleted ? (
				<>
					{step.canUndo && (
						<Button onClick={undoStep} block type="default">
							Undo Step
						</Button>
					)}
					{interviewMustBeCompleted && (
						<Button
							block
							disabled={startingOrCompletingInterview}
							type="primary"
							onClick={() => startOrContinueInterview()}
						>
							Interview
						</Button>
					)}
				</>
			) : (
				<Stack vertical spacing="loose">
					{mustActOnBehalf && <ActOnBehalf step={step} onAct={startOrContinueInterview} />}

					{
						<Stack vertical spacing="tight">
							<Schedule step={step} />
							{canExecuteStep && (
								<>
									{stepCanBeFinishedWithoutWaitingForOtherAssigneeInterviews && (
										<Button
											disabled={startingOrCompletingInterview}
											block
											type="primary"
											onClick={completeInterviewFinishedByOneOfAssignees}
										>
											Don’t wait and complete the interview
										</Button>
									)}
									{interviewCanBeStartedOrContinued && (
										<Button
											block
											type="primary"
											disabled={startingOrCompletingInterview}
											onClick={() => startOrContinueInterview()}
										>
											Interview
										</Button>
									)}
								</>
							)}
						</Stack>
					}
				</Stack>
			)}
		</Stack>
	);
}

function showEvaluatingByOtherUserModal(title: string) {
	confirm({
		title,
		icon: null,
		okText: 'Okay'
	});
}

function showInterviewHasAlreadyStartedModal(assigneeName: string, onOk:()=> void) {
	confirm({
		title: 'This interview has already started.',
		content: `If you choose to continue, you will delete the notes entered by: ${assigneeName}`,
		icon: null,
		okText: 'Delete evaluation',
		onOk
	});
}
