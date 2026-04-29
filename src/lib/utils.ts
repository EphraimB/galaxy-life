export const calculateAge = (birthdate: string, yearMultiplier: number = 1.0) => {
  const birthDateObj = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  // Calculate exact days to be more precise with planetary years
  const diffTime = Math.abs(today.getTime() - birthDateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const earthYears = diffDays / 365.25;
  
  return (earthYears * yearMultiplier).toFixed(1);
};
