import React from 'react';
import { Typography } from 'antd';
import { Heading } from 'components/common/Typography/Heading';

//types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

const { Link } = Typography;

export type ProfilePositionProps = {
	candidate: CandidateResourceAngular;
};

export function ProfilePosition({ candidate }: ProfilePositionProps) {
	return (
		<Link href={`#/req/${candidate.requisitionId}`}>
			<Heading style={{ marginBottom: 0 }} level={4}>
				{candidate.requisitionName}
				{candidate.requisition.reqCompanyNumber && <span>{candidate.requisition.reqCompanyNumber}</span>}
			</Heading>
		</Link>
	);
}
