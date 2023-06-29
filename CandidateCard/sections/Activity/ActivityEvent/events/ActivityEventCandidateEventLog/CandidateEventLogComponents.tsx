import React from 'react';
import { Typography } from 'antd';

// hooks
import { useMessageTemplates } from 'hooks/angular/messageTemplates';
import { useSources } from 'hooks/angular/sources';
import { useCandidates } from 'hooks/angular/candidates';
import { goToCandidate } from 'hooks/angular/state';
import { UserResource } from 'types/domain/user.types';

import { Stack } from 'components/common/Stack/Stack';
import { MessageAvatar } from '../../../ActivityWidget/MessageParts';
import DOMPurify from 'dompurify';

// metadata
import { CandidateEventLogPayload, PotentialDuplication } from 'types/domain/activity.types';
import { ActivityEventCandidateEventLogTypesEnum as E } from 'metadata/activity/activity.meta';

// style
import * as S from '../../ActivityEvent.styled';

const { Text, Link } = Typography;

export type ActivityEventCandidateEventLogProps = {
	createdBy: UserResource;
	message: string;
	payload: CandidateEventLogPayload;
	timeCreated?: string;
};

function senderName(createdBy: UserResource, payload: CandidateEventLogPayload) {
	if (payload.filledByFullName) {
		if (createdBy.fullName) {
			return `${createdBy.fullName || payload.data.createdBy} (filled out by ${payload.filledByFullName})`;
		} else {
			return `(filled out by ${payload.filledByFullName})`;
		}
	} else {
		return `${createdBy.fullName || payload.data.createdBy || 'Comeet'}`;
	}
}

function usersList(arrayOfUsers: UserResource[]): string {
	return arrayOfUsers.map((user) => user.fullName).join(', ');
}

function createSentenceWithComasAndAnds(words: string[]): string {
	const preparedWords: string[] = words.filter((word: string) => word.length);
	let sentence: string = '';

	for (let i: number = 0; i < preparedWords.length; i++) {
		const word: string = preparedWords[i];

		if (i === preparedWords.length - 1) {
			sentence += word;
			continue;
		}

		if (i === preparedWords.length - 2) {
			sentence += word + ' and ';
			continue;
		}

		sentence += word + ', ';
	}

	return sentence;
}

function getMessageTimeCreated(time?: string) {
	return moment.min(moment(time), moment()).fromNow();
}

function sanitizeHtml(htmlString: string) {
	return (
		DOMPurify.sanitize(htmlString, {
			USE_PROFILES: {
				html: true
			}
		}) || '&mdash;'
	);
}

export const candidateEventLogComponents: {
	[key in E]: React.ComponentType<ActivityEventCandidateEventLogProps>;
} = {
	[E.CHANGE_STATUS]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} changed candidate's status</S.ActivityEventInline>
	),

	[E.ADDED_BY_MAIL]: ({ createdBy, message }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} {message}
		</S.ActivityEventInline>
	),

	[E.SEND_MAIL]: ({ createdBy, payload }) => {
		const messageTemplateService = useMessageTemplates();
		function messageReceivedBy(payload: CandidateEventLogPayload) {
			if (!payload.to.length) {
				throw new Error('payload.to is an empty array');
			}

			const firstPayloadReveiver = payload.to[0];

			if (firstPayloadReveiver.receiverRoles.length) {
				return messageTemplateService.receivers.data[firstPayloadReveiver.receiverRoles[0]].nameInEventLog;
			} else {
				return firstPayloadReveiver.fullName || firstPayloadReveiver.email;
			}
		}

		return (
			<S.ActivityEventInline>
				{!payload.is_pending &&
					!payload.is_failure &&
					`${senderName(createdBy, payload)} sent email to ${messageReceivedBy(payload)}`}
			</S.ActivityEventInline>
		);
	},

	[E.APPLY_CAREER_WEBSITE_REFERRAL]: ({ createdBy, payload }) => {
		const sourcesService = useSources();

		function referredBy(payload: CandidateEventLogPayload) {
			if (
				payload.referralMedium != sourcesService.socialNetworks.enumId.LINK &&
				payload.referralMedium != sourcesService.socialNetworks.enumId.JOBBOARD
			) {
				return `via ${sourcesService.socialNetworks.data[payload.referralMedium].name}`;
			} else if (payload.referralCampaign !== null) {
				return `(campaign: ${payload.referralCampaign})`;
			} else {
				return 'and submitted application via careers website';
			}
		}

		return (
			<S.ActivityEventInline>
				Was referred by {createdBy.fullName || payload.data.createdBy} {referredBy(payload)}
			</S.ActivityEventInline>
		);
	},

	[E.APPLY_CAREER_WEBSITE]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} submitted application via {payload.jobboardName || 'careers website'}
		</S.ActivityEventInline>
	),

	[E.UPDATE_CAREER_WEBSITE]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy
				? `${createdBy.fullName} submitted this candidate via the careers website. Candidate details were updated`
				: `${payload.sourceContactName} applied again via the careers website. Details were updated`}
		</S.ActivityEventInline>
	),

	[E.DELETE_DUPLICATION]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} deleted duplicate that was submitted by: {payload.source || payload.sourceContact}
		</S.ActivityEventInline>
	),

	[E.RESLOVE_DUPLICATION]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} decided the candidate is not a duplicate of
			{payload.potentialCandidateIsActive
				? `${(
						<Link onClick={() => goToCandidate(payload.potentialCandidateReqId, payload.potentialCandidateId)}>
							{payload.potentialCandidateFullName}
						</Link>
				  )}`
				: `${payload.potentialCandidateFullName}`}
		</S.ActivityEventInline>
	),

	[E.MERGED_DUPLICATION]: ({ createdBy, payload }) => {
		function haveNoPotentialDuplications(mergedCount: number, potentialCount: number) {
			if (mergedCount === 0) {
				return potentialCount === 1 ? 'one possible duplicate' : `${potentialCount} possible duplicates`;
			}

			return mergedCount === 1 ? 'one duplicate' : `${mergedCount} duplicates`;
		}

		function havePotentialDuplications(potentialDuplications: PotentialDuplication[]) {
			return potentialDuplications.map((duplicate: PotentialDuplication) =>
				duplicate.canSeeCandidate ? (
					<Link onClick={() => goToCandidate(duplicate.potentialCandidateReqId, duplicate.potentialCandidateId)}>
						{duplicate.potentialCandidateFullName}
					</Link>
				) : (
					<Text>Undisclosed candidate</Text>
				)
			);
		}

		return (
			<S.ActivityEventInline>
				{createdBy.fullName}{' '}
				{payload.candidatesMergedCount === 0 ? 'decided the candidate is not a duplicate of' : 'merged candidate with'}{' '}
				{payload.potentialDuplications
					? havePotentialDuplications(payload.potentialDuplications)
					: haveNoPotentialDuplications(payload.candidatesMergedCount, payload.potentialDuplicationsCount)}
			</S.ActivityEventInline>
		);
	},

	[E.DELETE_DUPLICATION_V2]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} deleted duplicate that was submitted by: {payload.sourceName || payload.sourceContactName}
		</S.ActivityEventInline>
	),

	[E.ADDED_LINK]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} added link:{' '}
			<Link href={payload.link} title={payload.link}>
				{payload.link}
			</Link>
		</S.ActivityEventInline>
	),

	[E.INTERVIEW_SCHEDULED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} scheduled: {payload.stepName ? payload.stepName : 'Interview'} for{' '}
			{usersList(payload.interviewers)}{' '}
			{payload.timeScheduled ? `for ${moment(payload.timeScheduled).format('MMM D, YYYY')}` : ''}
			<br />
			{payload.schedulingNote && `${payload.schedulingNote}`}
			{payload.schedulingNoteLink && `${payload.schedulingNoteLink}`}
		</S.ActivityEventInline>
	),

	[E.INTERVIEW_RESCHEDULED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} rescheduled: {payload.stepName ? payload.stepName : 'Interview'} for{' '}
			{usersList(payload.interviewers)}{' '}
			{payload.timeScheduled ? `to ${moment(payload.timeScheduled).format('MMM D, YYYY')}` : ''}
			<br />
			{payload.schedulingNote && `${payload.schedulingNote}`}
			{payload.schedulingNoteLink && `${payload.schedulingNoteLink}`}
		</S.ActivityEventInline>
	),

	[E.INTERVIEW_CANCELED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} canceled: {payload.stepName ? payload.stepName : 'Interview'} for{' '}
			{usersList(payload.interviewers)}{' '}
			{payload.timeScheduled ? `for ${moment(payload.timeScheduled).format('MMM D, YYYY')}` : ''}
			<br />
			{payload.schedulingNote && `${payload.schedulingNote}`}
			{payload.schedulingNoteLink && `${payload.schedulingNoteLink}`}
		</S.ActivityEventInline>
	),

	[E.MOVED_POSITION_V2]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} moved candidate from position: {payload.fromReqName} to {payload.toReqName}
		</S.ActivityEventInline>
	),

	[E.AUTO_DELETE_DUPLICATION]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)} automatically archived a duplicate application from $
			{payload.sourceName || payload.sourceContactName}$
			{payload.positionName ? `for the position ${payload.positionName}` : ''}
		</S.ActivityEventInline>
	),

	[E.ARCHIVED_DUPLICATION]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)} automatically archived a duplicate application from $
			{payload.sourceName || payload.sourceContactName}$
			{payload.positionName ? `for the position ${payload.positionName}` : ''}
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_ADDED_MANUALY]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName}{' '}
			{!payload.importedFrom ? 'added candidate' : `imported candidate from: ${payload.importedFrom}`}
		</S.ActivityEventInline>
	),

	[E.APPLY_QUESTIONNAIRE_PAGE]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} filled questionnaire {payload.questionnaireNames.length > 1 ? 's' : ''}:{' '}
			{payload.questionnaireNames.join(', ')}
		</S.ActivityEventInline>
	),

	[E.APPLY_QUESTIONNAIRE_IN_FORM]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} filled questionnaire {payload.questionnaireNames.length > 1 ? 's' : ''}:{' '}
			{payload.questionnaireNames.join(', ')}
		</S.ActivityEventInline>
	),

	[E.CREATE_IN_HRIS]: ({ createdBy, payload }) => {
		return (
			<S.ActivityEventInline>
				{payload.hrisName == 'Webhook'
					? `${createdBy.fullName} added candidate to Talent Management System (via custom integration)`
					: `${createdBy.fullName} added candidate to ${payload.hrisName}`}
			</S.ActivityEventInline>
		);
	},

	[E.UNDO_STEP]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} selected to undo the step: {payload.stepName}
		</S.ActivityEventInline>
	),

	[E.ADD_FROM_CHROME_EXT]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} created candidate via chrome extension</S.ActivityEventInline>
	),

	[E.PERSON_TAG_ADDED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} added {payload.tags.length > 1 ? 'tags' : 'tag'}:{' '}
			{createSentenceWithComasAndAnds(payload.tags)}
		</S.ActivityEventInline>
	),

	[E.PERSON_TAG_REMOVED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} removed {payload.tags.length > 1 ? 'tags' : 'tag'}: $
			{createSentenceWithComasAndAnds(payload.tags)}
		</S.ActivityEventInline>
	),

	[E.ADD_PARTICIPANT]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} added {usersList(payload.interviewers)} to {payload.stepName}
		</S.ActivityEventInline>
	),

	[E.REMOVE_PARTICIPANT]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} removed {usersList(payload.interviewers)} from {payload.stepName}
		</S.ActivityEventInline>
	),

	[E.NOT_SEND_NOTIFICATION]: ({ createdBy, payload }) => {
		const messageTemplateService = useMessageTemplates();
		const usedTemplate = messageTemplateService.events.get(payload.templateEvent);

		return (
			<S.ActivityEventInline>
				{createdBy.fullName} decided not to send notification to{' '}
				{messageTemplateService.receivers.get(payload.receiver).nameInEventLog.toLowerCase()}
				{usedTemplate ? `: ${usedTemplate.name}` : ''}
			</S.ActivityEventInline>
		);
	},

	[E.LOADED_EVENT]: ({ payload, createdBy, timeCreated }) => (
		<S.ActivityEventBox>
			<Stack wrap={false}>
				<MessageAvatar imageUrl={createdBy.picThumbUrl} />

				<Stack.Item fill>
					<Stack vertical spacing="tight">
						<Stack vertical spacing="none">
							<Text type="secondary">{createdBy.fullName || payload.name}</Text>
							<Text type="secondary">{getMessageTimeCreated(timeCreated)}</Text>
						</Stack>
						<Stack spacing="extraLoose" vertical>
							{payload.meta.map((item) => {
								return (
									<Stack.Item fill>
										<Stack vertical spacing="none">
											<Text type="secondary">{item.name}</Text>
											<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.value) }} />
										</Stack>
									</Stack.Item>
								);
							})}
						</Stack>
					</Stack>
				</Stack.Item>
			</Stack>
		</S.ActivityEventBox>
	),

	[E.UPDATE_INDEED]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} updated application via Indeed</S.ActivityEventInline>
	),

	[E.CANDIDATE_AUTO_PSEUDONYMIZED]: () => (
		<S.ActivityEventInline>Comeet pseudonymnized candidate profile based on company settings</S.ActivityEventInline>
	),

	[E.CANDIDATE_PSEUDONYMIZED]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} pseudonymized candidate profile</S.ActivityEventInline>
	),

	[E.CANDIDATE_OPT_OUT_FROM_EMAIL]: () => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();
		return (
			<S.ActivityEventInline>
				{currentCandidate.fullName} did not consent to have their data retained
			</S.ActivityEventInline>
		);
	},

	[E.CANDIDATE_CONSENT_FROM_EMAIL]: () => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();
		return <S.ActivityEventInline>{currentCandidate.fullName} gave consent to retain their data</S.ActivityEventInline>;
	},

	[E.CANDIDATE_CONSENT_FROM_CAREER_PAGE]: () => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();
		return <S.ActivityEventInline>{currentCandidate.fullName} gave consent to retain their data</S.ActivityEventInline>;
	},

	[E.GDPR_DS_SETTINGS_CHANGED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.GDPR_DS_TYPE_CHANGED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.GDPR_DS_CANDIDATE_CREATED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.GDPR_DS_CANDIDATE_REQUISITION_CHANGED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.INTERNAL_MOBILITY]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} specified that the candidate was an internal hire. A new employee was not created in{' '}
			{payload.hrisName}
		</S.ActivityEventInline>
	),

	[E.GDPR_DS_POSITION_LOCATION_CHANGED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_OPT_OUT_MANUALLY]: ({ createdBy }) => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();

		return (
			<S.ActivityEventInline>
				{createdBy.fullName} specified that {currentCandidate.fullName} withdrew previously given consent to retain
				their data
			</S.ActivityEventInline>
		);
	},

	[E.CANDIDATE_CONSENT_MANUALLY]: ({ createdBy }) => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();

		return (
			<S.ActivityEventInline>
				{createdBy.fullName} specified that {currentCandidate.fullName} gave consent to retain their data
			</S.ActivityEventInline>
		);
	},

	[E.GDPR_DS_CANDIDATE_STATUS_CHANGED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)}{' '}
			{payload.isDataSubject
				? 'candidate is specified as subject to GDPR'
				: 'candidate is specified to not be a subject to GDPR'}
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_AUTO_DELETED_DURING_PSEUDONYMIZATION]: ({ createdBy }) => {
		return (
			<S.ActivityEventInline>
				{createdBy.fullName} deleted candidate in accordance with Automatic data removal settings
			</S.ActivityEventInline>
		);
	},

	[E.CANDIDATE_DS_SET_MANUALLY]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)} specified candidate is individually subject to GDPR
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_DS_REMOVE_MANUALLY]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)} specified candidate is not individually subject to GDPR (candidate is still
			subject to GDPR according to company settings)
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_DS_REMOVED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{senderName(createdBy, payload)} specified candidate is not individually subject to GDPR
		</S.ActivityEventInline>
	),

	[E.OFFER_LETTER_SIGNED_BY_CANDIDATE]: () => {
		const candidateService = useCandidates();
		const currentCandidate = candidateService.getCurrent();

		return <S.ActivityEventInline>{currentCandidate.fullName} signed offer letter</S.ActivityEventInline>;
	},

	[E.OFFER_LETTER_SIGNED_BY_TEAMMATE]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} signed offer letter</S.ActivityEventInline>
	),

	[E.STEP_APPROVED]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} approved step {payload.filledBy ? `– filled by ${payload.filledBy.fullName}` : ''}
		</S.ActivityEventInline>
	),

	[E.STEP_REJECTED]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} didn't approve step</S.ActivityEventInline>
	),

	[E.RESUME_REMOVED]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} deleted a resume due to security restrictions</S.ActivityEventInline>
	),

	[E.ATTACHMENT_REMOVED]: ({ createdBy }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} deleted an attachment due to security restrictions
		</S.ActivityEventInline>
	),

	[E.CANDIDATE_ADDED_VIA_API]: ({ createdBy }) => (
		<S.ActivityEventInline>{createdBy.fullName} added candidate (via API)</S.ActivityEventInline>
	),

	[E.CANDIDATE_SEND_TO_TEST]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} sent the test {Object.values(payload.testNames).join(', ')} to candidate{' '}
			{payload.filledBy && payload.filledBy.id && payload.filledBy.id != payload.assignedTo.id} (sent by{' '}
			{payload.filledBy.fullName})
		</S.ActivityEventInline>
	),

	[E.STARTED_NEW_HIRING_PROCESS]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} started a new hiring process{' '}
			{payload.requisitionName ? `for position: ${payload.requisitionName}` : ''}
		</S.ActivityEventInline>
	),

	[E.HIRED_IN_OTHER_POSITION]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} changed candidate's status to hired for {payload.requisitionName}
		</S.ActivityEventInline>
	),

	[E.KEEP_PROCESS_DURING_DUPLICATE_RESOLVE]: ({ createdBy, message }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} {message}
		</S.ActivityEventInline>
	),

	[E.STOP_PROCESS_DURING_DUPLICATE_RESOLVE]: ({ createdBy }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} resolved duplicate applications and stopped the hiring process
		</S.ActivityEventInline>
	),

	[E.RESOLVE_NOT_DUPLICATE_OF]: ({ createdBy, payload }) => (
		<S.ActivityEventInline>
			{createdBy.fullName} resolved duplicate applications and indicated that this candidate is not a duplicate of
			{!payload.canSeeCandidate ? (
				'Undisclosed candidate'
			) : (
				<Link onClick={() => goToCandidate(payload.potentialCandidateReqId, payload.potentialCandidateId)}>
					{payload.potentialCandidateFullName}
				</Link>
			)}
		</S.ActivityEventInline>
	),

	[E.INTERVIEW_SELF_SCHEDULED]: ({ payload }) => {
		const addedInterviewers = payload.interviewers.reduce(
			(accum: string[], interviewer) => (accum.push(interviewer.fullName), accum),
			[]
		);
		return (
			<S.ActivityEventInline>
				Candidate selected a time for {payload.stepName} with {addedInterviewers.join(', ')}
			</S.ActivityEventInline>
		);
	},

	[E.CANDIDATE_UPDATED_BY_SOURCE_API]: ({ createdBy, payload }) => {
		let updatedByOther = false;
		let updatedByApp = false;

		if (payload.name) {
			updatedByOther = true;
		} else if (!payload.name && payload.partnerName) {
			updatedByApp = true;
		}
		return (
			<S.ActivityEventInline>
				{createdBy && `${createdBy.fullName}`}
				{updatedByOther && `${payload.name}`}
				{updatedByApp && `${payload.partnerName}`}
				{!updatedByApp && `${payload.partnerName}` && `(via ${payload.partnerName})`}
			</S.ActivityEventInline>
		);
	},

	[E.UPDATED_PHONE_BY_CANDIDATE]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.CANDIDATE_NOTE_ADDED_BY_SOURCE_API]: ({ payload, createdBy, timeCreated }) => (
		<S.ActivityEventBox>
			<Stack wrap={false}>
				<MessageAvatar imageUrl={createdBy.picThumbUrl} />

				<Stack.Item fill>
					<Stack vertical spacing="tight">
						<Stack vertical spacing="none">
							<Text type="secondary">{createdBy.fullName || payload.name}</Text>
							<Text type="secondary">{getMessageTimeCreated(timeCreated)}</Text>
						</Stack>
						<Stack spacing="extraLoose" vertical>
							{payload.meta.map((item) => {
								return (
									<Stack.Item fill>
										<Stack vertical spacing="none">
											<Text type="secondary">{item.name}</Text>
											<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.value) }} />
										</Stack>
									</Stack.Item>
								);
							})}
						</Stack>
					</Stack>
				</Stack.Item>
			</Stack>
		</S.ActivityEventBox>
	),

	[E.OFFER_LETTER_GENERATED]: ({ createdBy, payload, timeCreated }) => {
		const orderedListOfAttributes = [...payload.approveAttributes, ...payload.attributes].sort((a, b) =>
			a.name > b.name ? 1 : -1
		);

		return (
			<S.ActivityEventBox>
				<Stack wrap={false}>
					<MessageAvatar imageUrl={createdBy.picThumbUrl} />

					<Stack.Item fill>
						<Stack vertical spacing="extraLoose">
							<Stack vertical spacing="none">
								<Text type="secondary">{createdBy.fullName}</Text>
								<Text type="secondary">{getMessageTimeCreated(timeCreated)}</Text>
							</Stack>

							<Stack spacing="tight" vertical>
								<Text type="secondary">Offer template</Text>
								<Text strong>{payload.templateName}</Text>
							</Stack>

							{payload.attributes.map((item) => (
								<Stack spacing="tight" vertical key={item.name}>
									<Text type="secondary">{item.name}</Text>
									<Text strong>{item.value}</Text>
								</Stack>
							))}

							{(payload.approveAttributes.length || payload.attributes.length) && (
								<Stack spacing="tight" vertical>
									<Text strong>Details for internal approval only</Text>
									{orderedListOfAttributes.map((attribute) => (
										<Stack spacing="tight" vertical key={attribute.name}>
											<Text type="secondary">{attribute.name}</Text>
											<Text strong>{attribute.value}</Text>
										</Stack>
									))}
								</Stack>
							)}
						</Stack>
					</Stack.Item>
				</Stack>
			</S.ActivityEventBox>
		);
	},

	[E.EVALUATION_UPDATE_BY_ASSESSMENT_TOOL]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.LOADED_COMMENT]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.LOADED_EMAIL_MESSAGE]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.CANDIDATE_ADDED_FROM_EXTENSION]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.CANDIDATE_REVIVED]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>,

	[E.REVIVE]: ({ message }) => <S.ActivityEventInline>{message}</S.ActivityEventInline>
};
