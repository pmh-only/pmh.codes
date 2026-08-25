const birthDate = new Date(2005, 0, 30);

function getAge() {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
    age--;
  }

  return age;
}

export default function Age() {
  return <span>{getAge()}</span>;
}
