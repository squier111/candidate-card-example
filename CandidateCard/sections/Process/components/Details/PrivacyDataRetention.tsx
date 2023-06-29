import React,{useMemo} from 'react';
import { Row, Col, Dropdown, Tooltip, Typography, Menu, Modal, notification } from 'antd';
import { isMobileOnly } from 'react-device-detect';

// components
import { Heading } from 'components/common/Typography/Heading';
import { Text } from 'components/common/Typography/Text';
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { DotsThreeOutline, Info } from 'components/icons';
import { Tag } from 'components/common/Tag/Tag';
import { MenuTitle } from 'components/common/Menu/MenuTitle';

//hooks
import { useCandidateGDPR } from 'hooks/angular/CandidateGDPR';
import { Session, useSessionService } from 'hooks/angular/session';
import { PrivacyDataRetentionTags } from './PrivacyDataRetentionTags';
import { use$state } from 'hooks/angular/state';

//types
import { DetailsProps } from './Details';
import { useCandidates } from 'hooks/angular/candidates';
import { useBulkCandidates } from 'hooks/angular/bulk-candidates';

type PrivacyDataRetentionProps = {} & DetailsProps;

const { Link } = Typography;
const { confirm } = Modal;

const gdprDataTooltipInfo = (
	<>
		This is when the candidate’s data has to be removed according to the company’s policy, last activity with the
		candidate and current consent status.{' '}
		<Link href="https://help.comeet.com/en/articles/3110566-data-retention" target="_blank">
			Learn more
		</Link>
	</>
);

const gdprStatusTooltipInfo = (
	<>
		The status of the request for the candidate’s consent to retain their data for a longer time period.{' '}
		<Link href="https://help.comeet.com/en/articles/3117028-requesting-consent-from-candidates" target="_blank">
			Learn more
		</Link>
	</>
);

const confirmationDRemoveCandidateProfileModalContent = (
	<>
		Candidate profile will be deleted; Candidate's hiring activities will be retained for reporting purposes; Candidate
		may be reidentified should he/she reapply. This action cannot be undone.{' '}
		<Link href="https://help.comeet.com/en/articles/3110559-candidate-data-removal-pseudonymization" target="_blank">
			Learn more
		</Link>
	</>
);

const notApplyPrivacyContent = 'Candidate may still be subject to GDPR due to company settings';

export function PrivacyDataRetention({ candidate, gdprRequestProfile, gdprRequestConsent }: PrivacyDataRetentionProps) {
	const candidateGDPRService = useCandidateGDPR();
	const candidatesService = useCandidates();
	const bulkCandidatesService = useBulkCandidates();
	const [session] = useSessionService();
	const $stateService = use$state();

	const { timeLastStatusChange, retentionEndDateString, retentionState, isDataSubject, requisitionId } = candidate;

	const gdprMenuSections = useMemo(() => {
		return {
			session,
			candidate,
			applyGDPR: () => {
				candidateGDPRService.manualDatasubject({ id: candidate.id }).$promise.then(() => {
					candidatesService.reloadCurrent();
				});
			},
			notApplyGDPR: () => {
				candidateGDPRService.removeManualDatasubject({ id: candidate.id }).$promise.then(() => {
					candidatesService.reloadCurrent();
				});
			},
			showConfirmationDRemoveCandidateProfileModal: () =>
				showConfirmationDRemoveCandidateProfileModal(confirmationDRemoveCandidateProfileModalContent, () => {
					if (candidate.stepSet.find((step) => !step.isCompleted && step.timeScheduled)) {
						showErrorHasScheduledInterviewsModal();
						return;
					}
					bulkCandidatesService.pseudonymizeBulk({}, { candidateIds: [candidate.id] }).$promise.then((result) => {
						$stateService.go('dash.requisition', { reqId: requisitionId });
						candidatesService.reloadCurrent();
						notification.open({
							message: '',
							description: `Candidate has been pseudomymized.`,
							placement: 'bottomLeft'
						});
					});
				}),
			gdprRequestProfile,
			gdprRequestConsent,
			consented: () => {
				candidateGDPRService.consented({ id: candidate.id }).$promise.then(() => {
					candidatesService.reloadCurrent();
				});
			},
			optOut: () => {
				candidateGDPRService.optOut({ id: candidate.id }).$promise.then(() => {
					candidatesService.reloadCurrent();
				});
			}
		};
	}, [candidate]);

	return (
		<Stack spacing="tight" alignment="center" distribution="equalSpacing">
			<Stack.Item>
				<Stack
					vertical={isMobileOnly}
					spacing="tight"
					alignment={isMobileOnly ? 'leading' : 'center'}
					distribution="leading"
				>
					<Heading level={4}>Privacy & data retention</Heading>
					{isDataSubject ? (
						<PrivacyDataRetentionTags state={retentionState} />
					) : (
						<Tag color="default">Doesn’t apply to candidate</Tag>
					)}
				</Stack>
			</Stack.Item>
			<Dropdown trigger={['click']} overlay={() => renderGDPRMenu({ ...gdprMenuSections })}>
				<Button neutral type="ghost" icon={<DotsThreeOutline style={{ fontSize: '20px' }} />} />
			</Dropdown>

			{isDataSubject && (
				<Row gutter={[8, 8]} align="middle">
					<Col span={5}>
						<Text type="secondary">
							Data retention ends{' '}
							<Tooltip placement="top" title={gdprDataTooltipInfo}>
								<Info />
							</Tooltip>
						</Text>
					</Col>
					<Col span={19}>
						<Text>{retentionEndDateString}</Text>
					</Col>
					<Col span={5}>
						<Text type="secondary">Request for consent</Text>
					</Col>
					<Col span={19}>
						<Text>{`${moment(timeLastStatusChange).fromNow()} (mock data)`}</Text>
					</Col>
					<Col span={5}>
						<Text type="secondary">
							Consent status{' '}
							<Tooltip placement="top" title={gdprStatusTooltipInfo}>
								<Info />
							</Tooltip>
						</Text>
					</Col>
					<Col span={19}>
						<Text>{`Withdrawn (mock data)`}</Text>
					</Col>
				</Row>
			)}
		</Stack>
	);
}

type renderGDPRMenuProps = {
	session: Session;
	applyGDPR: () => void;
	notApplyGDPR: () => void;
	showConfirmationDRemoveCandidateProfileModal: () => void;
	consented: () => void;
	optOut: () => void;
} & DetailsProps;

function renderGDPRMenu({
	session,
	candidate,
	applyGDPR,
	notApplyGDPR,
	showConfirmationDRemoveCandidateProfileModal,
	gdprRequestProfile,
	gdprRequestConsent,
	consented,
	optOut
}: renderGDPRMenuProps) {
	const {
		consentGiven,
		email,
		isDataSubject,
		isManualDataSubject,
		userPermissions: { editCandidateGdpr, exportCandidateData, pseudonymizeCandidate }
	} = candidate;

	const {
		companyData: { gdprConsentRequestIsEnabled, gdprPseudonymizationIsEnabled }
	} = session;

	return (
		<Menu>
			{editCandidateGdpr ? (
				<>
					{isDataSubject ? (
						<>
							<MenuTitle title="Consent" />
							{email && gdprConsentRequestIsEnabled && (
								<Menu.Item
									icon={
										<Link
											href="https://help.comeet.com/en/articles/3117028-requesting-consent-from-candidates"
											target="_blank"
										>
											<Info />
										</Link>
									}
									onClick={gdprRequestConsent}
									key="1"
								>
									Request consent from candidate
								</Menu.Item>
							)}
							<Menu.Item
								icon={
									<Link
										href="https://help.comeet.com/en/articles/3117028-requesting-consent-from-candidates"
										target="_blank"
									>
										<Info />
									</Link>
								}
								onClick={consented}
								key="2"
							>
								Candidate consented to retain data
							</Menu.Item>
							{consentGiven && (
								<Menu.Item
									icon={
										<Link
											href="https://help.comeet.co/en/articles/3117028-requesting-consent-from-candidates"
											target="_blank"
										>
											<Info />
										</Link>
									}
									onClick={optOut}
									key="3"
								>
									Candidate withdrew consent
								</Menu.Item>
							)}
							{((gdprPseudonymizationIsEnabled && pseudonymizeCandidate) || exportCandidateData) && (
								<MenuTitle title="Personal data" />
							)}
							{exportCandidateData && (
								<Menu.Item
									icon={
										<Link href="https://help.comeet.co/en/articles/3134988-data-access-portability" target="_blank">
											<Info />
										</Link>
									}
									onClick={gdprRequestProfile}
									key="4"
								>
									Email profile to candidate...
								</Menu.Item>
							)}
							{isManualDataSubject && (
								<Menu.Item
									icon={
										<Tooltip placement="top" title={notApplyPrivacyContent}>
											<Info />
										</Tooltip>
									}
									onClick={notApplyGDPR}
									key="5"
								>
									Do not apply privacy & data retention rules
								</Menu.Item>
							)}
							{gdprPseudonymizationIsEnabled && pseudonymizeCandidate && (
								<Menu.Item
									icon={
										<Link
											href="https://help.comeet.com/en/articles/3110559-candidate-data-removal-pseudonymization"
											target="_blank"
										>
											<Info />
										</Link>
									}
									key="6"
									onClick={showConfirmationDRemoveCandidateProfileModal}
								>
									Remove candidate profile (pseudonymize)
								</Menu.Item>
							)}
						</>
					) : (
						<Menu.Item onClick={() => applyGDPR()} key="7">
							Apply privacy & data retention rules
						</Menu.Item>
					)}
				</>
			) : (
				<Menu.Item key="8">
					<Text type="secondary">You do not have permission for GDPR-related actions</Text>
				</Menu.Item>
			)}
		</Menu>
	);
}

function showConfirmationDRemoveCandidateProfileModal(content: React.ReactNode, onOk: () => void) {
	confirm({
		title: 'Remove candidate profile (pseudonymize)',
		icon: null,
		content,
		okText: 'Delete',
		onOk,
		okButtonProps: { type: 'primary', danger: true }
	});
}

function showErrorHasScheduledInterviewsModal() {
	confirm({
		title: 'Candidate has scheduled interviews',
		icon: null,
		content: 'Cancel interviews to pseudonymize and delete candidate.',
		okText: 'Okay',
		okButtonProps: { type: 'primary' },
		cancelButtonProps: { style: { display: 'none' } }
	});
}
