import React, { useState } from 'react';
import { Card } from 'antd';

//components
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import { ArrowsOutSimple, Briefcase } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { DrawerMobileComponent } from 'pages/Candidate/CandidateCard/layout/DrawerMobileComponent';

// libs
import { AngularTemplate } from 'bridge/angular-bridge';

export type PositionsProps = {
	candidateId: number;
};

export function PositionsMobile({ candidateId }: PositionsProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<Card
			size="small"
			bodyStyle={{ padding: 0 }}
			bordered={false}
			title={
				<Stack wrap={false} alignment="center" spacing="tight">
					<Briefcase weight="duotone" />
					<Heading level={4}>Positions</Heading>
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
			<AngularTemplate
				key={candidateId}
				template={`<person-processes
							api="{isProcessesTab: true}"
							person-ids="[candidate.person]"
							add-to-another-position="addToAnotherPosition()"
					></person-processes>
				`}
			/>
			<DrawerMobileComponent
				drawerIcon={<Briefcase weight="duotone" />}
				title="Positions"
				expanded={expanded}
				setExpanded={setExpanded}
			>
				<AngularTemplate
					key={candidateId}
					template={`<person-processes
								api="{isProcessesTab: true}"
								person-ids="[candidate.person]"
								add-to-another-position="addToAnotherPosition()"
						></person-processes>
					`}
				/>
			</DrawerMobileComponent>
		</Card>
	);
}
