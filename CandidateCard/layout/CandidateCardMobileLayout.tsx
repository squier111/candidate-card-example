import React from 'react';

//components
import { Profile } from './../sections/Profile/Profile';
import { Activity } from './../sections/Activity/Activity';
import { Stack } from 'components/common/Stack/Stack';
import { ApplicationMobile } from './../sections/Process/components/Application/ApplicationMobile';
import { EvaluationMobile } from './../sections/Process/components/Evaluation/EvaluationMobile';
import { PositionsMobile } from './../sections/Process/components/Positions/PositionsMobile';
import { DetailsMobile } from './../sections/Process/components/Details/DetailsMobile';
import Duplicates from './../sections/Duplicates/Duplicates';
import WorkflowCardMobile from './../sections/Workflow/WorkflowCardMobile';

//local components
import { ProfileProps } from './../sections/Profile/Profile';
import { DuplicatesCallbackProps } from './../sections/Duplicates/Duplicates';
import { ApplicationProps } from './../sections/Process/components/Application/Application';
import { DetailsProps } from './../sections/Process/components/Details/Details';
import { CandidateStepResource } from 'types/domain/workflow.types';

type CandidateCardMobileProps = {} & ProfileProps & ApplicationProps & DuplicatesCallbackProps & DetailsProps;

export function CandidateCardMobileLayout({
	candidate,
	afterUpload,
	removeAvatar,
	moveReq,
	addToAnotherPosition,
	lookForDuplicates,
	printCandidateCard,
	sendBlankEmail,
	setStatus,
	setFavorite,
	requestExposure,
	addLink,
	addFile,
	reloadLinks,
	reloadFiles,
	gdprRequestProfile,
	gdprRequestConsent,
	readOnly,
	openResolveDuplicatesModal
}: CandidateCardMobileProps) {
	return (
		<>
			<Profile
				removeAvatar={removeAvatar}
				afterUpload={afterUpload}
				candidate={candidate}
				moveReq={moveReq}
				addToAnotherPosition={addToAnotherPosition}
				lookForDuplicates={lookForDuplicates}
				printCandidateCard={printCandidateCard}
				sendBlankEmail={sendBlankEmail}
				setStatus={setStatus}
				setFavorite={setFavorite}
				requestExposure={requestExposure}
			/>
			<Stack wrap={false} vertical spacing="loose">
				<ApplicationMobile
					candidate={candidate}
					addLink={addLink}
					addFile={addFile}
					reloadLinks={reloadLinks}
					reloadFiles={reloadFiles}
				/>
				<Activity expandable />
				{candidate.hasUnresolvedDuplications && true && (
					<Duplicates
						duplicatesCount={candidate.unresolvedDuplications?.totalCount}
						candidateId={candidate.id}
						openResolveDuplicatesModal={openResolveDuplicatesModal}
					/>
				)}
				<EvaluationMobile candidate={candidate} />
				<PositionsMobile candidateId={candidate.id} />
				<DetailsMobile
					readOnly={readOnly}
					gdprRequestProfile={gdprRequestProfile}
					gdprRequestConsent={gdprRequestConsent}
					candidate={candidate}
				/>
				<WorkflowCardMobile<CandidateStepResource> statusId={candidate.status} steps={candidate.stepSet} />
			</Stack>
		</>
	);
}
