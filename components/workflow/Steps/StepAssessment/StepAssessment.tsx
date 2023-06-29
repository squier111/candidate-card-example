import React, { useState, useEffect } from 'react';
import { Input, Alert, Modal } from 'antd';

// components
import { ActOnBehalf } from '../components/ActOnBehalf';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Text } from 'components/common/Typography/Text';
import { AssessmentTest } from './views/AssessmentTest';
import { AssessmentError, AssessmentErrorModal } from './views/AssessmentErrorModal';


// metadata
import { UserActionEnum } from 'metadata/candidate/workflow.meta';

// hooks
import { useAssessments } from 'hooks/angular/assessments';
import { useCandidateSteps } from 'hooks/angular/candidate-steps';
import { useTrackEvents } from 'hooks/angular/track-events';
import { useCompleteStepCallback } from 'hooks/workflow/useCompleteStepCallback';

//types
import { StepAssigneeResource, Partners } from 'types/domain/workflow.types';
import { useCandidates } from 'hooks/angular/candidates';
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { AssessmentTestProps } from './views/AssessmentTest';

type StepAssessmentProps = {
} & AssessmentTestProps;

const { confirm } = Modal;

export function StepAssessment({ step, allSteps }: StepAssessmentProps) {
	const [actingOnBehalf, setActingOnBehalf] = useState<undefined | StepAssigneeResource['candidateStepId']>();
	const [comment, setComment] = useState('');
	const [startingAssessment, setStartingAssessment] = useState(false);
	const [currentAssessmentPartner, setCurrentAssessmentPartner] = useState<Partners>();
	const [assessmentPartnerError, setAssessmentPartnerError] = useState<any>();
	const [toggleAssessmentErrorModal, setToggleAssessmentErrorModal] = useState(false);
	const [assessmentModalErrorMessage, setAssessmentModalErrorMessage] = useState<AssessmentError>();
	const [assessmentErrors, setAssessmentErrors] = useState(false);

	const completeStep = useCompleteStepCallback(step);

	const { types } = useRequisitionsStepStatic();
	const candidateService = useCandidates();
	const currentCandidate = candidateService.getCurrent();
	const assessmentsService = useAssessments();
	const candidateStepsService = useCandidateSteps();
	const trackEventsService = useTrackEvents();

	const canSendCandidateToEvaluation = currentCandidate.userPermissions.sendCandidateToEvaluation;

	const mustActOnBehalf =
		currentCandidate.userPermissions.fillOnBehalf &&
		types[step.stepType].allowOnBehalf &&
		step.userAction === UserActionEnum.DO_NOTHING;

	const canExecuteStep = step.userAction === UserActionEnum.EXECUTE_STEP;

	const readyForAssessment = step.assessmentData?.status === assessmentsService.assessmentStatus.enumId.READY;
	const sendAssessment = step.assessmentData?.status === assessmentsService.assessmentStatus.enumId.SEND;

	const actOfBehalfHandler = (candidateStepId: StepAssigneeResource['candidateStepId']) => {
		setActingOnBehalf(candidateStepId);
	};
	const CANDIDATE_MISSING_PARTNER_REQUIRED_FIELDS = 'CANDIDATE_MISSING_PARTNER_REQUIRED_FIELDS';

	const startAssessment = () => {
		setStartingAssessment(true);
		setAssessmentErrors(false);

		assessmentsService
			.query()
			.$promise.then((partners) => {
				const currentAssessmentPartner = partners.find(
					(partner: Partners) => partner.id === step.assessmentData?.assessmentPartnerId
				);
				setCurrentAssessmentPartner(currentAssessmentPartner);

				const requiredFields = currentAssessmentPartner?.integrationSettings?.requiredFieldsForSubmission;

				const isRequiredPhoneMissed = requiredFields?.includes('phone') && !currentCandidate.fullPhone;
				const isRequiredEmailMissed = requiredFields?.includes('email') && !currentCandidate.email;
				if (isRequiredEmailMissed || isRequiredPhoneMissed) {
					return Promise.reject({
						name: CANDIDATE_MISSING_PARTNER_REQUIRED_FIELDS,
						email: isRequiredEmailMissed,
						phone: isRequiredPhoneMissed
					});
				}
			})
			.then(() => {
				candidateStepsService.sendToAssessment({ parentId: step.candidateId, id: step.id }).$promise.then((data) => {
					// Trigger for update component will be here
					setStartingAssessment(false);
				});
			})
			.catch((error) => {
				setAssessmentErrors(true);
				setStartingAssessment(false);
				// client error
				if (error.name === CANDIDATE_MISSING_PARTNER_REQUIRED_FIELDS) {
					showPartnerRequiredFieldsMissingModal(error);
					return;
				}

				// server errors
				if (error?.data?.code === 440) {
					// Previosly we ste step.assessmentData.status = assessmentsService.assessmentStatus.enumId.FAILED to display Resend button instead of Send
					// This error was handled by ErrorNotification in angular http interceptor
					return;
				}

				if (error?.data?.code === 527) {
					showTestsQuotaLimitExceededModal(() =>
						trackEventsService.showNewMessage("I'd like to expand my subscription for Interview AI")
					);
					return;
				}
				setAssessmentPartnerError(error);

			});
	};

	useEffect(() => {
		if (currentAssessmentPartner && assessmentPartnerError) {

			setAssessmentModalErrorMessage({
				provider: currentAssessmentPartner,
				error: assessmentPartnerError.data
			});

			setToggleAssessmentErrorModal(true);
		}
	}, [currentAssessmentPartner, assessmentPartnerError]);

	return (
		<>
			<AssessmentErrorModal
				isOpen={toggleAssessmentErrorModal}
				assessment={assessmentModalErrorMessage}
				isModalClose={() => setToggleAssessmentErrorModal(false)}
			/>
			<Stack vertical spacing="loose">
				<Text medium size="medium">
					{step.focus}
				</Text>
				{!step.isCompleted && (
					<>
						{readyForAssessment && (
							<Stack vertical spacing="loose">
								{mustActOnBehalf && step.isCurrentStep && (
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
								<Stack vertical spacing="tight">
									<AssessmentTest step={step} allSteps={allSteps} />
									{(canExecuteStep || actingOnBehalf) && (
										<Button
											onClick={startAssessment}
											disabled={step.testsInfo?.length === 0 || startingAssessment}
											block
											type="primary"
										>
											{assessmentErrors ? 'Resend assessment' : 'Start assessment'}
										</Button>
									)}
								</Stack>
							</Stack>
						)}

						{sendAssessment && step.isCurrentStep && (
							<Stack vertical spacing="loose">
								{!actingOnBehalf && mustActOnBehalf && <ActOnBehalf step={step} onAct={actOfBehalfHandler} />}
								<Alert
									showIcon
									message="This step will be marked as complete when the assessment if finished"
									type="warning"
								/>
								{canSendCandidateToEvaluation && (
									<Stack vertical spacing="loose">
										<Input onChange={(e) => setComment(e.target.value)} placeholder="Write a comment..." />
										<Button
											onClick={() => completeStep({ furtherReview: comment, forStep: actingOnBehalf, proceed: true })}
											block
											type="primary"
										>
											Mark as completed
										</Button>
									</Stack>
								)}
							</Stack>
						)}
					</>
				)}
			</Stack>
		</>
	);
}

function showPartnerRequiredFieldsMissingModal({email, phone}: {email:string, phone: string}) {
	confirm({
		title: `No ${email ? 'email' : ''}${email && phone ? ' and ' : ''}${
			phone ? 'mobile number' : ''
		} specified for this candidate, please update profile and try again.`,
		icon: null,
		okText: 'Okay',
	});
}


function showTestsQuotaLimitExceededModal(onOk: () => void) {
	confirm({
		title: 'AI-Graded Interviews limit reached',
		content: 'Purchase more credits to have more candidates assessed for your position.',
		icon: null,
		okText: 'Contact us',
		cancelText: 'Cancel',
		onOk
	});
}
