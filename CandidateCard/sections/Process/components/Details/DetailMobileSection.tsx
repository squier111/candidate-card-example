import React from 'react';
import { Row, Col } from 'antd';

//components
import { Text } from 'components/common/Typography/Text';
import { DetailsProps } from './Details';
import { Tag } from 'components/common/Tag/Tag';

//types
import { CustomField as CandidateCustomField } from 'types/domain/candidate.types';

//hooks
import { PrivacyDataRetentionTags } from './PrivacyDataRetentionTags';

type DetailMobileSectionProps = {} & DetailsProps;

export function DetailMobileSection({ candidate }: DetailMobileSectionProps) {
	const { retentionState, isDataSubject, idNumber, customFields } = candidate;

	const addressFieldsNames = ['Street address', 'Zip', 'Country', 'State', 'City'];

	const addressFields: CandidateCustomField[] = [];
	const otherCustomFields: CandidateCustomField[] = [];

	customFields.forEach((field) => {
		if (addressFieldsNames.includes(field.name)) {
			addressFields.push(field);
		} else {
			otherCustomFields.push(field);
		}
	});

	const addressFieldsValue = addressFields
		.map((item) => item.value)
		.filter((item) => item)
		.join(',');

	return (
		<>
			<Row gutter={[8, 8]} align="middle">
				<Col span={11}>
					<Text type="secondary">Address</Text>
				</Col>
				<Col span={13}>
					<Text>{addressFieldsValue ? addressFieldsValue : '-'}</Text>
				</Col>
				<Col span={11}>
					<Text type="secondary">ID number</Text>
				</Col>
				<Col span={13}>
					<Text>{idNumber ? idNumber : '-'}</Text>
				</Col>

				{otherCustomFields.length > 0 &&
					otherCustomFields.map((customField) => (
						<React.Fragment key={customField.id}>
							<Col span={11}>
								<Text type="secondary">{customField.name}</Text>
							</Col>
							<Col span={13}>
								<Text>{customField.value ? customField.value : '-'}</Text>
							</Col>
						</React.Fragment>
					))}
				<Col span={11}>
					<Text type="secondary">Privacy & data retention</Text>
				</Col>
				<Col span={13}>
					{isDataSubject ? (
						<PrivacyDataRetentionTags state={retentionState} />
					) : (
						<Tag color="default">Doesn’t apply to candidate</Tag>
					)}
				</Col>
			</Row>
		</>
	);
}
