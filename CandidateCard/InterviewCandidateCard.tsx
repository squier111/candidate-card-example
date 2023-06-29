import React, { useRef, useState } from 'react';
import { Row, Col } from 'antd';

//components
import { Profile } from './sections/Profile/Profile';
import Process from './sections/Process/Process';
import { Activity } from './sections/Activity/Activity';

//types
import { ApplicationProps } from './sections/Process/components/Application/Application';

//local components
import { ProfileProps } from './sections/Profile/Profile';
import { DuplicatesCallbackProps } from './sections/Duplicates/Duplicates';
import { DetailsProps } from './sections/Process/components/Details/Details';

export type CandidateCardProps = DuplicatesCallbackProps & ProfileProps & ApplicationProps & DetailsProps;

export function InterviewCandidateCard({
	candidate,
	readOnly,
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
	gdprRequestProfile,
	gdprRequestConsent,
	addLink,
	addFile,
	reloadLinks,
	reloadFiles
}: CandidateCardProps) {
	const processRef = useRef<HTMLDivElement>(null);

	return (
		<Row gutter={[16, 24]}>
			<Col span={24}>
				<Profile
					readOnly={readOnly}
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
			</Col>
			<Col span={24}>
				<Activity />
			</Col>
			<Col className="scroll" span={24} ref={processRef}>
				<Process
					readOnly={readOnly}
					addLink={addLink}
					addFile={addFile}
					reloadLinks={reloadLinks}
					reloadFiles={reloadFiles}
					gdprRequestProfile={gdprRequestProfile}
					gdprRequestConsent={gdprRequestConsent}
					candidate={candidate}
				/>
			</Col>
		</Row>
	);
}
