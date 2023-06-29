import React  from 'react';
import { Card, Tooltip } from 'antd';
import { Copy } from 'components/icons';
import { isMobileOnly } from 'react-device-detect';

// Components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';

export type DuplicatesCallbackProps = {
	openResolveDuplicatesModal?: () => void | undefined;
};

type DuplicatesProps = {
	duplicatesCount: number | undefined;
	candidateId: number;
} & DuplicatesCallbackProps;

export default function Duplicates({ openResolveDuplicatesModal, duplicatesCount }: DuplicatesProps) {
	return (
		<Tooltip
			trigger="click"
			placement="bottom"
			title={isMobileOnly ? 'Resolve duplicates is not yet available in mobile.' : null}
		>
			<Card
				size="small"
				title={
					<Stack alignment="center" wrap={false} spacing="tight">
						<Copy />
						<Heading level={4}>
							{duplicatesCount && duplicatesCount > 1
								? `${duplicatesCount} Possible duplicates`
								: `${duplicatesCount} Possible duplicate`}
						</Heading>
					</Stack>
				}
				bordered={false}
				headStyle={{ borderBottom: 'none' }}
				bodyStyle={{ display: 'none' }}
				extra={
					<Button disabled={isMobileOnly} type="primary" onClick={openResolveDuplicatesModal}>
						Resolove
					</Button>
				}
			></Card>
		</Tooltip>
	);
}
