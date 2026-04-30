import type { ReactNode } from 'react';

type ContactProps = {
  name: string;
  email: string;
  message: string;
};

const EMAIL_WRAPPER_STYLE = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  maxWidth: 640,
  margin: '0 auto',
  color: '#111111',
  backgroundColor: '#ffffff',
} as const;

const EMAIL_CARD_STYLE = {
  border: '1px solid #e5e7eb',
  padding: '24px',
  backgroundColor: '#ffffff',
} as const;

const EMAIL_META_LABEL_STYLE = {
  width: '34%',
  padding: '6px 0',
  color: '#4b5563',
  verticalAlign: 'top' as const,
} as const;

const EMAIL_META_VALUE_STYLE = {
  padding: '6px 0',
  color: '#111111',
} as const;

const EMAIL_FOOTER_STYLE = {
  marginTop: '24px',
  paddingTop: '16px',
  borderTop: '1px solid #e5e7eb',
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: 1.6,
} as const;

function buildReference(prefix: string, primary: string) {
  const safePrimary = primary.trim().replace(/\s+/g, ' ').slice(0, 18);
  const slug = safePrimary
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'REQUEST';

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 12);

  return `${prefix}-${slug}-${timestamp}`;
}

type EmailMetaRow = {
  label: string;
  value: ReactNode;
};

type EmailShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

type EmailMetaTableProps = {
  title: string;
  rows: EmailMetaRow[];
};

type EmailSectionProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  highlighted?: boolean;
};

type EmailFooterProps = {
  sourceLabel: string;
  sourceText: string;
  replyText: string;
};

function EmailShell({
  eyebrow,
  title,
  subtitle,
  children,
}: EmailShellProps) {
  return (
    <div style={EMAIL_WRAPPER_STYLE}>
      <div
        style={{
          ...EMAIL_CARD_STYLE,
          padding: '0',
          overflow: 'hidden',
          borderColor: '#e7dcc6',
        }}
      >
        <div
          style={{
            backgroundColor: '#131313',
            padding: '28px 28px 24px',
            borderTop: '4px solid #fbc681',
          }}
        >
          <p
            style={{
              margin: '0 0 10px',
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#fbc681',
            }}
          >
            {eyebrow}
          </p>
          <h1
            style={{
              margin: '0 0 10px',
              color: '#f8f5ef',
              fontSize: '34px',
              lineHeight: 1.15,
              fontWeight: 600,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              margin: 0,
              color: '#c8c1b5',
              fontSize: '17px',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div style={{ padding: '28px' }}>{children}</div>
      </div>
    </div>
  );
}

function EmailMetaTable({ title, rows }: EmailMetaTableProps) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#fcfaf6',
        border: '1px solid #eee3d0',
        marginBottom: '20px',
      }}
    >
      <tbody>
        <tr>
          <td
            colSpan={2}
            style={{
              padding: '16px 16px 10px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#8a6a3f',
              }}
            >
              {title}
            </div>
          </td>
        </tr>
        {rows.map((row, index) => {
          const isFirst = index === 0;
          const isLast = index === rows.length - 1;
          const cellPadding = isFirst
            ? '8px 16px 6px'
            : isLast
              ? '6px 16px 12px'
              : '6px 16px';

          return (
            <tr key={row.label}>
              <td
                style={{
                  ...EMAIL_META_LABEL_STYLE,
                  width: '32%',
                  padding: cellPadding,
                }}
              >
                <b>{row.label}</b>
              </td>
              <td
                style={{
                  ...EMAIL_META_VALUE_STYLE,
                  padding: cellPadding,
                  lineHeight: 1.65,
                }}
              >
                {row.value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function EmailSection({
  eyebrow,
  title,
  children,
  highlighted = false,
}: EmailSectionProps) {
  return (
    <div
      style={{
        marginTop: '20px',
        padding: '20px 22px',
        backgroundColor: highlighted ? '#ffffff' : '#fcfaf6',
        border: '1px solid #eee3d0',
        boxShadow: highlighted ? 'inset 4px 0 0 #fbc681' : undefined,
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontSize: '12px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#8a6a3f',
        }}
      >
        {eyebrow}
      </p>
      <h3
        style={{
          margin: '0 0 12px',
          color: '#151515',
          fontSize: highlighted ? '22px' : '18px',
          lineHeight: 1.25,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmailFooter({
  sourceLabel,
  sourceText,
  replyText,
}: EmailFooterProps) {
  return (
    <>
      <div
        style={{
          ...EMAIL_FOOTER_STYLE,
          paddingTop: '22px',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  width: '50%',
                  verticalAlign: 'top',
                  paddingRight: '24px',
                  borderRight: '1px solid #e5e7eb',
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '0',
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          width: '68px',
                          verticalAlign: 'top',
                        }}
                      >
                        <img
                          src='https://mogz.studio/imgs/logo/logo.png'
                          alt='Mogz Visuals'
                          width='54'
                          height='54'
                          style={{
                            display: 'block',
                            width: '54px',
                            height: '54px',
                            objectFit: 'contain',
                            marginTop: '2px',
                          }}
                        />
                      </td>
                      <td style={{ verticalAlign: 'top' }}>
                        <div
                          style={{
                            fontSize: '11px',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: '#8a6a3f',
                            marginBottom: '4px',
                          }}
                        >
                          Mogz Visuals
                        </div>
                        <div
                          style={{
                            color: '#111111',
                            fontSize: '28px',
                            lineHeight: 1.15,
                            fontWeight: 500,
                            marginBottom: '6px',
                          }}
                        >
                          Mogz Visuals
                        </div>
                        <div>
                          <a
                            href='https://mogz.studio'
                            style={{
                              color: '#8a6a3f',
                              textDecoration: 'none',
                              fontSize: '13px',
                              lineHeight: 1.6,
                              fontWeight: 500,
                            }}
                          >
                            mogz.studio
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td
                style={{
                  width: '50%',
                  verticalAlign: 'top',
                  paddingLeft: '24px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    fontSize: '11px',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#8a6a3f',
                  }}
                >
                  {sourceLabel}
                </p>
                <div
                  style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    lineHeight: 1.75,
                  }}
                >
                  <div
                    style={{
                      color: '#111111',
                      fontSize: '16px',
                      marginBottom: '6px',
                    }}
                  >
                    {sourceText}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: '18px',
          backgroundColor: '#131313',
          padding: '14px 24px',
          color: '#d8b37a',
          fontSize: '13px',
          lineHeight: 1.6,
          textAlign: 'center',
        }}
      >
        {replyText}
      </div>
    </>
  );
}

function BookingServiceCard({
  item,
  index,
}: {
  item: BookingEmailProps['items'][number];
  index: number;
}) {
  return (
    <div
      style={{
        marginBottom: '18px',
        padding: '22px 22px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #eee3d0',
        boxShadow: 'inset 4px 0 0 #fbc681',
      }}
    >
      <p
        style={{
          margin: '0 0 8px',
          fontSize: '12px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#8a6a3f',
        }}
      >
        Service {String(index + 1).padStart(2, '0')}
      </p>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: item.addOns.length > 0 ? '14px' : '16px',
        }}
      >
        <tbody>
          <tr>
            <td style={{ paddingRight: '16px', verticalAlign: 'top' }}>
              <h3
                style={{
                  margin: '0 0 10px',
                  fontSize: '24px',
                  lineHeight: 1.25,
                  color: '#151515',
                }}
              >
                {item.category}
              </h3>
              <p
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                  color: '#2f2f2f',
                  fontSize: '16px',
                }}
              >
                {item.packageName}
              </p>
            </td>
            <td
              style={{
                width: '120px',
                verticalAlign: 'top',
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  color: '#8a6a3f',
                  fontSize: '28px',
                  lineHeight: 1.05,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                ${item.packagePrice}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {item.addOns.length > 0 && (
        <>
          <h4
            style={{
              margin: '0 0 10px',
              color: '#151515',
              fontSize: '15px',
            }}
          >
            Add-Ons
          </h4>
          <ul
            style={{
              margin: '0 0 14px',
              paddingLeft: '20px',
              color: '#2f2f2f',
            }}
          >
            {item.addOns.map((addOn, addOnIndex) => (
              <li
                key={addOnIndex}
                style={{ marginBottom: '6px', lineHeight: 1.6 }}
              >
                {addOn.name} - ${addOn.price}
              </li>
            ))}
          </ul>
        </>
      )}

      <p
        style={{
          margin: 0,
          lineHeight: 1.6,
          color: '#151515',
          fontSize: '16px',
        }}
      >
        <b>Subtotal:</b> ${item.subtotal}
      </p>
    </div>
  );
}

function BookingTotalEstimate({ totalPrice }: { totalPrice: number }) {
  return (
    <div
      style={{
        marginTop: '24px',
        padding: '18px 22px 20px',
        backgroundColor: '#151515',
        color: '#f8f5ef',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'bottom', paddingRight: '16px' }}>
              <p
                style={{
                  margin: '0 0 6px',
                  fontSize: '12px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#d8b37a',
                }}
              >
                Total Estimate
              </p>
              <p
                style={{
                  margin: 0,
                  color: '#c8c1b5',
                  fontSize: '14px',
                  lineHeight: 1.6,
                }}
              >
                Combined booking subtotal before deposit confirmation.
              </p>
            </td>
            <td
              style={{
                width: '150px',
                verticalAlign: 'bottom',
                textAlign: 'right',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '40px',
                  lineHeight: 1.05,
                  fontWeight: 600,
                  color: '#fbc681',
                  whiteSpace: 'nowrap',
                }}
              >
                ${totalPrice}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export const getContactEmailText = ({
  name,
  email,
  message,
}: ContactProps) => {
  const reference = buildReference('ENQ', name);
  const sections = [
    'Mogz Visuals Website Enquiry',
    '',
    `Reference: ${reference}`,
    `Client Name: ${name}`,
    `Email: ${email}`,
    '',
    'Submitted via: mogz.studio contact form',
  ];

  if (message) {
    sections.push('', 'Message', message);
  }

  sections.push(
    '',
    'Mogz Visuals',
    'https://mogz.studio',
    'Reply directly to this email to respond to the sender.',
  );

  return sections.join('\n');
};

export const Contact = ({ name, email, message }: ContactProps) => {
  const reference = buildReference('ENQ', name);

  return (
    <EmailShell
      eyebrow='Mogz Visuals'
      title='Website Enquiry'
      subtitle={`New message from ${name}`}
    >
      <EmailMetaTable
        title='Enquiry Details'
        rows={[
          { label: 'Reference', value: reference },
          { label: 'Client Name', value: name },
          { label: 'Email', value: email },
          { label: 'Submitted Via', value: 'mogz.studio contact form' },
        ]}
      />

      {message && (
        <EmailSection eyebrow='Message' title='Client Message' highlighted>
          <p
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.75,
              margin: 0,
              color: '#2f2f2f',
              fontSize: '16px',
            }}
          >
            {message}
          </p>
        </EmailSection>
      )}

      <EmailFooter
        sourceLabel='Enquiry Source'
        sourceText='Submitted via Mogz Visuals website contact form'
        replyText='Reply directly to this email to respond to the sender.'
      />
    </EmailShell>
  );
};

type BookingEmailProps = {
  name: string;
  email: string;
  phone: string;
  items: {
    category: string;
    packageName: string;
    packagePrice: number;
    addOns: { name: string; price: number }[];
    subtotal: number;
  }[];
  totalPrice: number;
  date: string;
  notes?: string;
};

export const getBookingEmailText = ({
  name,
  email,
  phone,
  items,
  totalPrice,
  date,
  notes,
}: BookingEmailProps) => {
  const primaryService =
    items.length === 1 ? items[0]?.category : `${items.length} services`;
  const lines = [
    'Mogz Visuals Booking Request',
    '',
    `Service Summary: ${primaryService}`,
    `Client Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Preferred Date: ${date}`,
    'Submitted via: mogz.studio booking form',
    '',
    'Services',
  ];

  items.forEach((item, index) => {
    lines.push(
      '',
      `${index + 1}. ${item.category}`,
      `Package: ${item.packageName} - $${item.packagePrice}`,
    );

    if (item.addOns.length > 0) {
      lines.push('Add-Ons:');
      item.addOns.forEach((addOn) => {
        lines.push(`- ${addOn.name} - $${addOn.price}`);
      });
    }

    lines.push(`Subtotal: $${item.subtotal}`);
  });

  lines.push('', `Total Estimate: $${totalPrice}`);

  if (notes) {
    lines.push('', 'Notes / Special Requests', notes);
  }

  lines.push(
    '',
    'Mogz Visuals',
    'https://mogz.studio',
    'Reply directly to this email to respond to the client.',
  );

  return lines.join('\n');
};

export const BookingEmail = ({
  name,
  email,
  phone,
  items,
  totalPrice,
  date,
  notes,
}: BookingEmailProps) => {
  const heading =
    items.length === 1 ? items[0]?.category : `${items.length} Combined Services`;

  return (
    <EmailShell
      eyebrow='Mogz Visuals'
      title='New Booking Request'
      subtitle={heading}
    >
      <EmailMetaTable
        title='Booking Details'
        rows={[
          { label: 'Client Name', value: name },
          { label: 'Email', value: email },
          { label: 'Phone', value: phone },
          { label: 'Preferred Date', value: date },
          { label: 'Submitted Via', value: 'mogz.studio booking form' },
        ]}
      />

      {items.map((item, index) => (
        <BookingServiceCard key={index} item={item} index={index} />
      ))}

      <BookingTotalEstimate totalPrice={totalPrice} />

      {notes && (
        <EmailSection eyebrow='Notes' title='Special Requests'>
          <p
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.75,
              margin: 0,
              color: '#2f2f2f',
            }}
          >
            {notes}
          </p>
        </EmailSection>
      )}

      <EmailFooter
        sourceLabel='Booking Source'
        sourceText='Submitted via Mogz Visuals website booking form'
        replyText='Reply directly to this email to respond to the client.'
      />
    </EmailShell>
  );
};
