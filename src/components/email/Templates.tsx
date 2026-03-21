type ContactProps = {
  name: string;
  email: string;
  message: string;
};

export const Contact = ({ name, email, message }: ContactProps) => {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1 style={{ color: '#fbc681' }}>New Website Enquiry</h1>
      <h2>From: {name}</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <tbody>
          <tr>
            <td style={{ width: '30%' }}><b>Client Name</b></td>
            <td>{name}</td>
          </tr>
          <tr>
            <td><b>Email</b></td>
            <td>{email}</td>
          </tr>
        </tbody>
      </table>

      <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #ccc' }} />

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
  category: string;
  packageName: string;
  packagePrice: number;
  addOns: { name: string; price: number }[];
  totalPrice: number;
  date: string;
  notes?: string;
};

export const BookingEmail = ({
  name,
  email,
  phone,
  category,
  packageName,
  packagePrice,
  addOns,
  totalPrice,
  date,
  notes,
}: BookingEmailProps) => {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1 style={{ color: '#fbc681' }}>New Booking Request</h1>
      <h2>{category}</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td><b>Client Name</b></td><td>{name}</td></tr>
          <tr><td><b>Email</b></td><td>{email}</td></tr>
          <tr><td><b>Phone</b></td><td>{phone}</td></tr>
          <tr><td><b>Preferred Date</b></td><td>{date}</td></tr>
        </tbody>
      </table>

      <hr style={{ margin: '16px 0' }} />

      <h3>Package Selected</h3>
      <p>{packageName} — <b>${packagePrice}</b></p>

      {addOns.length > 0 && (
        <>
          <h3>Add-Ons</h3>
          <ul>
            {addOns.map((a, i) => (
              <li key={i}>{a.name} — ${a.price}</li>
            ))}
          </ul>
        </>
      )}

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
