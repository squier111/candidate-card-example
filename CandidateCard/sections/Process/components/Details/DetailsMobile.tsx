import React, { useState } from 'react';
import { Card } from 'antd';

import { CandidateResourceAngular } from 'types/domain/candidate.types';

//components
import { DetailMobileSection } from './DetailMobileSection';
import { Stack } from 'components/common/Stack/Stack';
import { Details } from './Details';
import { Heading } from 'components/common/Typography/Heading';
import { ArrowsOutSimple, User } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { DrawerMobileComponent } from 'pages/Candidate/CandidateCard/layout/DrawerMobileComponent';

export type DetailsProps = {
	candidate: CandidateResourceAngular;
	gdprRequestProfile: () => void;
	gdprRequestConsent: () => void;
	readOnly?: boolean;
};

export function DetailsMobile({ candidate, gdprRequestProfile, gdprRequestConsent, readOnly }: DetailsProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Card
			size="small"
			headStyle={{ borderBottom: 'none' }}
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					<User weight="duotone" />
					<Heading level={4}>Details</Heading>
				</Stack>
			}
			extra={
				true && (
					<Button neutral type="link" onClick={() => setExpanded(true)} icon={<ArrowsOutSimple />}>
						Expand
					</Button>
				)
			}
		>
			<DetailMobileSection
				gdprRequestProfile={gdprRequestProfile}
				gdprRequestConsent={gdprRequestConsent}
				candidate={candidate}
			/>
			<DrawerMobileComponent
				drawerIcon={<User weight="duotone" />}
				title="Details"
				expanded={expanded}
				setExpanded={setExpanded}
			>
				<Details
					readOnly={readOnly}
					gdprRequestProfile={gdprRequestProfile}
					gdprRequestConsent={gdprRequestConsent}
					candidate={candidate}
				/>
			</DrawerMobileComponent>
		</Card>
	);
}
