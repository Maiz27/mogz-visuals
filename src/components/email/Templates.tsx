import { getStringDateTime } from '@/lib/utils';

type ContactProps = {
  name: string;
  email: string;
  datetime: string;
  session: string;
  message: string;
};

export const Contact = ({
  name,
  email,
  datetime,
  session,
  message,
}: ContactProps) => {
  return (
    <div>
      <h1>Website Message from {name}</h1>
      <div>
        <b>Email:</b> {email}
      </div>

      <br />

      <div>
        <b>Date & Time:</b> {getStringDateTime(datetime)}
      </div>
      <div>
        <b>Session:</b> {session}
      </div>

      <br />

      {message && <p>{message}</p>}
    </div>
  );
};
