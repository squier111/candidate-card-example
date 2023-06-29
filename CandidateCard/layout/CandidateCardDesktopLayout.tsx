import React, { useState } from 'react';
import { Row, Col, Grid } from 'antd';

//components/
import { Profile } from './../sections/Profile/Profile';
import WorkflowCard from 'pages/Candidate/CandidateCard/sections/Workflow/WorkflowCard';
import AngularWorkflow from 'components/workflow/AngularWorkflow';
import Process from './../sections/Process/Process';
import { Activity } from './../sections/Activity/Activity';
import Duplicates from './../sections/Duplicates/Duplicates';
import { WorkflowMinimized } from 'components/workflow/WorkflowMinimized';

//types
import { CandidateStepResource } from 'types/domain/workflow.types';
import { ApplicationProps } from './../sections/Process/components/Application/Application';

//local components
import { ProfileProps } from './../sections/Profile/Profile';
import { DuplicatesCallbackProps } from './../sections/Duplicates/Duplicates';
import { DetailsProps } from './../sections/Process/components/Details/Details';

const { useBreakpoint } = Grid;

export type CandidateCardProps = DuplicatesCallbackProps & ProfileProps & ApplicationProps & DetailsProps;

export function CandidateCardDesktopLayout({
	candidate,
	openResolveDuplicatesModal,
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
	const [workflowMinimized, setWorkflowMinimized] = useState<boolean>(
		JSON.parse(localStorage.getItem('workflowMinimized') || '{}')
	);

	const screens = useBreakpoint();

	return (
		<Row gutter={[16, 24]}>
			<Col span={24}>
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
			</Col>
			{!workflowMinimized && (
				<Col sm={{ span: 24, order: 0 }} xl={{ span: 24, order: 0 }}>
					<WorkflowCard
						stepSet={candidate.stepSet}
						isMinimized={workflowMinimized}
						onToggleMinimize={() => {
							localStorage.setItem('workflowMinimized', 'true');
							setWorkflowMinimized(true);
						}}
					>
						<AngularWorkflow />
					</WorkflowCard>
				</Col>
			)}
			<Col span={24}>
				<Row gutter={[16, 24]} wrap={screens.xl ? false : true}>
					<Col flex={screens.xl ? `auto` : undefined} sm={{ span: 24, order: 2 }} xl={{ order: 0 }}>
						<Process
							addLink={addLink}
							addFile={addFile}
							reloadLinks={reloadLinks}
							reloadFiles={reloadFiles}
							gdprRequestProfile={gdprRequestProfile}
							gdprRequestConsent={gdprRequestConsent}
							candidate={candidate}
						/>
					</Col>
					<Col flex={screens.xl ? `360px` : undefined} sm={{ span: 24, order: 1 }} xl={{ order: 0 }}>
						<Row gutter={[16, 24]}>
							{workflowMinimized && (
								<Col sm={{ span: 12, order: 1 }} xl={{ span: 24, order: 0 }}>
									<WorkflowCard
										stepSet={candidate.stepSet}
										isMinimized={workflowMinimized}
										onToggleMinimize={() => {
											localStorage.setItem('workflowMinimized', 'false');
											setWorkflowMinimized(false);
										}}
									>
										<WorkflowMinimized<CandidateStepResource>
											steps={candidate.stepSet}
											isMinimized={workflowMinimized}
											setWorkflowMinimized={setWorkflowMinimized}
										/>
									</WorkflowCard>
								</Col>
							)}
							{candidate.hasUnresolvedDuplications && (
								<Col sm={{ span: 24, order: 3 }} xl={{ span: 24, order: 0 }}>
									<Duplicates
										duplicatesCount={candidate.unresolvedDuplications?.totalCount}
										candidateId={candidate.id}
										openResolveDuplicatesModal={openResolveDuplicatesModal}
									/>
								</Col>
							)}
							<Col
								sm={{ span: workflowMinimized ? 12 : 24, order: workflowMinimized ? 0 : 4 }}
								xl={{ span: 24, order: 0 }}
							>
								<Activity expandable />
							</Col>
						</Row>
					</Col>
				</Row>
			</Col>
		</Row>
	);
}
