import React from 'react'
import { Typography } from 'antd';

//components
import { Button } from 'components/common/Button/Button';
import { Stack } from 'components/common/Stack/Stack';

const { Text } = Typography;

type ApplicationSection = {
		id: number;
		title: string;
		ref: HTMLDivElement | null;
}

type JumpToApplicationSectionProps = {
	sections: ApplicationSection[];
	offset?: number;
};

export function JumpToApplicationSection({ sections, offset = 0 }: JumpToApplicationSectionProps) {
	const scrollIntoViewWithOffset = (selector: HTMLDivElement, offset: number) => {
		window.scrollTo({
			behavior: 'smooth',
			top: selector.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset
		});
	};

	return (
		<Stack wrap={false} alignment="center" spacing="extraTight">
			<Text type="secondary">Jump to:</Text>
			{sections.map((section) => (
				<Button
					onClick={() => null !== section.ref && scrollIntoViewWithOffset(section.ref, offset)}
					key={section.id}
					neutral
					type="text"
				>
					{section.title}
				</Button>
			))}
		</Stack>
	);
}
