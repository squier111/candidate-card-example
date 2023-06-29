import React from 'react';
import { Menu, Dropdown, Tooltip, Typography } from 'antd';
import { spacingDefinition } from 'styled/definitions/spacing';

//components
import { Button } from 'components/common/Button/Button';
import { CheckSquare, Info, User } from 'components/icons';
import { Tag } from 'components/common/Tag/Tag';
import { Text } from 'components/common/Typography/Text';
import { Stack } from 'components/common/Stack/Stack';

// hooks
import { useCandidates } from 'hooks/angular/candidates';
import { useSources } from 'hooks/angular/sources';

//metadata
import { StatusesEnum } from 'metadata/candidate/candidate.meta';
import { SourceMethodsEnum } from 'metadata/source/source.meta';
import { receiversEnum as messageReceiversEnum } from 'metadata/message-templates/message-templates.meta';

//types
import { CandidateResourceAngular } from 'types/domain/candidate.types';

// styled
import * as S from './SourceProfile.styled';

//utils
import { useMessageTemplates } from 'hooks/angular/messageTemplates';

export type SourceProfileProps = {
	requestExposure: () => void;
	candidate: CandidateResourceAngular;
	sendBlankEmail: (param: messageReceiversEnum) => void;
};

const { Link } = Typography;

export function SourceProfile(props: SourceProfileProps) {
	const { candidate } = props;
	const { sources: sourceMethods } = useCandidates();
	const { fakeSources, types: sourceTypes } = useSources();
	const {
		sourceContact,
		sourceMethod: candidateSourceMethodId,
		source: { id: candidateSourceId, sourceType: candidatesourceType, name: candidateSourceName }
	} = candidate;

	return (
		<S.ProfileSource>
			<Dropdown trigger={['click']} overlay={renderProfileSourceMenu(props)} placement="bottom">
				<Button neutral type="link" disclosure>
					Source:&nbsp;
					{candidateSourceId < 0 ? (
						<span>
							{candidateSourceId == fakeSources.enumId.SELF_SUBMISSION &&
								`Unknown source ${sourceMethods[candidateSourceMethodId].creationText}`}

							{candidateSourceId == fakeSources.enumId.OTHER &&
								`${sourceContact?.name || ''} Unknown source ${
									sourceMethods[candidateSourceMethodId].creationText
								}`.trim()}
						</span>
					) : (
						<span>
							{candidateSourceName}
							&mdash;
							{sourceTypes.data[candidatesourceType].isReferrer
								? ' Referrer'
								: ` ${sourceTypes.data[candidatesourceType].name}`}
						</span>
					)}
					, added {moment(candidate.timeCreated).fromNow()}
				</Button>
			</Dropdown>
		</S.ProfileSource>
	);
}

function renderProfileSourceMenu({ candidate, sendBlankEmail, requestExposure }: SourceProfileProps) {
	const {
		status,
		createdBy,
		timeCreated,
		sourceMethod,
		pointOfContact,
		sourceContact,
		referralMedium,
		userPermissions,
		isExposureRequested,
		referralCampaign,
		email: candidateEmail,
		requisition: { name: candidateRequisitionName },
		source: { id: candidateSourceId, sourceType: candidatesourceType, name: candidateSourceName }
	} = candidate;

	const { statuses: candidateStatuses, sources: sourceMethods } = useCandidates();

	const { socialNetworks, types: sourceTypes } = useSources();
	const { receivers } = useMessageTemplates();
	const candidateStatus = candidateStatuses[status];

	const sourceEmail = sourceContact?.email;
	const sendNotifications = sourceTypes.data[candidatesourceType].sendNotifications;

	const rejectedNotificationCondition =
		(sendNotifications || candidateSourceId < 0) &&
		((sourceMethod == SourceMethodsEnum.EMAIL && sourceEmail && sourceEmail !== candidateEmail) ||
			(candidateSourceId > 0 && pointOfContact?.email));

	const writeEmailSourceCondition = userPermissions.sendMessageToSource && rejectedNotificationCondition;
	const contactInformationCondition = userPermissions.requestExposure && rejectedNotificationCondition;

	return (
		<Menu>
			{(candidateSourceId > 0 || sourceContact || pointOfContact) && (
				<>
					{candidateSourceId > 0 && (
						<>
							<Menu.Item style={{ cursor: 'default' }} disabled key="1">
								<Stack spacing="normal" alignment="center">
									<Text strong size="extraLarge">
										{candidateSourceName}
									</Text>
									&nbsp;
									<Tag color={sourceTypes.data[candidatesourceType].antdColor} size="small">
										{sourceTypes.data[candidatesourceType].name}
									</Tag>
								</Stack>
							</Menu.Item>
							<Menu.Divider />
						</>
					)}
					{sendNotifications && !sourceContact && pointOfContact && (
						<>
							<Menu.Item style={{ cursor: 'default' }} disabled key="8">
								<Text type="secondary">contact for {candidateRequisitionName}</Text>
							</Menu.Item>
							<Menu.Item style={{ cursor: 'default' }} disabled key="2">
								<Stack vertical spacing="tight">
									<Text>
										<User weight="bold" /> {pointOfContact.name}
									</Text>
									{pointOfContact.email && (
										<Text style={{ paddingLeft: spacingDefinition.loose, display: 'block' }} type="secondary">
											{pointOfContact.email}
										</Text>
									)}
									{pointOfContact.phone && (
										<Text style={{ paddingLeft: spacingDefinition.loose, display: 'block' }} type="secondary">
											{pointOfContact.phone}ds
										</Text>
									)}
								</Stack>
							</Menu.Item>
							<Menu.Divider />
						</>
					)}
				</>
			)}

			{isExposureRequested && (
				<Menu.Item key="3" icon={<CheckSquare />}>
					<Text type="secondary">Request for contact information sent</Text>
				</Menu.Item>
			)}

			{writeEmailSourceCondition && (
				<Menu.Item key="4" onClick={() => sendBlankEmail(receivers.enumId.SOURCE)}>
					<Link>
						{sourceMethod == SourceMethodsEnum.EMAIL && sourceEmail && sourceEmail !== candidateEmail
							? 'Reply'
							: 'Write email to source'}
					</Link>
				</Menu.Item>
			)}

			{contactInformationCondition && (
				<Menu.Item key="5" onClick={() => requestExposure()}>
					<Link>
						Request candidate's contact information&nbsp;&nbsp;
						<Tooltip placement="right" title={"The recipient can reply to you with the candidate's contact details"}>
							<Info weight="bold" style={{ fontSize: '15px', position: 'relative', zIndex: 1 }} />
						</Tooltip>
					</Link>
				</Menu.Item>
			)}

			{rejectedNotificationCondition &&
				(candidateStatus.id == StatusesEnum.REJECTED || candidateStatus.id == StatusesEnum.HIRED) && (
					<Menu.Item key="6" onClick={() => sendBlankEmail(receivers.enumId.SOURCE)}>
						<Link>Send {candidateStatus.name} notification</Link>
					</Menu.Item>
				)}

			{(writeEmailSourceCondition || contactInformationCondition || rejectedNotificationCondition) && <Menu.Divider />}

			<Menu.Item style={{ cursor: 'default' }} disabled key="7">
				{referralMedium && (
					<div>
						<Text type="secondary">
							Referred by&nbsp;
							{sourceContact?.name || sourceEmail}
							{referralMedium !== socialNetworks.enumId.LINK && referralMedium !== socialNetworks.enumId.JOBBOARD && (
								<Text type="secondary">via {socialNetworks.data[referralMedium].name}</Text>
							)}
							{referralCampaign && <Text type="secondary">(campaign: {referralCampaign})</Text>}
						</Text>
					</div>
				)}

				<Text type="secondary">
					Candidate created
					{sourceMethods[sourceMethod].creationText}
				</Text>
				<br />

				{sourceContact ? (
					<Text type="secondary">by {sourceContact.name}</Text>
				) : (
					createdBy && <Text type="secondary">by {createdBy?.fullName || createdBy?.email}</Text>
				)}
				<br />

				<Text type="secondary">on {moment(timeCreated).format('MMM DD, YYYY h:mm A')}</Text>
			</Menu.Item>
		</Menu>
	);
}
