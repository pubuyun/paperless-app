import React from 'react';
import { MuiMarkdown, getOverrides } from 'mui-markdown';
import { Message } from '@/types/message'

export const MessageContent = ({ message }: { message: Message }) => {
  const commonStyles = {
    color: "inherit",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap"
  };

  return message.role === "user" ? message.content : (
    <MuiMarkdown
      overrides={{
        ...getOverrides(),
        p: { props: { style: commonStyles } },
        // h1: { props: { style: commonStyles } },
        // h2: { props: { style: commonStyles } },
        // h3: { props: { style: commonStyles } },
        // h4: { props: { style: commonStyles } },
        // h5: { props: { style: commonStyles } },
        // h6: { props: { style: commonStyles } },
        // li: { props: { style: commonStyles } },
        // blockquote: { props: { style: commonStyles } },
        // code: { props: { style: commonStyles } },
        // pre: { props: { style: commonStyles } }
      }}
    >
      {message.content}
    </MuiMarkdown>
  );
};

    // <MuiMarkdown
    //   overrides={{
    //     ...getOverrides(), // This will keep the other  default overrides.
    //     h1: {
    //       component: 'p',
    //       props: {
    //         style: { color: 'red' },
    //       } as React.HTMLProps<HTMLParagraphElement>,
    //     },
    //   }}
    // >
    //   {`# Hello markdown!`}
    // </MuiMarkdown>


