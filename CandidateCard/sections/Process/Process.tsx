import React, { useMemo } from 'react';
import { Card } from 'antd';

// components
import { FileText, Star, Briefcase, User } from 'components/icons';
import { Details, DetailsProps } from './components/Details/Details';
import { Tag } from 'components/common/Tag/Tag';
import { Tabs } from 'components/common/Tabs/Tabs';
import { Application, ApplicationProps } from './components/Application/Application';
import { Evaluation, EvaluationProps } from './components/Evaluation/Evaluation';
import { Positions } from './components/Positions/Positions';

type ProcessProps = {} & DetailsProps & ApplicationProps & EvaluationProps;

function getEvaluationRankColor(count: number) {
	switch (true) {
		case count <= 2:
			return 'error';
		case count > 2 && count <= 3:
			return 'warning';
		default:
			return 'success';
	}
}

export default function Process({
	candidate,
	gdprRequestProfile,
	gdprRequestConsent,
	addLink,
	addFile,
	reloadLinks,
	reloadFiles,
	readOnly
}: ProcessProps) {
	const tabsData = useMemo(() => {
		const activeProcesses = candidate.otherProcesses.filter(function (process) {
			return process.isInProgress && process.isProcessAlive;
		});
		return [
			{
				id: 1,
				icon: <FileText />,
				title: 'Application',
				content: (
					<Application
						candidate={candidate}
						addLink={addLink}
						addFile={addFile}
						reloadLinks={reloadLinks}
						reloadFiles={reloadFiles}
					/>
				)
			},
			{
				id: 2,
				icon: <Star />,
				title: 'Evaluation',
				content: <Evaluation />,
				counter:
					candidate.canViewInterviews && candidate.averageRank ? (
						<Tag color={getEvaluationRankColor(candidate.averageRank)}>{candidate.averageRank.toFixed(1)}</Tag>
					) : null
			},
			{
				id: 3,
				icon: <Briefcase />,
				title: 'Positions',
				content: <Positions candidateId={candidate.id} />,
				counter:
					activeProcesses.length > 0 || candidate._.isInProgress ? (
						<Tag color="success">{candidate._.isInProgress ? activeProcesses.length + 1 : activeProcesses.length}</Tag>
					) : null
			},
			{
				id: 4,
				icon: <User />,
				title: 'Details',
				content: (
					<Details
						readOnly={readOnly}
						gdprRequestProfile={gdprRequestProfile}
						gdprRequestConsent={gdprRequestConsent}
						candidate={candidate}
					/>
				)
			}
		];
	}, [candidate, reloadLinks, reloadFiles]);

	return (
		<Card size="small" bordered={false}>
			<Tabs stickyProps={{ topOffset: -55 }} sticky defaultActiveKey="1" data={tabsData} size="middle" />
		</Card>
	);
}
