import React from 'react';

// components
import { Tag } from 'components/common/Tag/Tag';

import { GDPRStatusesEnum } from 'metadata/candidate/candidate.meta';

type PrivacyDataRetentionTagsProps = {
	state: GDPRStatusesEnum;
};

const { RETENTION_ENDED, NOT_APPLY, ENDS_SOON, PROVIDED_CONSENT, APPLIES } = GDPRStatusesEnum;

const tagVariantMap: { [key in GDPRStatusesEnum]: JSX.Element } = {
	[RETENTION_ENDED]: <Tag color="warning">Data retention period has ended</Tag>,
	[NOT_APPLY]: <Tag color="warning">Applies to candidate, do not contact!</Tag>,

	[ENDS_SOON]: <Tag color="warning">Applies to candidate, data retention period is ends soon</Tag>,

	[PROVIDED_CONSENT]: <Tag color="warning">Applies to candidate, provided consent</Tag>,

	[APPLIES]: <Tag color="default">Applies to candidate</Tag>
};

export function PrivacyDataRetentionTags({ state }: PrivacyDataRetentionTagsProps) {
	return tagVariantMap[state] as JSX.Element;
}
