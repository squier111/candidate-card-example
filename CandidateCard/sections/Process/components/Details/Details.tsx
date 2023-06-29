import React, {useCallback, useEffect, useState} from 'react'
import { Form, Input, Row, Col, Space, Divider, Modal, notification, Tooltip } from 'antd';
import { isMobile, isMobileOnly } from 'react-device-detect';
import { Info } from 'components/icons';

// components
import { Heading } from 'components/common/Typography/Heading';
import { Text } from 'components/common/Typography/Text';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Gear } from 'components/icons';
import { PrivacyDataRetention } from './PrivacyDataRetention';
import { SourceSelector } from 'components';
import { CreatedByTooltip } from './CreatedByTooltip';

//types
import { CandidateResourceAngular, CustomField as CandidateCustomField } from 'types/domain/candidate.types';
import { SourceResource } from 'types/domain/source.types';

//hooks
import { useCandidates } from 'hooks/angular/candidates';
import { useSources } from 'hooks/angular/sources';
import { use$state } from 'hooks/angular/state';
import { useResDispatcher } from 'hooks/angular/resDispatcher';
import { useSessionService } from 'hooks/angular/session';

//styled
import styled from 'styled-components';
import { ExternalLink } from 'components/common/Link/ExternalLink';

export type DetailsProps = {
	candidate: CandidateResourceAngular;
	gdprRequestProfile: () => void;
	gdprRequestConsent: () => void;
	readOnly?: boolean;
};

// TODO: Fix it
type EditFields =
	| 'firstName'
	| 'middleName'
	| 'lastName'
	| 'availability'
	| 'fullNameLong'
	| 'salaryExpectations'
	| 'email'
	| 'phone'
	| 'mobilePhone'
	| 'skype'
	| 'idNumber'
	| 'source'
	| 'customFields';

type DetailsUpdateValues = Pick<CandidateResourceAngular, EditFields>;

const FormItem = styled(Form.Item)`
	margin-bottom: ${(props) => props.theme.spacing.tight};

	& .ant-input[type='password'][disabled] {
		cursor: not-allowed;
	}

	& .ant-input[disabled],
	& .ant-input-affix-wrapper-readonly,
	& .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
		color: ${(props) => props.theme.colors.base.grey[9]};
		cursor: default;
		padding: 0;
	}
`;

const { confirm } = Modal;

export function Details({ candidate, gdprRequestProfile, gdprRequestConsent, readOnly }: DetailsProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [edit, setEdit] = useState(false);
	const [allSources, setAllSources] = useState<SourceResource[]>([]);

	const candidatesService = useCandidates();
	const sourceService = useSources();
	const $stateService = use$state();
	const resDispatcherService = useResDispatcher();
	const [session] = useSessionService();

	const getSources = useCallback(() => {
		return new Promise<SourceResource[]>((resolve, reject) => {
			sourceService.queryCollection(
				{},
				(sources) => resolve(sources),
				(error) => reject(error)
			);
		});
	}, [sourceService]);

	useEffect(() => {
		getSources().then((data) => {
			setAllSources(data);
		});
	}, [sourceService]);

	const {
		availability,
		email,
		firstName,
		fullNameLong,
		idNumber,
		lastName,
		middleName,
		phone,
		mobilePhone,
		requisitionId,
		requisitionName,
		salaryExpectations,
		skype,
		source,
		status,
		timeLastStatusChange,
		customFields,
		sourceMethod,
		createdBy,
		sourceContact,
		timeCreated
	} = candidate;

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

	const customFieldsMapForFormInitialValues = customFields.reduce((acc, item) => {
		acc[item.name] = item.value;
		return acc;
	}, {} as { [key in string]: string | null });

	const onFinish = (values: DetailsUpdateValues) => {
		setLoading(true);

		const customFieldNames = customFields.map((customField) => customField.name);

		const filterValues = Object.entries(values).reduce(
			(acc, [k, v]) => (v !== null && !customFieldNames.includes(k) ? { ...acc, [k]: v } : acc),
			{}
		);
		// TODO: Fix it
		// @ts-ignore
		const filterSource = allSources.find((source) => source.id === values.source);

		const customFieldsUpdated = customFields.map((item) => {
			// TODO: Fix it
			// @ts-ignore
			const value = values[item.name];
			if (value) {
				return { ...item, value };
			}
			return item;
		});

		candidatesService
			// TODO: Fix it
			// @ts-ignore
			.update<keyof DetailsUpdateValues>(
				{ id: candidate.id },
				// TODO: Fix it
				// @ts-ignore
				{ ...filterValues, source: filterSource, customFields: customFieldsUpdated }
			)
			.$promise.then(() => {
				setLoading(false);
				setEdit(false);
			})
			.catch(() => {
				setLoading(false);
				setEdit(false);
				form.resetFields();
				setInitialValue();
			});
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo);
		setLoading(false);
	};

	const setInitialValue = () => {
		form.setFieldsValue({
			firstName,
			middleName,
			lastName,
			availability,
			fullNameLong,
			salaryExpectations,
			email,
			phone,
			mobilePhone,
			skype,
			idNumber,
			source: source?.id,
			...customFieldsMapForFormInitialValues
		});
	};

	useEffect(() => {
		setInitialValue();
	}, [candidate]);

	const onCancel = () => {
		form.resetFields();
		setInitialValue();
		setEdit(false);
	};

	return (
		<Form
			form={form}
			name="process"
			labelAlign="left"
			labelCol={{ span: 5 }}
			wrapperCol={{ span: 19 }}
			initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			autoComplete="off"
			labelWrap
			size="small"
			colon={false}
		>
			<Space style={{ paddingTop: isMobileOnly ? '0' : '20px', width: '100%' }} size={40} direction="vertical">
				<Stack fill={isMobile} spacing="tight" alignment="center" distribution="equalSpacing">
					{!isMobile && <Heading level={3}>Details</Heading>}
					{edit ? (
						<Row gutter={isMobile ? [8, 8] : [16, 16]}>
							<Col xs={12}>
								<Button
									size={isMobile ? 'middle' : 'small'}
									block={isMobile}
									disabled={loading}
									onClick={() => onCancel()}
								>
									Cancel
								</Button>
							</Col>
							<Col xs={12}>
								<Button
									size={isMobile ? 'middle' : 'small'}
									block={isMobile}
									disabled={loading}
									type="primary"
									htmlType="submit"
								>
									Save
								</Button>
							</Col>
						</Row>
					) : (
						<>
							{!readOnly && (
								<Button
									size={isMobile ? 'middle' : 'small'}
									block={isMobile}
									disabled={!candidate.userPermissions.editCandidate}
									type="primary"
									onClick={() => setEdit(true)}
								>
									Edit
								</Button>
							)}
						</>
					)}
				</Stack>
				<FormItem wrapperCol={{ span: 24 }}>
					<Row align="middle">
						<Col xs={24} md={5}>
							<Heading level={4}>This hiring process</Heading>
						</Col>
						<Col xs={24} md={19}>
							<Text type="secondary">{`${candidatesService.statuses[status].name} for ${requisitionName}`}</Text>&nbsp;
							<Tooltip
								placement="bottom"
								title={CreatedByTooltip({sourceMethod, createdBy, sourceContact, timeCreated})}
							>
								<Text style={{ cursor: 'pointer' }} type="secondary">
									{moment(timeLastStatusChange).fromNow()}
								</Text>
							</Tooltip>
						</Col>
					</Row>
				</FormItem>
			</Space>
			<FormItem
				wrapperCol={{ xs: 24, md: 7 }}
				name="source"
				label="Source"
				rules={[{ required: session.companySettings.isSourceRequired, message: 'Source is required' }]}
			>
				{edit ? (
					<SourceSelector
						dropdownWidth={480}
						bordered={edit || loading}
						disabled={!edit || loading}
						style={{ width: '100%' }}
						personId={candidate.person}
						showRecentSources={true}
					/>
				) : (
					<Text>{allSources.find((source) => source.id === form.getFieldValue('source'))?.name}</Text>
				)}
			</FormItem>
			<FormItem
				wrapperCol={{ xs: 24, md: 7 }}
				label={
					<div>
						Salary expectations&nbsp;
						{!candidate.userPermissions.seeSalary && !candidate.salaryExpectations && (
							<Tooltip title="You don’t have permissions to view this information">
								<Info />
							</Tooltip>
						)}
					</div>
				}
				name="salaryExpectations"
			>
				<Input.Password
					readOnly={!edit}
					placeholder={!edit || loading ? '-' : '...'}
					bordered={edit || loading}
					disabled={loading || (!candidate.userPermissions.seeSalary && !candidate.salaryExpectations)}
				/>
			</FormItem>
			<FormItem wrapperCol={{ xs: 24, md: 7 }} label="Availability" name="availability">
				<Input placeholder={!edit || loading ? '-' : '...'} bordered={edit || loading} disabled={!edit || loading} />
			</FormItem>
			<Divider />
			<FormItem wrapperCol={{ span: 24 }}>
				<Row gutter={[16, 16]}>
					<Col span={24}>
						<Stack spacing="loose" alignment="center" distribution="equalSpacing">
							<Heading level={4}>Basic info</Heading>
							<ExternalLink href="#/company/settings/candidate">
								<Gear /> Customize
							</ExternalLink>
						</Stack>
					</Col>
				</Row>
			</FormItem>
			{edit ? (
				<Row>
					<Col xs={24} md={12}>
						<FormItem
							rules={[{ required: true }]}
							labelCol={{ xs: 24, md: 10 }}
							wrapperCol={{ xs: 24, md: 13 }}
							label="Name (required)"
							name="firstName"
						>
							<Input disabled={loading} placeholder={loading ? '-' : '...'} />
						</FormItem>
					</Col>
					<Col xs={24} md={6}>
						<FormItem wrapperCol={{ xs: 24, md: 22 }} name="middleName">
							<Input disabled={loading} placeholder={loading ? '-' : '...'} />
						</FormItem>
					</Col>
					<Col xs={24} md={6}>
						<FormItem rules={[{ required: true }]} wrapperCol={{ span: 24 }} name="lastName">
							<Input disabled={loading} placeholder={loading ? '-' : '...'} />
						</FormItem>
					</Col>
				</Row>
			) : (
				<FormItem label="Name" name="fullNameLong">
					<Input bordered={edit || loading} disabled={!edit || loading} placeholder={!edit || loading ? '-' : '...'} />
				</FormItem>
			)}
			<FormItem
				label="Email"
				name="email"
				rules={[
					{
						pattern: /^[-+\._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/gi,
						message: 'Enter valid email'
					}
				]}
			>
				<Input bordered={edit || loading} disabled={!edit || loading} placeholder={!edit || loading ? '-' : '...'} />
			</FormItem>
			<FormItem
				wrapperCol={{ xs: 24, md: 7 }}
				label="Phone"
				name="phone"
				rules={[
					{
						pattern: /^[\+\][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
						message: 'Enter valid phone'
					}
				]}
			>
				<Input bordered={edit || loading} disabled={!edit || loading} placeholder={!edit || loading ? '-' : '...'} />
			</FormItem>
			<FormItem
				wrapperCol={{ span: 7 }}
				label="Mobile Phone"
				name="mobilePhone"
				rules={[
					{
						pattern: /^[\+\][(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
						message: 'Enter valid phone'
					}
				]}
			>
				<Input bordered={edit || loading} disabled={!edit || loading} placeholder={!edit || loading ? '-' : '...'} />
			</FormItem>
			<FormItem label="ID number" name="idNumber">
				<Input bordered={edit || loading} disabled={!edit || loading} placeholder={!edit || loading ? '-' : '...'} />
			</FormItem>

			{addressFields.length > 0 && (
				<Row>
					{edit ? (
						<>
							{addressFields
								.sort((a, b) => a.id - b.id)
								.map((customField) => {
									if (customField.name === 'Street address') {
										return (
											<Col key={customField.id} span={24}>
												{/* TODO: STREES SELECTOR SUPPORT GOOGLE STREET SEARCH */}
												<FormItem label="Street" name="Street address">
													<Input disabled={loading} placeholder={loading ? '-' : '...'} />
												</FormItem>
											</Col>
										);
									} else {
										return (
											<Col key={customField.id} xs={24} md={12}>
												<FormItem
													labelCol={customField.id % 2 ? { xs: 5, md: 10 } : { xs: 5, md: { span: 9, offset: 1 } }}
													wrapperCol={{ xs: 24, md: 14 }}
													label={customField.name}
													name={customField.name}
												>
													<Input disabled={loading} placeholder={loading ? '-' : '...'} />
												</FormItem>
											</Col>
										);
									}
								})}
						</>
					) : (
						<Col span={24}>
							<FormItem label="Address">
								<Input
									value={`${addressFields
										.map((item) => item.value)
										.filter((item) => item)
										.join(',')}`}
									bordered={edit || loading}
									disabled={!edit || loading}
									placeholder={!edit || loading ? '-' : '...'}
								/>
							</FormItem>
						</Col>
					)}
				</Row>
			)}

			{otherCustomFields.length > 0 &&
				otherCustomFields.map((customField) => (
					<FormItem key={customField.id} label={customField.name} name={customField.name}>
						<Input
							bordered={edit || loading}
							disabled={!edit || loading}
							placeholder={!edit || loading ? '-' : '...'}
						/>
					</FormItem>
				))}
			<Divider />
			<PrivacyDataRetention
				candidate={candidate}
				gdprRequestProfile={gdprRequestProfile}
				gdprRequestConsent={gdprRequestConsent}
			/>
			{!readOnly && (
				<>
					<Divider />
					<Stack spacing="tight" alignment="center" distribution="equalSpacing">
						<Button
							danger
							type="text"
							onClick={() => {
								showConfirmationDeleteModal(() =>
									candidatesService.remove({ id: candidate.id }).$promise.then(() => {
										$stateService.go('dash.requisition', { reqId: requisitionId });
										resDispatcherService.publishEvent(resDispatcherService.events.POST_CANDIDATE_DELETE, candidate); // For Removing candidate from candidate list
										notification.open({
											message: '',
											description: `Candidate ${candidate.fullName} is deleted.`,
											placement: 'bottomLeft'
										});
									})
								);
							}}
						>
							Delete candidate
						</Button>
					</Stack>
				</>
			)}
		</Form>
	);

	function showConfirmationDeleteModal(onOk: () => void) {
		confirm({
			title: 'Delete candidate?',
			icon: null,
			content: 'This cannot be undone.',
			okText: 'Delete',
			onOk,
			okButtonProps: { type: 'primary', danger: true }
		});
	}
}
