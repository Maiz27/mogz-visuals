type ContactProps = {
  name: string;
  email: string;
  message: string;
};

export const Contact = ({ name, email, message }: ContactProps) => {
  return (
    <div>
      <h1>Website Message from {name}</h1>
      <div>Email: {email}</div>

      <p>{message}</p>
    </div>
  );
};
