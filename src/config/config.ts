export default () => {
  return {
    jwt: {
      secret: process.env.JWT_SECRET || 'supperSecret@4356',
    },
    smsProvider: {
      bulkSmsBd: {
        apiKey: process.env.BULKSMSBD_API_KEY,
        senderId: process.env.BULKSMSBD_SENDER_ID,
      },
    },
    otpValidityMin: parseInt(process.env.OTP_VALIDITY_MIN) || 3,
  };
};
