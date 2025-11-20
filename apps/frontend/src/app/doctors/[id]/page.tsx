interface Props {
  params: { id: string }
}

const DoctorProfilePage = ({ params }: Props) => {
  const { id } = params;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Doctor Profile</h1>
      <p>Doctor ID: {id}</p>
    </div>
  );
};

export default DoctorProfilePage;
