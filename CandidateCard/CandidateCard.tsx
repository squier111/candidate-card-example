import React from 'react';
import { isMobileOnly } from 'react-device-detect';

//layout
import { CandidateCardMobileLayout } from './layout/CandidateCardMobileLayout';
import { CandidateCardDesktopLayout } from './layout/CandidateCardDesktopLayout';

//types
import { ApplicationProps } from './sections/Process/components/Application/Application';

//local components
import { ProfileProps } from './sections/Profile/Profile';
import { DuplicatesCallbackProps } from './sections/Duplicates/Duplicates';
import { DetailsProps } from './sections/Process/components/Details/Details';

export type CandidateCardProps = DuplicatesCallbackProps & ProfileProps & ApplicationProps & DetailsProps;

export function CandidateCard(props: CandidateCardProps) {
	if (isMobileOnly) {
		return <CandidateCardMobileLayout {...props} />;
	}

	return <CandidateCardDesktopLayout {...props} />;
}
