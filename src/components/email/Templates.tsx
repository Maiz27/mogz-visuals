type ContactProps = {
  name: string;
  email: string;
  message: string;
};

export const getContactEmailText = ({
  name,
  email,
  message,
}: ContactProps) => {
  const sections = [
    'New Website Enquiry',
    '',
    `Client Name: ${name}`,
    `Email: ${email}`,
  ];

  if (message) {
    sections.push('', 'Message', message);
  }

  return sections.join('\n');
};

export const Contact = ({ name, email, message }: ContactProps) => {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1 style={{ color: '#fbc681' }}>New Website Enquiry</h1>
      <h2>From: {name}</h2>

      <table
        style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}
      >
        <tbody>
          <tr>
            <td style={{ width: '30%' }}>
              <b>Client Name</b>
            </td>
            <td>{name}</td>
          </tr>
          <tr>
            <td>
              <b>Email</b>
            </td>
            <td>{email}</td>
          </tr>
        </tbody>
      </table>

      <hr
        style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ccc' }}
      />

      {message && (
        <>
          <h3>Message</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{message}</p>
        </>
      )}
    </div>
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
  const lines = [
    'New Booking Request',
    '',
    `Client Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Preferred Date: ${date}`,
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
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1 style={{ color: '#fbc681' }}>New Booking Request</h1>
      <h2>
        {items.length === 1
          ? items[0]?.category
          : `${items.length} Combined Services`}
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td>
              <b>Client Name</b>
            </td>
            <td>{name}</td>
          </tr>
          <tr>
            <td>
              <b>Email</b>
            </td>
            <td>{email}</td>
          </tr>
          <tr>
            <td>
              <b>Phone</b>
            </td>
            <td>{phone}</td>
          </tr>
          <tr>
            <td>
              <b>Preferred Date</b>
            </td>
            <td>{date}</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '16px 0' }} />

      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: 20 }}>
          <h3>{item.category}</h3>
          <p>
            {item.packageName} - <b>${item.packagePrice}</b>
          </p>

          {item.addOns.length > 0 && (
            <>
              <h4>Add-Ons</h4>
              <ul>
                {item.addOns.map((addOn, addOnIndex) => (
                  <li key={addOnIndex}>
                    {addOn.name} - ${addOn.price}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p>
            <b>Subtotal:</b> ${item.subtotal}
          </p>
        </div>
      ))}

      <h2 style={{ color: '#fbc681' }}>Total Estimate: ${totalPrice}</h2>

      {notes && (
        <>
          <h3>Notes / Special Requests</h3>
          <p>{notes}</p>
        </>
      )}
    </div>
  );
};
