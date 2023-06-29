import React from "react";

// components
import Alert from 'components/common/Alert/Alert';
import { Warning } from "components/icons";

// types
import { DiscussionMessage } from 'types/domain/discussion.types';

// metadata
import { DeliveryStatus } from 'metadata/discussion/discussion.meta';

type ActivityEventEmailDeliveryStatusFailProps = {
	message: DiscussionMessage;
};

export const ActivityEventEmailDeliveryStatusFail = ({ message }: ActivityEventEmailDeliveryStatusFailProps) => {
  const bouncedEmails = message.deliveryStatus.filter(recipientDeliveryStatus => {
    return recipientDeliveryStatus.status === DeliveryStatus.BOUNCE
  }).map(bouncedRecipient => bouncedRecipient.recipient);

  const droppedEmails = message.deliveryStatus.filter(recipientDeliveryStatus => {
    return recipientDeliveryStatus.status === DeliveryStatus.DROP
  }).map(bouncedRecipient => bouncedRecipient.recipient);

  const spamEmails = message.deliveryStatus.filter(recipientDeliveryStatus => {
    return recipientDeliveryStatus.status === DeliveryStatus.SPAM
  }).map(bouncedRecipient => bouncedRecipient.recipient);

  const failedEmails = message.deliveryStatus.filter(recipientDeliveryStatus => {
    return recipientDeliveryStatus.status === DeliveryStatus.FAILED
  }).map(bouncedRecipient => bouncedRecipient.recipient);

  return (
    <>
      {bouncedEmails.length > 0 &&
        <Alert
          showIcon
          type="warning"
          icon={<Warning />}
          description={`This message was rejected by the recipient's email system. Please verify that the email address${bouncedEmails.length > 1 ? 'es are' : ' is'} correct: ${bouncedEmails.join(', ')}`}
        />
      }

      {droppedEmails.length > 0 &&
        <Alert
          showIcon
          type="warning"
          icon={<Warning />}
          description={`This message was rejected by the recipient's email system. Please verify that the email address${droppedEmails.length > 1 ? 'es are' : ' is'} correct: ${droppedEmails.join(', ')}`}
        />
      }

      {spamEmails.length > 0 &&
        <Alert
          showIcon
          type="warning"
          icon={<Warning />}
          description={`This message was flagged as possible spam or rejected by the recipients' email system. We recommend contacting the recipient to confirm he/she is receiving emails from Comeet, as well as verifying that the email address${spamEmails.length > 1 ? 'es are' : ' is'} correct: ${spamEmails.join(', ')}`}
        />
      }

      {failedEmails.length > 0 &&
        <Alert
          showIcon
          type="warning"
          icon={<Warning />}
          description={`The message to ${failedEmails.join(' and ')} was not delivered`}
        />
      }
    </>
  )
}
