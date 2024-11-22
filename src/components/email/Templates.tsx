type ContactProps = {
  name: string;
  email: string;
  date: string;
  session: string;
  message: string;
};

export const Contact = ({
  name,
  email,
  date,
  session,
  message,
}: ContactProps) => {
  return (
    <div>
      <h1>Website Message from {name}</h1>
      <div>Email: {email}</div>

      <div>Date: {date}</div>
      <div>Session: {session}</div>

      <p>{message}</p>
    </div>
  );
};
