import React from 'react';

// components
import { MapPinLine, VideoCamera, Phone } from 'components/icons';
import { InterviewMethodEnum } from 'metadata/candidate/workflow.meta';

type InterviewMethodIconProps = {
	status: InterviewMethodEnum;
};

const {OTHER, IN_PERSON, PHONE, VIDEO } = InterviewMethodEnum;

const iconVariantMap: { [key in InterviewMethodEnum]: JSX.Element | null } = {
	[OTHER]: null,
	[IN_PERSON]: <MapPinLine />,
	[PHONE]: <Phone />,
	[VIDEO]: <VideoCamera />
};

export function InterviewMethodIcon({ status }: InterviewMethodIconProps) {
	return iconVariantMap[status] as JSX.Element;
}
