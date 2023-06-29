import React, { useMemo } from 'react';
import { Menu, Dropdown, Typography } from 'antd';

//components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';
import { Phone, EnvelopeSimple, LinkedinLogo, Browser, CopySimple, ChatDots, WhatsappLogo } from 'components/icons';
import { MenuTitle } from 'components/common/Menu/MenuTitle';

//types
import { CandidateResourceAngular, CandidateLinks } from 'types/domain/candidate.types';
import { receiversEnum as messageReceiversEnum } from 'metadata/message-templates/message-templates.meta';
import { MessageReceiver, MessageEvent } from 'types/domain/message-templates.types';
import { AngularEnum } from 'types/angular-enum';

//utils
import { useMessageTemplates } from 'hooks/angular/messageTemplates';

//styled
import * as S from './ProfileContacts.styled';
import { MenuDescription } from 'components/common/Menu/MenuDescription';
import { ExternalLink } from 'components/common/Link/Link';
import useCopyToClipboard from 'react-use/lib/useCopyToClipboard';
import { MenuLink } from 'components/common/Link/MenuLink';

const { Link, Text } = Typography;

export type ProfileContactsProps = {
	isMobile?: boolean;
	candidate: CandidateResourceAngular;
	sendBlankEmail: (param: messageReceiversEnum) => void;
};

export function ProfileContacts({ candidate, sendBlankEmail }: ProfileContactsProps) {
	const menuLinkedInListLength = useMemo(
		() => candidate.links.filter((item) => item.fileName === 'Linkedin').length,
		[candidate.links]
	);

	const { receivers } = useMessageTemplates();
	const [text, copyToClipboard] = useCopyToClipboard();

	const candidatePhonesList = [];
	const candidateLinkedinUrlList = candidate.links.filter((item) => item.fileName === 'Linkedin');

	if (candidate.mobilePhone) {
		candidatePhonesList.push(candidate.mobilePhone);
	}

	if (candidate.phone) {
		candidatePhonesList.push(candidate.phone);
	}

	return (
		<S.ProfileContactsWrapper isMobile>
			<Stack wrap={false} spacing="extraLoose" alignment="center">
				{menuLinkedInListLength > 0 && (
					<Dropdown
						trigger={['click']}
						overlay={renderLinkedinListMenu(candidateLinkedinUrlList, copyToClipboard)}
						placement="bottom"
					>
						<Button neutral type="text" icon={<LinkedinLogo style={{ fontSize: '24px' }} />} />
					</Dropdown>
				)}
				{candidate.email && (
					<Dropdown
						trigger={['click']}
						overlay={renderMailMenu(candidate.email, sendBlankEmail, receivers, copyToClipboard)}
					>
						<Button neutral type="text" icon={<EnvelopeSimple style={{ fontSize: '24px' }} />} />
					</Dropdown>
				)}
				{candidatePhonesList.length && (
					<Dropdown
						trigger={['click']}
						overlay={renderPhoneAntMenu(candidatePhonesList, copyToClipboard)}
						placement="bottomRight"
					>
						<Button neutral type="text" icon={<Phone style={{ fontSize: '24px' }} />} />
					</Dropdown>
				)}
			</Stack>
		</S.ProfileContactsWrapper>
	);
}

function renderLinkedinListMenu(linkedinUrls: CandidateLinks[], copyToClipboard: (value: string) => void) {
	return (
		<Menu>
			<MenuTitle title="Linkedin" />
			{linkedinUrls.map(({ url }) => {
				const clearLink = url.replace(/^https?:\/\//, '').replace('www.', '');
				return (
					<Menu.SubMenu key={`SubMenuFor_${clearLink}`} title={clearLink}>
						<Menu.Item
							key={`copyableText_${clearLink}`}
							onClick={() => copyToClipboard(clearLink)}
							icon={<CopySimple />}
						>
							Copy link
						</Menu.Item>
						<MenuLink key={clearLink} icon={<Browser />}>
							<ExternalLink href={`https://${clearLink}`}>Go to linkedin.com</ExternalLink>
						</MenuLink>
					</Menu.SubMenu>
				);
			})}
		</Menu>
	);
}

function renderMailMenu(
	candidateEmail: string,
	sendBlankEmail: (param: messageReceiversEnum) => void,
	receivers: AngularEnum<MessageReceiver>,
	copyToClipboard: (value: string) => void
) {
	return (
		<Menu>
			<MenuTitle title={candidateEmail} />
			<Menu.Item
				key={`copyableText_${candidateEmail}`}
				onClick={() => copyToClipboard(candidateEmail)}
				icon={<CopySimple />}
			>
				Copy link
			</Menu.Item>
			<Menu.Item
				key="learnMoreLink"
				onClick={() => sendBlankEmail(receivers.enumId.CANDIDATE)}
				icon={<EnvelopeSimple />}
			>
				Compose...
			</Menu.Item>
		</Menu>
	);
}

function renderPhoneAntMenu(candidatePhonesList: string[], copyToClipboard: (value: string) => void) {
	candidatePhonesList.forEach((item) => {
		return item.replace(/[^0-9]/g, '');
	});

	function submenuItem(phone: string) {
		return (
			<>
				<Menu.Item key={`copyableText_${phone}`} onClick={() => copyToClipboard(phone)} icon={<CopySimple />}>
					Copy number
				</Menu.Item>
				<MenuLink key={`filteredPhone_${phone}`} icon={<Phone />}>
					<ExternalLink href={`tel:${phone}`}>Call</ExternalLink>
				</MenuLink>
				<MenuLink key={`sms_${phone}`} icon={<ChatDots />}>
					<ExternalLink href={`sms:${phone}`}>Text (SMS)</ExternalLink>
				</MenuLink>
				<MenuLink key={`whatsapp_${phone}`} icon={<WhatsappLogo />}>
					<ExternalLink href={`https://wa.me/${phone}`}>Whatsapp</ExternalLink>
				</MenuLink>
			</>
		);
	}

	return (
		<Menu>
			<MenuTitle title="Phone" />
			{candidatePhonesList.map((item) => {
				return (
					<Menu.SubMenu key={`SubMenuFor_${item}`} title={item}>
						{submenuItem(item)}
					</Menu.SubMenu>
				);
			})}
			<Menu.Divider key="divider" />
			<MenuDescription key="Description">
				Phone number must <br /> include the country <br /> code.
			</MenuDescription>
			<Menu.Item key="learnMoreLink">
				<ExternalLink href="https://help.comeet.com/">Learn more</ExternalLink>
			</Menu.Item>
		</Menu>
	);
}
