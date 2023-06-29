import React, { useState } from 'react';
import { Card, Drawer } from 'antd';
import { isMobile, isMobileOnly } from 'react-device-detect';

import { ChatsTeardrop, ArrowsOutSimple, X } from 'components/icons';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import ActivityActions from './ActivityActions/ActivityActions';
import ActivityWidget from 'pages/Candidate/CandidateCard/sections/Activity/ActivityWidget/ActivityWidget';

type ActivitiesProps = {
	expandable?: boolean;
};

export function Activity({ expandable }: ActivitiesProps) {
	const [expanded, setExpanded] = useState(false);

	return (
		<>
			<Card
				size="small"
				title={<ActivityCardTitle />}
				bordered={false}
				extra={
					expandable && (
						<Button
							neutral
							type="link"
							onClick={() => {
								setExpanded(true);
							}}
							icon={<ArrowsOutSimple />}
						>
							Expand
						</Button>
					)
				}
			>
				<Stack vertical spacing="extraLoose">
					<ActivityActions />
					<ActivityWidget showEventLogs={false} />
				</Stack>
			</Card>
			<Drawer
				visible={expanded}
				onClose={() => {
					setExpanded(false);
				}}
				size="large"
				width={isMobile ? '100%' : undefined}
				title={<ActivityCardTitle />}
				extra={
					<Button
						neutral
						type="link"
						onClick={() => {
							setExpanded(!expanded);
						}}
						icon={isMobileOnly ? <X weight="bold" /> : <ArrowsOutSimple />}
					>
						{!isMobileOnly && 'Minimize'}
					</Button>
				}
				closable={false}
			>
				<Stack vertical spacing="extraLoose">
					<ActivityActions />
					<ActivityWidget />
				</Stack>
			</Drawer>
		</>
	);
}

function ActivityCardTitle() {
	return (
		<Stack wrap={false} alignment="center" spacing="tight">
			<ChatsTeardrop weight="duotone" />

			<Heading level={4}>Activity</Heading>
		</Stack>
	);
}
