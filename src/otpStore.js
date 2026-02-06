const otpMap = new Map();

export function saveOTP(email, otp) {
  otpMap.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
  });
}

export function updateOtp(email, newOtp) {
  const existingData = otpMap.get(email);
  console.log(existingData ? existingData : "there is no existing data");

  if (!existingData) return false;

  otpMap.set(email, {
    ...existingData,
    otp: newOtp,
  });

  return true;
}

export function getOTP(email) {
  return otpMap.get(email);
}

export function removeOTP(email) {
  return otpMap.delete(email);
}

// module.exports = {
//   saveOTP,
//   updateOtp,
//   getOTP,
//   removeOTP,
// };
