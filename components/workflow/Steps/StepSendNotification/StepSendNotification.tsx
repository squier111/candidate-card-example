import React, { useState } from 'react';

// components
import { ActOnBehalf } from '../components/ActOnBehalf';
import { Stack } from 'components/common/Stack/Stack';
import { Button } from 'components/common/Button/Button';
import { EmailComposer, EmailComposerApi } from '../../../common/EmailComposer/EmailComposer';

//meta
import { StepTypesEnum } from 'metadata/candidate/workflow.meta';

//types
import { CandidateStepResource, StepAssigneeResource } from 'types/domain/workflow.types';

//hooks
import { useRequisitionsStepStatic } from 'hooks/angular/requisition-steps-static';
import { UserResource } from 'types/domain/user.types';
import { useCandidates } from 'hooks/angular/candidates';
import { useUsers } from 'hooks/angular/users';
import { useCompleteStepCallback } from 'hooks/workflow/useCompleteStepCallback';

type StepSendNotificationProps = {
	step: CandidateStepResource;
};

export function StepSendNotification({ step }: StepSendNotificationProps) {
	const userService = useUsers();
	const candidateService = useCandidates();
	const { types } = useRequisitionsStepStatic();
	const completeStep = useCompleteStepCallback(step);

	const currentCandidate = candidateService.getCurrent();
	const currentUser = userService.getCurrent();

	const [isMessageLoading, setIsMessageLoading] = useState(false);
	const [completing, setCompleting] = useState(false);
	const [emailComposerApi, setEmailComposerApi] = useState<EmailComposerApi | null>(null);
	const [actingOnBehalf, setActingOnBehalf] = useState<StepAssigneeResource['candidateStepId'] | undefined>();

	const stepIsAssignedToUser = !!step.assignedTo.find(function (user) {
		return user.id === currentUser.id;
	});

	const mustActOnBehalf =
		!stepIsAssignedToUser && currentCandidate.userPermissions.fillOnBehalf && types[step.stepType].allowOnBehalf;

	function doNotSend() {
		setCompleting(true);

		completeStep({
			proceed: true,
			forStep: actingOnBehalf,
			sendmessages: emailComposerApi!.dontSend(true)
		});
	}

	function send() {
		setCompleting(true);

		const isMessageValid = emailComposerApi!.isValid();

		if (!isMessageValid) {
			emailComposerApi!.handleInvalid();
			setCompleting(false);
			return;
		}

		completeStep({
			proceed: true,
			forStep: actingOnBehalf,
			sendmessages: emailComposerApi!.send<object>(true)
		});
	}

	return (
		<Stack vertical spacing="loose">
			{(stepIsAssignedToUser || (mustActOnBehalf && actingOnBehalf)) && (
				<>
					<EmailComposer
						mailAction={{ id: step.id, parentId: currentCandidate.id }}
						discussionContext={{ type: 'step', id: step.id }}
						showTemplate={true}
						showMinimizedToolbarForEmailBody={true}
						onIsLoadingChange={setIsMessageLoading}
						onApiChange={setEmailComposerApi}
					/>
				</>
			)}
			{mustActOnBehalf && (
				<>
					{actingOnBehalf ? (
						<Button block onClick={() => setActingOnBehalf(undefined)}>
							Cancel on behalf
						</Button>
					) : (
						<ActOnBehalf step={step} onAct={setActingOnBehalf} />
					)}
				</>
			)}
			{(stepIsAssignedToUser || (mustActOnBehalf && actingOnBehalf)) && (
				<Stack vertical>
					<Button block disabled={isMessageLoading || completing} onClick={doNotSend}>
						Don't send
					</Button>
					<Button block type="primary" disabled={isMessageLoading || completing} onClick={send}>
						{emailComposerApi?.sendLater ? 'Schedule to send' : 'Send'}
					</Button>
				</Stack>
			)}
		</Stack>
	);
}
