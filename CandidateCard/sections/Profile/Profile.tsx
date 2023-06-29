import React from 'react';
import { Divider, Affix } from 'antd';
import { isMobile, isMobileOnly } from 'react-device-detect';

// components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Heading } from 'components/common/Typography/Heading';
import { ShoppingBagOpen, CaretLeft } from 'components/icons';

import { CandidateProfileAvatar } from 'pages/Candidate/common/CandidateProfileAvatar';

// local components
import { CandidateName } from './components/CandidateName';
import { ProfileTags } from './components/ProfileTags/ProfileTags';
import { ProfileContacts } from './components/ProfileContacts/ProfileContacts';
import { ProfileActions, ProfileActionsCallbackProps } from './components/ProfileActions/ProfileActions';
import { ProfilePosition } from './components/ProfilePosition/ProfilePosition';
import { SourceProfile } from './components/SourceProfile/SourceProfile';

//hooks
import { useMobileSupport } from 'hooks/angular/mobile-support';

//types
import { ProfileContactsProps } from './components/ProfileContacts/ProfileContacts';
import { SourceProfileProps } from './components/SourceProfile/SourceProfile';

//utils
import { useCandidates } from 'hooks/angular/candidates';

// styled
import * as S from './Profile.styled';

export type ProfileProps = {
	afterUpload: () => void;
	removeAvatar: () => void;
} & ProfileActionsCallbackProps &
	ProfileContactsProps &
	SourceProfileProps;

export function Profile({
	candidate,
	afterUpload,
	removeAvatar,
	moveReq,
	addToAnotherPosition,
	lookForDuplicates,
	printCandidateCard,
	sendBlankEmail,
	setStatus,
	setFavorite,
	requestExposure,
	readOnly
}: ProfileProps) {
	console.log('candidate', candidate);
	const { UploadFileUrl: createUploadAvatarUrl } = useCandidates();
	const mobileSupportService = useMobileSupport();

	function ProfileHeader() {
		return (
			<Stack wrap={false} spacing="loose" alignment="leading" distribution="equalSpacing">
				<Stack vertical={isMobileOnly} wrap={false} spacing="loose" alignment="leading" distribution="equalSpacing">
					<Stack wrap={false} spacing="extraTight" alignment="center" distribution="equalSpacing">
						{isMobile && (
							<Button
								neutral
								type="text"
								onClick={() => {
									mobileSupportService.toggleLayout();
								}}
								icon={<CaretLeft weight="bold" />}
							/>
						)}
						<CandidateProfileAvatar
							size={isMobileOnly ? 'small' : 'large'}
							pictureUlr={candidate.picThumbUrl ?? null}
							showFeedbackIconWhenUploaded={false}
							afterUpload={afterUpload}
							uploadProps={{
								action: createUploadAvatarUrl(candidate.id),
								onRemove: removeAvatar
							}}
						/>
						{isMobileOnly && <CandidateName name={candidate.fullName} />}
					</Stack>
					<Stack vertical spacing="tight">
						{!isMobileOnly && <CandidateName name={candidate.fullName} />}
						<ProfileTags person={candidate.person} />
					</Stack>
				</Stack>
				<ProfileContacts candidate={candidate} sendBlankEmail={sendBlankEmail} />
			</Stack>
		);
	}

	return (
		<>
			{isMobileOnly ? (
				<Affix>
					<S.FixedHeaderBar>{ProfileHeader()}</S.FixedHeaderBar>
				</Affix>
			) : (
				<S.ProfileLayout isMobile={isMobile}>
					{ProfileHeader()}
					<Divider />
				</S.ProfileLayout>
			)}
			<S.ProfileLayout isMobile={isMobile} isMobileOnly={isMobileOnly}>
				<Stack
					vertical={isMobile}
					wrap={true}
					spacing="tight"
					alignment={isMobile ? 'fill' : 'center'}
					distribution="equalSpacing"
				>
					<Stack vertical={isMobileOnly} wrap={false} spacing="tight" alignment={isMobileOnly ? 'leading' : 'center'}>
						<Stack wrap={false} spacing="tight">
							<ShoppingBagOpen style={{ fontSize: '20px', lineHeight: '20px' }} weight="bold" />
							<ProfilePosition candidate={candidate} />
						</Stack>
						<SourceProfile candidate={candidate} sendBlankEmail={sendBlankEmail} requestExposure={requestExposure} />
					</Stack>
					<Stack.Item fill={isMobile}>
						<ProfileActions
							isMobile={isMobile}
							isFavorite={candidate.isFavorite}
							statusId={candidate.status}
							moveReq={moveReq}
							setFavorite={setFavorite}
							addToAnotherPosition={addToAnotherPosition}
							lookForDuplicates={lookForDuplicates}
							printCandidateCard={printCandidateCard}
							setStatus={setStatus}
							readOnly={readOnly}
						/>
					</Stack.Item>
				</Stack>
			</S.ProfileLayout>
		</>
	);
}
